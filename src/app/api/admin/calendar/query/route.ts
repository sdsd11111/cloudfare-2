import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/rbac'
import { getLocalNow, formatToEcuador } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, messages, currentDate } = await req.json()
    
    let referenceDate: Date
    try {
      referenceDate = currentDate ? new Date(currentDate) : getLocalNow()
      if (isNaN(referenceDate.getTime())) throw new Error('Invalid date')
    } catch {
      referenceDate = getLocalNow()
    }

    // Fetch active operators and subcontractors
    const operators = await prisma.user.findMany({
      where: { 
        role: { in: ['OPERATOR', 'SUBCONTRATISTA'] }, 
        isActive: true 
      },
      select: { id: true, name: true, role: true }
    })

    // Fetch appointments for a generous window around referenceDate (+/- 30 days is safe for context)
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - 10)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(referenceDate)
    endDate.setDate(endDate.getDate() + 45)
    endDate.setHours(23, 59, 59, 999)

    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: { gte: startDate, lte: endDate },
        status: { not: 'CANCELADO' },
        user: { role: { in: ['OPERATOR', 'SUBCONTRATISTA'] } }
      },
      include: {
        user: { select: { name: true, id: true } }
      },
      orderBy: { startTime: 'asc' }
    })

    // Prepare context for Groq
    const context = {
      currentDate: formatToEcuador(referenceDate),
      operators: operators.map(o => `ID: ${o.id} | Nombre: ${o.name} (${o.role})`),
      appointments: appointments.map(a => ({
        operator: a.user.name,
        title: a.title,
        start: formatToEcuador(a.startTime),
        end: formatToEcuador(a.endTime),
        status: a.status
      }))
    }

    // Call Groq
    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      console.warn('AI Assistant Warning: GROQ_API_KEY is missing.')
      return NextResponse.json({ answer: 'El servicio de IA no está configurado (falta GROQ_API_KEY). Por favor contacta al administrador.' }, { status: 200 })
    }

    const systemPrompt = `Eres el "Asistente Ejecutivo" de Aquatech. 
Tu única función es reportar la disponibilidad exacta del equipo.

FECHA ACTUAL: ${context.currentDate}

EQUIPO REGISTRADO (TOTAL):
${context.operators.join('\n- ')}

AGENDA DE EVENTOS:
${JSON.stringify(context.appointments)}

REGLAS DE ORO:
1. Para CADA persona del "EQUIPO REGISTRADO":
   - Si tiene una tarea a la hora consultada en la "AGENDA DE EVENTOS", está OCUPADO.
   - Si NO tiene ninguna tarea a esa hora (o ni siquiera aparece en la agenda), está LIBRE.
2. IMPORTANTE: Si solo ves a una persona ocupada en la agenda, significa que TODOS LOS DEMÁS de la lista "EQUIPO REGISTRADO" están LIBRES. No digas que no hay más registrados.
3. Formato obligatorio: 
   - Usa SIEMPRE listas con viñetas (bullet points) y listas ordenadas para organizar la información de forma visual, clara y estructurada.
   - Ejemplo:
     * **LIBRES:** Juan, Pedro, María
     * **OCUPADOS:** 
       - **Carlos** (Tarea: Mantenimiento)
4. NO SALUDES ni des introducciones. Sé extremadamente breve, ordenado y usa Markdown.
5. AGENDAMIENTO: Si el usuario quiere crear una cita o agendar a alguien, verifica que tengas: ID del Operador (basado en el nombre), Título de la tarea, Hora de inicio y Hora de fin. Si te falta alguno (como la hora o quién), PREGÚNTALE AL USUARIO qué falta. Si tienes todo, usa la herramienta "crear_cita" provista.`

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || (query ? [{ role: 'user', content: query }] : []))
    ]

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
        tools: [
          {
            type: "function",
            function: {
              name: "crear_cita",
              description: "Programa una cita o evento en la agenda de un operador.",
              parameters: {
                type: "object",
                properties: {
                  operatorId: { type: "integer", description: "El ID numérico del operador obtenido de EQUIPO REGISTRADO." },
                  title: { type: "string", description: "Título breve de la tarea/cita." },
                  startTime: { type: "string", description: "Fecha y hora de inicio en formato ISO 8601 (Ej: 2026-04-10T15:00:00.000Z). Debe considerar la fecha actual para deducir 'mañana' o el día correspondiente." },
                  endTime: { type: "string", description: "Fecha y hora de finalización en formato ISO 8601." },
                  description: { type: "string", description: "Descripción detallada (opcional)." }
                },
                required: ["operatorId", "title", "startTime", "endTime"]
              }
            }
          }
        ],
        tool_choice: "auto",
        temperature: 0.1,
        max_tokens: 1000
      })
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('Groq Error:', errorText)
      return NextResponse.json({ error: 'Error calling AI service' }, { status: 502 })
    }

    const data = await groqResponse.json()
    const responseMessage = data.choices[0].message
    
    // Check if the AI wants to call a tool
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0]
      if (toolCall.function.name === 'crear_cita') {
        const args = JSON.parse(toolCall.function.arguments)
        
        // 1. Verify Collision
        const start = new Date(args.startTime)
        const end = new Date(args.endTime)
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
           return NextResponse.json({ answer: 'Hubo un error interpretando la hora ingresada. ¿Podrías ser más específico con el formato de fecha?' })
        }
        
        const collision = await prisma.appointment.findFirst({
           where: {
             userId: args.operatorId,
             status: { not: 'CANCELADO' },
             OR: [
               { startTime: { lt: end }, endTime: { gt: start } }
             ]
           }
        })
        
        if (collision) {
           return NextResponse.json({ 
             answer: `⚠️ **¡Atención! Choque de horarios detectado.**\n\nEl operador seleccionado ya tiene la tarea **"${collision.title}"** agendada en ese rango horario (${formatToEcuador(collision.startTime)}). Por seguridad, la cita nueva ha sido denegada. Intenta con un horario diferente o reasígnalo a otro equipo.` 
           })
        }
        
        // 2. Safe to create
        await prisma.appointment.create({
          data: {
            userId: args.operatorId,
            projectId: null,
            title: args.title,
            description: args.description || '',
            startTime: start,
            endTime: end,
            status: 'PENDIENTE',
          }
        })
        
        return NextResponse.json({ 
          answer: `✅ **¡Cita agendada exitosamente!**\n\nHe registrado la tarea **"${args.title}"** sin conflictos de horario en el calendario.`,
          reloadCalendar: true 
        })
      }
    }

    const answer = responseMessage.content

    return NextResponse.json({ answer })

  } catch (error: any) {
    console.error('Calendar Query API Error:', error)
    return NextResponse.json({ error: 'Error interno al procesar la consulta' }, { status: 500 })
  }
}

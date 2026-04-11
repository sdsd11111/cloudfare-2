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
Tu función es reportar la disponibilidad exacta del equipo Y ayudar a agendar citas.

UBICACIÓN ACTUAL: Loja, Ecuador (Zona Horaria: -05:00).
SUCURSALES DE AQUATECH:
- **Matriz Loja**: (Donde estamos actualmente)
- **Malacatos**
- **Yantzaza**
- **Vilcabamba**

FECHA Y HORA ACTUAL EN ECUADOR: ${context.currentDate}

EQUIPO REGISTRADO (TOTAL):
${context.operators.join('\n- ')}

AGENDA DE EVENTOS:
${JSON.stringify(context.appointments)}

REGLAS DE ORO (CONSULTAS):
1. Para CADA persona del "EQUIPO REGISTRADO":
   - Si tiene una tarea a la hora consultada en la "AGENDA DE EVENTOS", está OCUPADO.
   - Si NO tiene ninguna tarea a esa hora (o ni siquiera aparece en la agenda), está LIBRE.
2. IMPORTANTE: Si solo ves a una persona ocupada en la agenda, significa que TODOS LOS DEMÁS de la lista "EQUIPO REGISTRADO" están LIBRES. No digas que no hay más registrados.
3. Formato obligatorio: 
   - Usa SIEMPRE listas con viñetas (bullet points) y listas ordenadas.
   - Ejemplo:
     * **LIBRES:** Juan, Pedro, María
     * **OCUPADOS:** 
       - **Carlos** (Tarea: Mantenimiento)
4. NO SALUDES ni des introducciones. Sé extremadamente breve, ordenado y usa Markdown.

REGLAS DE AGENDAMIENTO (CRÍTICAS — CUMPLIR AL 100%):
5. Para agendar una cita necesitas EXACTAMENTE estos 4 datos del ÚLTIMO mensaje del usuario (NO de mensajes anteriores):
   a) **Nombre del operador** (debe coincidir EXACTAMENTE con alguien del EQUIPO REGISTRADO)
   b) **Título de la tarea** (dicho explícitamente por el usuario, ej: "Mantenimiento de piscina")
   c) **Hora de inicio** (fecha y hora exacta)
   d) **Hora de fin** (fecha y hora exacta)

6. **PROHIBIDO INVENTAR DATOS — TOLERANCIA CERO**:
   - NUNCA inventes títulos. Si el usuario no dijo un título específico, PREGUNTA.
   - NUNCA asumas hora de fin ni duración.
   - NUNCA uses datos de mensajes anteriores para auto-completar campos que el usuario no repitió.
   - NUNCA interpretes saludos ("hola", "ok", "sí", "bueno") como datos o confirmaciones para agendar.
   - Si el mensaje del usuario es un saludo, pregunta genérica, o texto ambiguo: RESPONDE normalmente SIN llamar a crear_cita.

7. Si te falta CUALQUIERA de los 4 datos, DEBES preguntar qué falta. NO llames a crear_cita.

8. ANTES de llamar a crear_cita, SIEMPRE muestra un RESUMEN así y pide confirmación explícita:
   "📋 **Resumen de cita a crear:**
   - **Operador:** [nombre]
   - **Tarea:** [título]
   - **Inicio:** [fecha y hora]
   - **Fin:** [fecha y hora]
   
   Escribe **confirmar** para proceder."

   Solo llama a crear_cita si el usuario responde EXACTAMENTE "confirmar", "sí confirmo", "confirmo" o similar.

9. Si el usuario te da datos ambiguos (ej: "en la tarde", "más tarde"), pide que sea ESPECÍFICO.

10. Si el usuario responde algo que NO es una confirmación clara (como "hola", "ok", "bueno", cualquier texto random), NO procedas a crear la cita. Pregunta de nuevo si desea confirmar.`

    // Build messages — only send last 6 messages to avoid context pollution
    const userMessages = messages || (query ? [{ role: 'user', content: query }] : [])
    const trimmedMessages = userMessages.length > 6 ? userMessages.slice(-6) : userMessages
    
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...trimmedMessages
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
              description: "Programa una cita SOLO después de que el usuario haya escrito 'confirmar' explícitamente tras ver el resumen. NUNCA llamar si el usuario dijo hola, ok, sí, o cualquier texto que no sea confirmación.",
              parameters: {
                type: "object",
                properties: {
                  operatorId: { type: "integer", description: "El ID numérico del operador obtenido de EQUIPO REGISTRADO. DEBE ser un ID que exista en la lista." },
                  title: { type: "string", description: "Título breve de la tarea/cita DICHO EXPLÍCITAMENTE por el usuario. NO inventar." },
                  startTime: { type: "string", description: "Fecha y hora de inicio en formato ISO 8601." },
                  endTime: { type: "string", description: "Fecha y hora de finalización en formato ISO 8601." },
                  description: { type: "string", description: "Descripción detallada (opcional)." }
                },
                required: ["operatorId", "title", "startTime", "endTime"]
              }
            }
          }
        ],
        tool_choice: "auto",
        temperature: 0.05,
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
        
        // ========== SERVER-SIDE GUARDRAILS (AI cannot bypass these) ==========
        
        // GUARDRAIL 1: Check that the LAST user message is a real confirmation
        const lastUserMsg = trimmedMessages.filter((m: any) => m.role === 'user').pop()
        const lastText = (lastUserMsg?.content || '').toLowerCase().trim()
        const isConfirmation = /\b(confirmar|confirmo|sí\s*confirmo|si\s*confirmo|procede|dale|hazlo)\b/i.test(lastText)
        
        if (!isConfirmation) {
          // The AI tried to create without confirmation — BLOCK IT and ask for confirmation
          const operatorName = operators.find(o => o.id === args.operatorId)?.name || 'Desconocido'
          return NextResponse.json({ 
            answer: `📋 **Resumen de cita a crear:**\n- **Operador:** ${operatorName}\n- **Tarea:** ${args.title}\n- **Inicio:** ${args.startTime}\n- **Fin:** ${args.endTime}\n\n✏️ Escribe **"confirmar"** para proceder, o **"cancelar"** para descartar.` 
          })
        }
        
        // GUARDRAIL 2: Validate operator exists in the database
        const validOperator = operators.find(o => o.id === args.operatorId)
        if (!validOperator) {
          return NextResponse.json({ 
            answer: `❌ **Error:** El operador con ID ${args.operatorId} no existe en el sistema. Los operadores disponibles son:\n${operators.map(o => `- ${o.name}`).join('\n')}\n\n¿A cuál deseas agendar?` 
          })
        }
        
        // GUARDRAIL 3: Validate dates
        const start = new Date(args.startTime)
        const end = new Date(args.endTime)
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
           return NextResponse.json({ answer: '❌ Hubo un error interpretando la hora. ¿Podrías ser más específico con el formato de fecha y hora?' })
        }
        
        if (end <= start) {
           return NextResponse.json({ answer: '❌ La hora de fin debe ser posterior a la hora de inicio. Indícame las horas correctas.' })
        }

        // GUARDRAIL 4: Reject suspicously generic titles
        const genericTitles = ['tarea', 'cita', 'reunión', 'reunion', 'tarea programada', 'evento', 'actividad', 'hola', 'test', 'prueba']
        if (genericTitles.includes(args.title.toLowerCase().trim())) {
          return NextResponse.json({ 
            answer: `❌ El título **"${args.title}"** es muy genérico. ¿Podrías darme un título más descriptivo para la tarea? (ej: "Mantenimiento de bomba", "Instalación de filtro")` 
          })
        }
        
        // GUARDRAIL 5: Check collision
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
             answer: `⚠️ **¡Choque de horarios detectado!**\n\n**${validOperator.name}** ya tiene la tarea **"${collision.title}"** agendada en ese rango horario (${formatToEcuador(collision.startTime)}). Intenta con un horario diferente.` 
           })
        }
        
        // ALL GUARDRAILS PASSED — Safe to create
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
          answer: `✅ **¡Cita agendada exitosamente!**\n\n- **Operador:** ${validOperator.name}\n- **Tarea:** ${args.title}\n- **Inicio:** ${formatToEcuador(start)}\n- **Fin:** ${formatToEcuador(end)}`,
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


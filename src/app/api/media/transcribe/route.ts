import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { audio, ext } = await req.json()

    if (!audio) {
      return NextResponse.json({ error: 'No se recibió audio' }, { status: 400 })
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json({ error: 'Configuración de IA faltante' }, { status: 500 })
    }

    // Decode Base64 string to Node.js Buffer
    const buffer = Buffer.from(audio, 'base64')
    
    if (buffer.byteLength < 250) {
      return NextResponse.json({ error: 'Audio demasiado corto o vacío' }, { status: 400 })
    }

    // Use FormData with Blob for Groq compatibility
    const groqFormData = new FormData()
    const audioBlob = new Blob([buffer])
    
    groqFormData.append('file', audioBlob, `audio.${ext || 'm4a'}`)
    groqFormData.append('model', 'whisper-large-v3-turbo')
    groqFormData.append('language', 'es')

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: groqFormData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      console.error('Groq API Error Detail:', errorData)
      return NextResponse.json({ 
        error: 'Groq rechazó el archivo analizado', 
        details: errorData.error?.message || 'Error en Groq'
      }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json({ text: result.text })

  } catch (error: any) {
    console.error('Transcription Route Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

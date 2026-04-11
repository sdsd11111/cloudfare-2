import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as Blob
    const model = 'whisper-large-v3'

    if (!file) {
      return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 })
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json({ error: 'Configuración de IA faltante' }, { status: 500 })
    }

    // Prepare Groq request
    const groqFormData = new FormData()
    
    let extension = 'm4a' // Default fallback for generic blobs without type
    if (file.type) {
      if (file.type.includes('webm')) extension = 'webm'
      else if (file.type.includes('mp4')) extension = 'm4a'
      else if (file.type.includes('ogg')) extension = 'ogg'
      else if (file.type.includes('wav')) extension = 'wav'
      else if (file.type.includes('mpeg')) extension = 'mp3'
    }

    const audioContent = new File([file], `audio.${extension}`, { type: file.type || 'audio/m4a' })
    groqFormData.append('file', audioContent)
    groqFormData.append('model', model)
    groqFormData.append('language', 'es') // Spanish as default

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: groqFormData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      console.error('Groq API Error Detail:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      return NextResponse.json({ 
        error: 'Error en la transcripción IA', 
        details: errorData.error?.message || 'Error en la API de Groq'
      }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json({ text: result.text })

  } catch (error: any) {
    console.error('Transcription Route Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

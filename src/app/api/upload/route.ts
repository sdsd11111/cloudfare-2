import { NextResponse } from 'next/server'
import { uploadToBunny } from '@/lib/bunny'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 50MB limit to prevent storage abuse
    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx. 50MB)' }, { status: 413 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Using a temp folder per user
    const folder = `projects/temp_${session.user.id}`
    const url = await uploadToBunny(buffer, file.name, folder)

    // Determine type for our frontend schema
    let type = 'DOCUMENT'
    if (file.type.startsWith('image/')) type = 'IMAGE'
    else if (file.type.startsWith('video/')) type = 'VIDEO'

    return NextResponse.json({
      url,
      filename: file.name,
      mimeType: file.type,
      type
    })
  } catch (error: any) {
    console.error('File upload failed:', error)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}

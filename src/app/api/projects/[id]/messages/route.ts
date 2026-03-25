import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { uploadToBunny } from '@/lib/bunny'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      
    const { phaseId, content, type, lat, lng, media } = await req.json()
    const projectId = Number(id)
    const userId = Number(session.user.id)

    let mediaUrl = null
    if (media && media.base64) {
      const buffer = Buffer.from(media.base64.split(',')[1], 'base64')
      mediaUrl = await uploadToBunny(buffer, media.filename || 'upload.jpg', `projects/${projectId}/chat`)
    }

    const msg = await prisma.chatMessage.create({
      data: {
        projectId,
        userId,
        phaseId: phaseId ? Number(phaseId) : null,
        content: content || (mediaUrl || media?.url ? '' : null),
        type: type || (mediaUrl || media?.url ? 'IMAGE' : 'TEXT'),
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        media: (mediaUrl || (media && media.url)) ? {
          create: {
            url: mediaUrl || media.url,
            filename: media.filename || 'upload.jpg',
            mimeType: media.mimeType || 'image/jpeg'
          }
        } : undefined
      }
    })

    return NextResponse.json(msg)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error sending message' }, { status: 500 })
  }
}

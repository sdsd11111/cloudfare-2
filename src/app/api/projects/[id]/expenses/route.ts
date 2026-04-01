import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { uploadToBunny } from '@/lib/bunny'
import { getLocalNow } from '@/lib/date-utils'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      
    const { amount, description, date, createdAt, lat, lng, receiptPhoto } = await req.json()
    const projectId = Number(id)
    const userId = Number(session.user.id)
    const expenseDate = new Date(date || createdAt || getLocalNow())

    let receiptUrl = null
    if (receiptPhoto && typeof receiptPhoto === 'string' && receiptPhoto.startsWith('data:image')) {
      try {
        const base64Data = receiptPhoto.split(',')[1]
        const buffer = Buffer.from(base64Data, 'base64')
        const filename = `expense_${Date.now()}.jpg`
        const folder = `projects/${id}/expenses`
        receiptUrl = await uploadToBunny(buffer, filename, folder)
      } catch (uploadError) {
        console.error('Failed to upload expense receipt to Bunny:', uploadError)
      }
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        date: expenseDate,
        projectId,
        userId,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        receiptUrl
      }
    })

    // Automatically increase the project's realCost counter
    await prisma.project.update({
      where: { id: projectId },
      data: {
        realCost: {
          increment: amount
        }
      }
    })

    // Also post it to the project chat/timeline
    await prisma.chatMessage.create({
      data: {
        projectId,
        userId,
        type: 'EXPENSE_LOG',
        content: `${session.user.name} registró un gasto: L. ${Number(amount).toFixed(2)} (${description})`,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error creating expense' }, { status: 500 })
  }
}

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      
    const { amount, description, date, lat, lng } = await req.json()
    const projectId = Number(id)
    const userId = Number(session.user.id)

    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        date: new Date(date),
        projectId,
        userId,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
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
        lng: lng ? Number(lng) : null
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error creating expense' }, { status: 500 })
  }
}

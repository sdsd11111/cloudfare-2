import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const projectId = Number(id)
    const { operatorIds } = await request.json()

    if (!Array.isArray(operatorIds)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }

    // Usar una transacción para actualizar el equipo
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar asignaciones actuales
      await tx.projectTeam.deleteMany({
        where: { projectId: projectId }
      })

      // 2. Crear las nuevas asignaciones
      if (operatorIds.length > 0) {
        await tx.projectTeam.createMany({
          data: operatorIds.map((userId: number) => ({
            projectId,
            userId
          }))
        })
      }
    })

    return NextResponse.json({ success: true, message: 'Equipo actualizado correctamente' })
  } catch (error) {
    console.error('Error actualizando equipo:', error)
    return NextResponse.json(
      { error: 'Error interno al actualizar el equipo' },
      { status: 500 }
    )
  }
}

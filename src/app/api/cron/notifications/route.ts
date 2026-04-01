import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { getLocalNow } from '@/lib/date-utils';

/**
 * RUTA DE CRON: https://dominio.com/api/cron/notifications?secret=...
 * Esta ruta debe ser llamada cada 5-10 minutos por un servicio externo (CPANEL Cron).
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Configuración de Zona Horaria (Ecuador/LatAm) mediante utilidad
    const localTime = getLocalNow();
    const now = new Date(); // Mantenemos now como UTC para comparaciones de timestamps absolutos
    const currentHour = localTime.getHours();
    const currentMinute = localTime.getMinutes();

    console.log(`Cron Notification Check: ${localTime.toISOString()} (${currentHour}:${currentMinute})`);

    const results: string[] = [];

    // --- 1. RESUMEN DIARIO (Solo entre las 6:00 AM y las 6:10 AM + PRUEBA 10:20 AM) ---
    if ((currentHour === 6 && currentMinute <= 10) || (currentHour === 10 && currentMinute >= 20 && currentMinute <= 30)) {
      const todayStart = new Date(localTime);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(localTime);
      todayEnd.setHours(23, 59, 59, 999);

      const operatorsWithTasks = await prisma.user.findMany({
        where: { role: 'OPERATOR', isActive: true },
        include: {
          appointments: {
            where: {
              startTime: { gte: todayStart, lte: todayEnd },
              status: { not: 'CANCELADO' }
            },
            orderBy: { startTime: 'asc' }
          }
        }
      });

      for (const op of operatorsWithTasks) {
        if (op.phone && op.appointments.length > 0) {
          let summary = `*Resumen del Día - Aquatech*\n\nHola ${op.name}, hoy tienes *${op.appointments.length}* tareas asignadas:\n\n`;
          
          op.appointments.forEach((apt, idx) => {
            const time = new Date(apt.startTime).toLocaleTimeString('es-EC', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true,
              timeZone: 'America/Guayaquil'
            });
            summary += `${idx + 1}. *${apt.title}* a las ${time}\n`;
          });

          summary += `\n¡Que tengas un excelente día de trabajo!`;
          
          await sendWhatsAppMessage(op.phone, summary);
          results.push(`Summary sent to ${op.name}`);
        }
      }
    }

    // --- 2. RECORDATORIOS ESCALONADOS (60, 30 y 10 minutos antes) ---
    // Buscamos citas que comiencen en el futuro cercano
    const futureLimit = new Date(now.getTime() + 70 * 60000); // Max 70 mins adelante
    
    const upcomingApts = await prisma.appointment.findMany({
      where: {
        startTime: { gte: now, lte: futureLimit },
        status: { not: 'CANCELADO' }
      },
      include: { user: true }
    });

    for (const apt of upcomingApts) {
      if (!apt.user?.phone) continue;

      const diffMs = apt.startTime.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / 60000);

      let reminderMessage = '';
      
      // Ventanas de tiempo para evitar duplicados si el cron corre cada 5-10 mins
      if (diffMins >= 58 && diffMins <= 62) {
        reminderMessage = `⏰ *Recordatorio (1 hora):* Hola ${apt.user.name}, tu tarea *"${apt.title}"* comienza en 60 minutos.`;
      } else if (diffMins >= 28 && diffMins <= 32) {
        reminderMessage = `⏰ *Recordatorio (30 min):* Hola ${apt.user.name}, tu tarea *"${apt.title}"* comienza en 30 minutos.`;
      } else if (diffMins >= 8 && diffMins <= 12) {
        reminderMessage = `⚠️ *Aviso (10 min):* Hola ${apt.user.name}, tu tarea *"${apt.title}"* está por comenzar en 10 minutos.`;
      }

      if (reminderMessage) {
        await sendWhatsAppMessage(apt.user.phone, reminderMessage);
        results.push(`Reminder (${diffMins}m) sent to ${apt.user.name} for ${apt.title}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      time: localTime.toISOString(),
      actions: results 
    });

  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

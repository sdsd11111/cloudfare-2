/**
 * Utilidades para el manejo de fechas y horas forzadas a la zona horaria de Ecuador.
 * Esto evita el desfase de UTC en servidores como Vercel.
 */

export const ECUADOR_TIMEZONE = 'America/Guayaquil';

/**
 * Obtiene un objeto Date que representa el "ahora" en la zona horaria de Ecuador.
 * Útil para registros de base de datos y comparaciones de cron.
 */
export function getLocalNow(): Date {
  const now = new Date();
  
  // Opción 1: Crear una fecha ajustada basada en el string formateado de la zona horaria
  return new Date(now.toLocaleString('en-US', { timeZone: ECUADOR_TIMEZONE }));
}

/**
 * Formatea una fecha para visualización en formato local de Ecuador (DD/MM/YYYY HH:mm).
 */
export function formatToEcuador(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  return d.toLocaleString('es-EC', {
    timeZone: ECUADOR_TIMEZONE,
    hour12: true,
    ...options
  });
}

/**
 * Convierte cualquier fecha a su representación ISO pero ajustada al desfase de Ecuador.
 * Útil para campos de entrada de fecha tipo <input type="date">.
 */
export function toEcuadorISODate(date: Date): string {
  const localDate = new Date(date.toLocaleString('en-US', { timeZone: ECUADOR_TIMEZONE }));
  return localDate.toISOString().split('T')[0];
}

/**
 * Formates a date for <input type="datetime-local"> in Ecuador timezone.
 * Returns YYYY-MM-DDTHH:mm
 */
export function formatForDateTimeInput(date: Date | string | number | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: ECUADOR_TIMEZONE
  };
  
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  const parts = formatter.formatToParts(d);
  const find = (type: string) => parts.find(p => p.type === type)?.value;
  
  return `${find('year')}-${find('month')}-${find('day')}T${find('hour')}:${find('minute')}`;
}

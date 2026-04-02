/**
 * Servicio de integración con Evolution API para envío de mensajes de WhatsApp.
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;

export async function sendWhatsAppMessage(phone: string, message: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE_NAME) {
    console.error('WhatsApp Service: Faltan credenciales de Evolution API en .env');
    return { success: false, error: 'Configuración incompleta' };
  }

  // Limpiar el número de teléfono (solo dígitos)
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Asegurar que tenga el formato que Evolution API espera (ej: 593967491847)
  // Si no tiene código de país, podrías asumir uno por defecto, pero aquí confiamos en el DB.
  
  try {
    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: message,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Evolution API Error:', errorData);
      return { success: false, error: 'Error en la respuesta de la API' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('WhatsApp Service Exception:', error.message);
    return { success: false, error: error.message };
  }
}

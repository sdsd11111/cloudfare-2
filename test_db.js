require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('--- Iniciando prueba de conexión MySQL (No-SSL) ---');
  
  // Extraer datos del DATABASE_URL o usar los parámetros directamente
  // DATABASE_URL="mysql://usuario:password@host:port/db"
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('Error: DATABASE_URL no encontrada en .env');
    return;
  }

  console.log('Intentando conectar a:', dbUrl.split('@')[1]); // Mostrar solo el host por seguridad

  try {
    const connection = await mysql.createConnection({
      uri: dbUrl,
      ssl: false, // Forzamos NO SSL
      connectTimeout: 10000
    });

    console.log('✅ CONEXIÓN EXITOSA: El servidor MySQL aceptó la conexión sin SSL.');
    
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('Prueba de consulta básica:', rows[0].result === 2 ? 'OK' : 'FALLÓ');

    await connection.end();
    console.log('Conexión cerrada correctamente.');
    
  } catch (error) {
    console.error('❌ ERROR DE CONEXIÓN:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    
    if (error.message.includes('SSL')) {
      console.log('Sugerencia: El servidor parece requerir SSL aunque intentamos desactivarlo.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('Sugerencia: El host o el puerto son incorrectos o el firewall bloquea la IP.');
    }
  }
}

testConnection();

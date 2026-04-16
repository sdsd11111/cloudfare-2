import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as mariadb from 'mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // If we are in Cloudflare/Edge or production environment, use the driver adapter
  if (process.env.NEXT_RUNTIME === 'edge' || process.env.NODE_ENV === 'production') {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("No DATABASE_URL found for Prisma edge initialization.")
    }
    
    // Parse the DATABASE_URL to extract connection details
    const dbUrl = new URL(connectionString)
    
    // Explicitly configure No-SSL connection using the MariaDB driver
    const pool = mariadb.createPool({ 
      host: dbUrl.hostname,
      port: Number(dbUrl.port) || 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1), // remove leading slash
      ssl: false,
      connectTimeout: 10000,
      connectionLimit: 10
    })
    
    const adapter = new PrismaMariaDb(pool)
    return new PrismaClient({ adapter })
  }
  
  // Local/Dev standard fallback
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Cache in ALL environments to prevent connection pool exhaustion
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

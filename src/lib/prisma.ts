import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // If we are in Cloudflare/Edge or production environment, use the driver adapter
  if (process.env.NEXT_RUNTIME === 'edge' || process.env.NODE_ENV === 'production') {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      console.warn("No DATABASE_URL found for Prisma edge initialization.")
    }
    
    // Explicitly configure No-SSL connection using the MariaDB driver (compatible with MySQL)
    const pool = mariadb.createPool({ 
      connectionString: connectionString,
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

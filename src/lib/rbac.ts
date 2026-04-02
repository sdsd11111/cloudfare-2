import { UserRole } from '@prisma/client'

export type Role = 'ADMIN' | 'ADMINISTRADORA' | 'OPERATOR' | 'SUBCONTRATISTA'

/**
 * Checks if a user role has administrative privileges.
 */
export function isAdmin(role?: string | null): boolean {
  if (!role) return false
  const r = role.toUpperCase()
  return r === 'ADMIN' || r === 'ADMINISTRADORA' || r === 'ADMINISTRADOR'
}

/**
 * Checks if a user role is a field operator.
 */
export function isOperator(role?: string | null): boolean {
  if (!role) return false
  const r = role.toUpperCase()
  return r === 'OPERATOR' || r === 'OPERADOR'
}

/**
 * Checks if a user role is a subcontractor.
 */
export function isSubcontractor(role?: string | null): boolean {
  if (!role) return false
  const r = role.toUpperCase()
  return r === 'SUBCONTRATISTA'
}

/**
 * Helper to check if a user has access to a project.
 * Managers have access to all. Operators only to those they are part of.
 */
export function canAccessProject(user: { id: string | number; role: string }, projectTeam: { userId: number }[]): boolean {
  if (isAdmin(user.role)) return true
  return projectTeam.some(member => String(member.userId) === String(user.id))
}

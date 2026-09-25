import type { Access, FieldAccess } from 'payload'

type RoleUser = { role?: 'admin' | 'editor' } | null | undefined

export const anyone: Access = () => true

export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => (user as RoleUser)?.role === 'admin'

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  const role = (user as RoleUser)?.role
  return role === 'admin' || role === 'editor'
}

export const isAdminField: FieldAccess = ({ req: { user } }) => (user as RoleUser)?.role === 'admin'

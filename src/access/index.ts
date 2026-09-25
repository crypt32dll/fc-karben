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

/**
 * Public API: only published docs. Staff (admin/editor) see drafts too.
 * Used for Posts + Pages with versions.drafts.
 */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  const role = (user as RoleUser)?.role
  if (role === 'admin' || role === 'editor') return true
  return {
    _status: {
      equals: 'published',
    },
  }
}

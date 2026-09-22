/** Route patterns used by the router and by pages that build links. */
export const routes = {
  calendar: '/',
  createEvent: '/events/new',
  event: '/events/:id',
  register: '/events/:id/register',
} as const

export const eventPath = (id: string) => `/events/${id}`
export const registerPath = (id: string) => `/events/${id}/register`

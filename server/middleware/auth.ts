import { createMiddleware } from 'hono/factory'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../routes/auth.ts'

export const authMiddleware = createMiddleware(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header || !header.startsWith('Bearer ')) {
    return c.json({ error: '未登录' }, 401)
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; username: string }
    c.set('userId' as never, payload.userId)
    c.set('username' as never, payload.username)
    await next()
  } catch {
    return c.json({ error: 'token 无效或已过期，请重新登录' }, 401)
  }
})

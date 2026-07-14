import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.ts'
import { users, categories, rooms } from '../db/schema.ts'
import { eq } from 'drizzle-orm'

export const JWT_SECRET = process.env.JWT_SECRET || 'inventory-secret-change-in-production'

const DEFAULT_CATEGORIES = [
  { name: '电子产品', color: '#45B7D1' },
  { name: '家具', color: '#96CEB4' },
  { name: '厨具', color: '#FF6B6B' },
  { name: '家电', color: '#4ECDC4' },
  { name: '书籍', color: '#4ECDC4' },
  { name: '衣物鞋包', color: '#FFA07A' },
  { name: '唱片', color: '#96CEB4' },
  { name: '影碟', color: '#FFEAA7' },
]

const DEFAULT_ROOMS = [
  { name: '客厅', icon: 'living' },
  { name: '卧室', icon: 'bedroom' },
  { name: '厨房', icon: 'kitchen' },
  { name: '书房', icon: 'study' },
  { name: '卫生间', icon: 'bathroom' },
  { name: '阳台', icon: 'balcony' },
]

export const authRouter = new Hono()

// 注册
authRouter.post('/register', async (c) => {
  const { username, password } = await c.req.json()
  if (!username || !password) return c.json({ error: '缺少用户名或密码' }, 400)
  if (username.length < 2) return c.json({ error: '用户名至少 2 个字符' }, 400)
  if (password.length < 6) return c.json({ error: '密码至少 6 位' }, 400)

  const existing = db.select().from(users).where(eq(users.username, username)).get()
  if (existing) return c.json({ error: '用户名已存在' }, 400)

  const passwordHash = await bcrypt.hash(password, 10)
  const userId = Date.now().toString()
  const now = new Date().toISOString()

  db.insert(users).values({ id: userId, username, passwordHash, createdAt: now }).run()

  // 新用户自动创建默认分类和房间
  DEFAULT_CATEGORIES.forEach(cat => {
    db.insert(categories).values({ id: `${userId}-${Date.now()}-${Math.random()}`, userId, ...cat }).run()
  })
  DEFAULT_ROOMS.forEach(room => {
    db.insert(rooms).values({ id: `${userId}-${Date.now()}-${Math.random()}`, userId, ...room }).run()
  })

  const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' })
  return c.json({ token, username }, 201)
})

// 登录
authRouter.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  if (!username || !password) return c.json({ error: '缺少用户名或密码' }, 400)

  const user = db.select().from(users).where(eq(users.username, username)).get()
  if (!user) return c.json({ error: '用户名或密码错误' }, 401)

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return c.json({ error: '用户名或密码错误' }, 401)

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
  return c.json({ token, username: user.username })
})

// 修改用户名
authRouter.put('/username', async (c) => {
  const userId = c.get('userId' as never) as string
  const { username } = await c.req.json()
  if (!username || username.length < 2) return c.json({ error: '用户名至少 2 个字符' }, 400)

  const existing = db.select().from(users).where(eq(users.username, username)).get()
  if (existing && existing.id !== userId) return c.json({ error: '用户名已存在' }, 400)

  db.update(users).set({ username }).where(eq(users.id, userId)).run()
  return c.json({ username })
})

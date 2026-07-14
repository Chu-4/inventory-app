import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { categoriesRouter } from './routes/categories.ts'
import { roomsRouter } from './routes/rooms.ts'
import { itemsRouter } from './routes/items.ts'
import './db/migrate.ts' // 启动时自动建表和初始化数据

const app = new Hono()

// 允许前端跨域请求（开发时前端跑在不同端口）
app.use('/api/*', cors())

app.route('/api/categories', categoriesRouter)
app.route('/api/rooms', roomsRouter)
app.route('/api/items', itemsRouter)

// 健康检查
app.get('/api/health', (c) => c.json({ status: 'ok' }))

const PORT = 3001
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`后端运行在 http://localhost:${PORT}`)
})

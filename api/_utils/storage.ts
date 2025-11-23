import { promises as fs } from 'fs'
import path from 'path'

const baseDir = process.env.VERCEL ? path.join('/tmp', 'fuelfriendly-data') : path.join(process.cwd(), 'server', 'data')
const ordersFile = path.join(baseDir, 'orders.json')
const usersFile = path.join(baseDir, 'users.json')
const tokensFile = path.join(baseDir, 'tokens.json')

async function ensureData() {
  try { await fs.mkdir(baseDir, { recursive: true }) } catch {}
  try { await fs.access(ordersFile) } catch { await fs.writeFile(ordersFile, '[]', 'utf-8') }
  try { await fs.access(usersFile) } catch { await fs.writeFile(usersFile, '[]', 'utf-8') }
  try { await fs.access(tokensFile) } catch { await fs.writeFile(tokensFile, '[]', 'utf-8') }
}

export async function readOrders() {
  await ensureData()
  const raw = await fs.readFile(ordersFile, 'utf-8')
  try { return JSON.parse(raw) } catch { return [] }
}

export async function writeOrders(orders: any[]) {
  await ensureData()
  await fs.writeFile(ordersFile, JSON.stringify(orders, null, 2), 'utf-8')
}

export async function readUsers() {
  await ensureData()
  const raw = await fs.readFile(usersFile, 'utf-8')
  try { return JSON.parse(raw) } catch { return [] }
}

export async function writeUsers(users: any[]) {
  await ensureData()
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf-8')
}

export async function readTokens() {
  await ensureData()
  const raw = await fs.readFile(tokensFile, 'utf-8')
  try { return JSON.parse(raw) } catch { return [] }
}

export async function writeTokens(tokens: any[]) {
  await ensureData()
  await fs.writeFile(tokensFile, JSON.stringify(tokens, null, 2), 'utf-8')
}
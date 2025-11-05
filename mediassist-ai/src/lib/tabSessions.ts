import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE_PATH = path.join(DATA_DIR, 'tab-sessions.json')

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(FILE_PATH)
  } catch {
    await fs.writeFile(FILE_PATH, JSON.stringify({ sessions: [] }, null, 2), 'utf8')
  }
}

export async function readSessions() {
  await ensure()
  const raw = await fs.readFile(FILE_PATH, 'utf8')
  try {
    return JSON.parse(raw).sessions || []
  } catch {
    return []
  }
}

export async function writeSessions(sessions:any[]) {
  await ensure()
  await fs.writeFile(FILE_PATH, JSON.stringify({ sessions }, null, 2), 'utf8')
}

export async function createSession(userId:string, email:string, role:string, ttlMs = 1000 * 60 * 60 * 24) {
  const sessions = await readSessions()
  const token = crypto.randomUUID()
  const session = { token, userId, email, role, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + ttlMs).toISOString() }
  sessions.unshift(session)
  await writeSessions(sessions)
  return session
}

export async function getSessionByToken(token:string) {
  const sessions = await readSessions()
  const s = sessions.find((x:any) => x.token === token)
  if (!s) return null
  if (new Date(s.expiresAt) < new Date()) return null
  return s
}

export async function removeSession(token:string) {
  const sessions = await readSessions()
  const filtered = sessions.filter((x:any) => x.token !== token)
  await writeSessions(filtered)
}

export default { ensure, readSessions, writeSessions, createSession, getSessionByToken, removeSession }

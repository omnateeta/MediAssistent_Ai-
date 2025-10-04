import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE_PATH = path.join(DATA_DIR, 'local-records.json')

export async function ensureStore() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    try {
      await fs.access(FILE_PATH)
    } catch {
      await fs.writeFile(FILE_PATH, JSON.stringify({ records: [] }, null, 2), 'utf8')
    }
  } catch (e) {
    // ignore
  }
}

export async function readLocalRecords() {
  await ensureStore()
  const raw = await fs.readFile(FILE_PATH, 'utf8')
  try {
    return JSON.parse(raw).records || []
  } catch {
    return []
  }
}

export async function writeLocalRecords(records: any[]) {
  await ensureStore()
  await fs.writeFile(FILE_PATH, JSON.stringify({ records }, null, 2), 'utf8')
}

export async function addLocalRecord(record: any) {
  const records = await readLocalRecords()
  records.unshift(record)
  await writeLocalRecords(records)
  return record
}

export async function getLocalRecordsByPatient(patientId: string) {
  const records = await readLocalRecords()
  return records.filter((r: any) => r.patientId === patientId)
}

export default { ensureStore, readLocalRecords, writeLocalRecords, addLocalRecord, getLocalRecordsByPatient }

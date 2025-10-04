const { PrismaClient } = require('@prisma/client')
const localStore = require('../src/lib/localStore')

const prisma = new PrismaClient()

async function main() {
  console.log('Syncing local records to DB...')
  const local = await localStore.readLocalRecords()
  if (!local || local.length === 0) {
    console.log('No local records to sync.')
    return
  }

  const failed = []
  for (const rec of local) {
    try {
      // Resolve patient profile: rec.patientId might be userId or patientProfile.id
      let patientProfile = await prisma.patientProfile.findUnique({ where: { id: rec.patientId } })
      if (!patientProfile) patientProfile = await prisma.patientProfile.findUnique({ where: { userId: rec.patientId } })
      if (!patientProfile) {
        console.warn('Skipping record; no patient profile found for', rec.patientId)
        failed.push(rec)
        continue
      }

      const created = await prisma.medicalRecord.create({
        data: {
          patientId: patientProfile.id,
          title: rec.title,
          recordType: rec.recordType,
          recordDate: rec.recordDate ? new Date(rec.recordDate) : new Date(),
          description: rec.description || null,
          attachments: rec.attachments || []
        }
      })
      console.log('Synced record to DB id=', created.id)
    } catch (e) {
      console.error('Failed to sync record', rec.id, String(e))
      failed.push(rec)
    }
  }

  await localStore.writeLocalRecords(failed)
  console.log(`Sync complete. ${local.length - failed.length} records synced, ${failed.length} remaining locally.`)
}

main()
  .catch((e) => {
    console.error('Sync failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

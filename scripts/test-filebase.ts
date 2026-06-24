import 'dotenv/config'
import { putObject, getObject } from '../server/services/filebase.ts'

async function main() {
  console.log('Writing test.json...')
  await putObject('test.json', { ok: true, ts: Date.now() })
  console.log('Reading back...')
  const data = await getObject<{ ok: boolean; ts: number }>('test.json')
  console.log('✅ Filebase OK:', JSON.stringify(data))
}

main().catch(e => console.error('❌', e.message))

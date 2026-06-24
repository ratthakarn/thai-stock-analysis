import 'dotenv/config'
import { putObject } from '../server/services/filebase.ts'
await putObject('fundflow-history.json', [])
console.log('Cleared fundflow-history.json')

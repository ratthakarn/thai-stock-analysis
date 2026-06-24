import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import https from 'https'

const BUCKET = process.env.FILEBASE_BUCKET || ''
const KEY = process.env.FILEBASE_KEY || ''
const SECRET = process.env.FILEBASE_SECRET || ''

let client: S3Client | null = null
if (KEY && SECRET && BUCKET) {
  client = new S3Client({
    endpoint: 'https://s3.filebase.io',
    region: 'us-east-1',
    credentials: { accessKeyId: KEY, secretAccessKey: SECRET },
    forcePathStyle: true,
    requestHandler: new NodeHttpHandler({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    }),
  })
}

const memCache = new Map<string, unknown>()

export async function getObject<T>(key: string): Promise<T | null> {
  if (!client) return (memCache.get(key) as T) ?? null
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
    const body = await res.Body?.transformToString()
    return body ? JSON.parse(body) : null
  } catch {
    return null
  }
}

export async function putObject(key: string, data: unknown): Promise<void> {
  if (!client) { memCache.set(key, data); return }
  await client.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  }))
}

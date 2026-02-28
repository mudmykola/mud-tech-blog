import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const versionFile = path.resolve(__dirname, '../src/data/deploy-version.json')

const normalizeSemver = value => {
  if (typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value)) return value
  return null
}

const incrementPatch = version => {
  const [major, minor, patch] = version.split('.').map(Number)
  return `${major}.${minor}.${patch + 1}`
}

const main = async () => {
  const raw = await readFile(versionFile, 'utf8')
  const parsed = JSON.parse(raw)
  const semverFromField = normalizeSemver(parsed.releaseVersion)
  const semverFromLegacy = Number.isFinite(Number(parsed.deployVersion))
    ? `0.0.${Number(parsed.deployVersion)}`
    : null
  const currentVersion = semverFromField || semverFromLegacy || '0.0.0'
  const nextVersion = incrementPatch(currentVersion)

  const updated = {
    releaseVersion: nextVersion,
    updatedAt: new Date().toISOString(),
  }

  await writeFile(versionFile, `${JSON.stringify(updated, null, 2)}\n`, 'utf8')
  // Keep output compact; deploy pipeline only needs confirmation.
  console.log(`Deploy version bumped to ${nextVersion}`)
}

main().catch(error => {
  console.error('Failed to bump deploy version:', error)
  process.exit(1)
})

/**
 * Catalog schema and fetching for dsh-compliancehub.
 *
 * The catalog is a small JSON document (see catalog/build-catalog.mjs in the
 * wwumit skill workspace) listing curated skills with their owning repo and
 * file manifest. `fetchCatalog` validates the shape and fails soft: callers
 * treat a failure as an incomplete observation, never as authoritative absence.
 */

/** One curated skill entry in a HubCatalog. */
export interface HubCatalogSkill {
  /** Kebab-case skill name (must match the skill's frontmatter `name`). */
  readonly name: string
  /** Short routing description shown by discovery consumers. */
  readonly description: string
  /** Owning GitHub repo, e.g. `wwumit/skills-compliance-intl`. */
  readonly repo: string
  /** Version from the skill package. */
  readonly version: string
  /** File manifest under `skills/<name>/` in the repo. */
  readonly files: readonly string[]
}

/** Catalog document consumed by the Hub provider. */
export interface HubCatalog {
  readonly schemaVersion: number
  readonly updatedAt: string
  readonly skills: readonly HubCatalogSkill[]
}

/** Error thrown on structurally invalid catalog payloads. */
export class CatalogError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CatalogError'
  }
}

const SCHEMA_VERSION = 1

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Validate one parsed catalog document; throws CatalogError on bad shape. */
export function parseCatalog(value: unknown): HubCatalog {
  if (!isRecord(value)) throw new CatalogError('catalog root must be an object')
  if (value.schemaVersion !== SCHEMA_VERSION) {
    throw new CatalogError(`unsupported schemaVersion ${String(value.schemaVersion)}`)
  }
  if (!Array.isArray(value.skills)) throw new CatalogError('catalog.skills must be an array')
  const skills: HubCatalogSkill[] = []
  for (const raw of value.skills) {
    if (!isRecord(raw)) throw new CatalogError('catalog skill entry must be an object')
    const name = raw.name
    const description = raw.description
    const repo = raw.repo
    if (typeof name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
      throw new CatalogError(`invalid skill name ${JSON.stringify(name)}`)
    }
    if (typeof description !== 'string' || description.length === 0) {
      throw new CatalogError(`skill ${name} missing description`)
    }
    if (typeof repo !== 'string' || !repo.includes('/')) {
      throw new CatalogError(`skill ${name} invalid repo ${JSON.stringify(repo)}`)
    }
    const files = Array.isArray(raw.files)
      ? raw.files.filter((f): f is string => typeof f === 'string')
      : []
    skills.push({
      name,
      description,
      repo,
      version: typeof raw.version === 'string' ? raw.version : '0.0.0',
      files,
    })
  }
  return { schemaVersion: SCHEMA_VERSION, updatedAt: String(value.updatedAt ?? ''), skills }
}

/** Compose an abort signal from a caller signal and a timeout. */
export function withTimeout(
  caller: AbortSignal | undefined,
  timeoutMs: number,
): { signal: AbortSignal; cleanup: () => void } {
  if (typeof AbortSignal.timeout === 'function') {
    const combined = caller
      ? AbortSignal.any([caller, AbortSignal.timeout(timeoutMs)])
      : AbortSignal.timeout(timeoutMs)
    return { signal: combined, cleanup: () => {} }
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const onAbort = () => controller.abort()
  caller?.addEventListener('abort', onAbort)
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer)
      caller?.removeEventListener('abort', onAbort)
    },
  }
}

/** Fetch the catalog JSON; returns undefined on network/validation failure. */
export async function fetchCatalog(
  catalogUrl: string,
  timeoutMs: number,
  callerSignal?: AbortSignal,
): Promise<HubCatalog | undefined> {
  const { signal, cleanup } = withTimeout(callerSignal, timeoutMs)
  try {
    const res = await fetch(catalogUrl, { signal, headers: { accept: 'application/json' } })
    if (!res.ok) return undefined
    const json: unknown = await res.json()
    return parseCatalog(json)
  } catch {
    return undefined
  } finally {
    cleanup()
  }
}

/** Fetch a text resource (e.g. SKILL.md) from a raw URL; undefined on failure. */
export async function fetchText(
  url: string,
  timeoutMs: number,
  callerSignal?: AbortSignal,
): Promise<string | undefined> {
  const { signal, cleanup } = withTimeout(callerSignal, timeoutMs)
  try {
    const res = await fetch(url, { signal })
    if (!res.ok) return undefined
    return await res.text()
  } catch {
    return undefined
  } finally {
    cleanup()
  }
}

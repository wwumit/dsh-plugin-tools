/**
 * HubProvider — a DSH skill provider that serves a curated catalog over HTTP.
 *
 * Implements the {@link SkillProvider} contract from @deepseek-ai/dsh-skill:
 *   - list(): fetch + validate the catalog, map entries to SkillCandidate.
 *   - get():  fetch the SKILL.md body for a previously listed candidate.
 *
 * Fetch failures are soft: list() returns an incomplete observation (not
 * authoritative absence) and get() returns undefined, matching the registry's
 * last-good-catalog semantics.
 */

import type {
  SkillCandidate,
  SkillDefinition,
  SkillInvocationPolicy,
  SkillLookupOptions,
  SkillProvider,
  SkillProviderObservation,
} from '@deepseek-ai/dsh-skill'
import { fetchCatalog, fetchText, type HubCatalogSkill } from './catalog.js'

/** Opaque provider-owned handle stored on each candidate and given back to get(). */
export interface HubLocator {
  /** Owning GitHub repo, e.g. `wwumit/skills-compliance-intl`. */
  readonly repo: string
  /** Version captured at discovery time. */
  readonly version: string
  /** File manifest under `skills/<name>/` (informational). */
  readonly files: readonly string[]
}

/** Provider configuration. */
export interface HubProviderConfig {
  /** Catalog JSON URL, e.g. https://wwumit.github.io/skills-catalog/catalog.json */
  catalogUrl: string
  /** Unique provider name registered on ctx.skills. Default 'hub'. */
  providerName?: string
  /** Rank for duplicate-name resolution (lower wins). Default 250. */
  rank?: number
  /** Per-request timeout. Default 10_000 ms. */
  requestTimeoutMs?: number
  /** Base URL for raw file fetches. Default https://raw.githubusercontent.com */
  baseUrl?: string
  /** Default branch of the skill repos. Default 'main'. */
  branch?: string
}

const DEFAULT_RANK = 250
const DEFAULT_TIMEOUT = 10_000
const DEFAULT_BASE = 'https://raw.githubusercontent.com'
const DEFAULT_BRANCH = 'main'

const LOCAL_SOURCE = 'runtime' as const

export class HubProvider implements SkillProvider {
  readonly name: string
  private readonly rank: number
  private readonly timeoutMs: number
  private readonly baseUrl: string
  private readonly branch: string

  constructor(private readonly config: HubProviderConfig) {
    this.name = config.providerName ?? 'hub'
    this.rank = config.rank ?? DEFAULT_RANK
    this.timeoutMs = config.requestTimeoutMs ?? DEFAULT_TIMEOUT
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, '')
    this.branch = config.branch ?? DEFAULT_BRANCH
  }

  private toCandidate(entry: HubCatalogSkill): SkillCandidate {
    const invocation: SkillInvocationPolicy = { modelInvocable: true, userInvocable: true }
    const locator: HubLocator = {
      repo: entry.repo,
      version: entry.version,
      files: entry.files,
    }
    return {
      name: entry.name,
      description: entry.description,
      invocation,
      source: LOCAL_SOURCE,
      provider: this.name,
      rank: this.rank,
      locator,
    }
  }

  async list(
    options: SkillLookupOptions,
  ): Promise<readonly SkillCandidate[] | SkillProviderObservation> {
    const catalog = await fetchCatalog(this.config.catalogUrl, this.timeoutMs, options.signal)
    if (!catalog) {
      // Incomplete observation: consumers keep their last-good catalog and retry.
      return { candidates: [], complete: false }
    }
    return catalog.skills.map((entry) => this.toCandidate(entry))
  }

  async get(
    candidate: SkillCandidate,
    options: SkillLookupOptions,
  ): Promise<SkillDefinition | undefined> {
    const locator = candidate.locator as HubLocator | undefined
    if (!locator || typeof locator.repo !== 'string') return undefined
    const url = `${this.baseUrl}/${locator.repo}/${this.branch}/skills/${candidate.name}/SKILL.md`
    const content = await fetchText(url, this.timeoutMs, options.signal)
    if (content === undefined || content.length === 0) return undefined
    return { ...candidate, content }
  }
}

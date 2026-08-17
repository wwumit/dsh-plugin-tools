/**
 * dsh-compliancehub — DSH 远程技能 provider 插件。
 *
 * 注册一个 `ctx.skills` provider，从 JSON catalog（如 GitHub Pages 托管的
 * catalog.json）提供精选技能：list() 返回目录，get() 按需拉取 SKILL.md。
 */

import type { Context } from '@deepseek-ai/cordis'
import type { SkillProviderControl } from '@deepseek-ai/dsh-skill'
import { HubProvider, type HubProviderConfig } from './provider.js'

export const name = 'dsh-compliancehub'
export const inject = ['skills']

export type { HubProvider, HubProviderConfig } from './provider.js'
export {
  parseCatalog,
  fetchCatalog,
  fetchText,
  CatalogError,
  type HubCatalog,
  type HubCatalogSkill,
} from './catalog.js'

/** Plugin configuration, forwarded to HubProvider. */
export interface Config extends HubProviderConfig {}

export function apply(ctx: Context, config: Config) {
  ctx.skills.registerProvider(
    (_control: SkillProviderControl) => new HubProvider(config),
  )
}

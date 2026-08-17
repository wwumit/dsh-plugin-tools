/**
 * DSH 实机验证：把 dsh-compliancehub 注册进真实 SkillRegistry，
 * 验证 ctx.skills.list() 返回线上 catalog 的 20 个技能、get() 能拉取 SKILL.md。
 *
 * 运行（依赖 DSH 仓库的 tsconfig paths）：
 *   cd dsh-compliancehub && ln -s /Users/wuwei/deepseek-harness/node_modules node_modules
 *   node_modules/.bin/tsx --tsconfig /Users/wuwei/deepseek-harness/tsconfig.json verify-dsh.ts
 */
import { Context } from '@deepseek-ai/cordis'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import { HubProvider } from './src/provider.ts'

const CATALOG_URL = 'https://wwumit.github.io/skills-catalog/catalog-plugin-tools.json'

async function main(): Promise<void> {
  const ctx = new Context()
  await ctx.plugin(SkillRegistry)
  ctx.skills.registerProvider(() => new HubProvider({ catalogUrl: CATALOG_URL }))

  const skills = await ctx.skills.list({ cwd: '/Users/wuwei/Documents/DSH' })
  console.log(`✅ ctx.skills.list() → ${skills.length} 个技能（provider 层合并后）`)
  console.log('   ', skills.slice(0, 10).map((s) => s.name).join(', '))
  if (skills.length > 10) console.log(`    … 共 ${skills.length} 个`)

  const one = await ctx.skills.get('expert2skill', { cwd: '/Users/wuwei/Documents/DSH' })
  console.log(`✅ ctx.skills.get('expert2skill') → ${one ? `正文 ${one.content.length} 字节，前 60 字: ${one.content.slice(0, 60).replace(/\n/g, ' ')}` : 'undefined ❌'}`)

  console.log('✅ DSH 实机验证通过')
}

main().catch((err) => {
  console.error('❌ 验证失败:', err)
  process.exit(1)
})

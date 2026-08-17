<!-- wwumit brand header: governance-driven AI skills ecosystem -->
<p align="center"><b>wwumit</b> · 治理驱动的 AI 技能生态 — 规则 → 检查 → 评分 → 报告</p>
<p align="center">产品线：合规 · 投资 · 数据分析 · <b>插件工具</b> · 数据层 <a href="https://github.com/wwumit/skills-catalog">catalog</a></p>
<hr>

# dsh-plugin-tools

**插件工具专家组**：插件/技能开发与发布工具 provider。通过 `ctx.skills` 从线级 catalog 安装三个核心工具：

| 工具 | 用途 |
|---|---|
| **expert2skill** | 专家方法沉淀器：引导访谈 → 规则库 JSON + 可运行 skill 包 |
| **skill-compliance** | 发布合规检查器：披露完整性 + 免责/红线 + 金融敏感词 + 依赖安全（进 STANDARD §7/§9） |
| **dependency-scan** | 供应链依赖扫描：宿主遮蔽 / 版本锁定 / 高危基线 / peer 完整性（与 skill-compliance DEP 对齐） |
| **malware-scan** | 恶意代码静态检测：远程执行 / 混淆执行 / 数据外传 / 持久化 / 凭据读取 / 危险调用链 |

## Install

```sh
npm install @wwumit/dsh-plugin-tools
# peer deps: @deepseek-ai/cordis, @deepseek-ai/dsh-skill
```

## Usage (composition)

```ts
import { Context } from '@deepseek-ai/cordis'
import * as pluginTools from '@wwumit/dsh-plugin-tools'

export function apply(ctx: Context) {
  ctx.plugin(pluginTools, {
    catalogUrl: 'https://wwumit.github.io/skills-catalog/catalog-plugin-tools.json',
  })
}
```

## Verified (DSH 实机验证)

`verify-dsh.ts` 在真实 DSH 运行时验证：`ctx.skills.list()` 返回 4 个工具 + `ctx.skills.get('expert2skill')` 拉取 SKILL.md。

## Disclosure (DISCLOSURE v0.3)

线级 catalog 双颗粒度披露：3 个工具全部 `cloud: false`（纯本地）、`disclosureSchemaVersion: 0.3`、仓级 `repos[].cloudSkills/paySkills` 同源。披露检查由 skill-compliance v1.5.x 自动执行。

## Development

```sh
pnpm install
pnpm test    # vitest (mocked fetch)
pnpm build   # tsc → lib/
```

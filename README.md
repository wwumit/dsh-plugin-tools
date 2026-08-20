<!-- wwumit brand header: governance-driven AI skills ecosystem -->
<p align="center"><b>wwumit</b> · 治理驱动的 AI 技能生态 — 规则 → 检查 → 评分 → 报告</p>
<p align="center">产品线：合规 · 投资 · 数据分析 · <b>插件工具</b> · 数据层 <a href="https://github.com/wwumit/skills-catalog">catalog</a></p>
<hr>

# dsh-plugin-tools
<p align="center">
  <img src="https://compliancehub.cn/store/assets/l3.png" alt="CHA2A L3 发行认证" width="32" title="CHA2A L3 发行认证"> ·
  <img src="https://compliancehub.cn/badge/package/@wwumit/dsh-plugin-tools" alt="CHA2A 认证" title="CHA2A 认证徽章（did:cha2a:@wwumit/dsh-plugin-tools）"> ·
  <a href="https://compliancehub.cn/store/">dshlib 图书馆</a> 收录 · <a href="https://compliancehub.cn/store/scan/">安全扫描报告</a>
</p>


**插件工具专家组**：插件/技能开发与发布工具 provider。通过 `ctx.skills` 从线级 catalog 安装三个核心工具：

| 工具 | 用途 |
|---|---|
| **expert2skill** | 专家方法沉淀器：引导访谈 → 规则库 JSON + 可运行 skill 包 |
| **skill-compliance** | 发布合规检查器：披露完整性 + 免责/红线 + 金融敏感词 + 依赖安全（进 STANDARD §7/§9） |
| **dependency-scan** | 供应链依赖扫描：宿主遮蔽 / 版本锁定 / 高危基线 / peer 完整性（与 skill-compliance DEP 对齐） |
| **malware-scan** | 恶意代码静态检测：远程执行 / 混淆执行 / 数据外传 / 持久化 / 凭据读取 / 危险调用链 |
| **bundle-lint** | bundle 结构一致性校验：cordis.patch.yml / dsh 配置 / 入口 / 包名对齐（BND-001~006） |
| **runtime-probe** | 实机 list/get 验证：注册插件 → 实测 → 证据契约报告（verifiedBy/verifiedAt/reportUrl） |

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

## CI 门禁模板（plugin-gate）

仓库内 `templates/ci/plugin-gate.yml` 提供发布门禁模板：push/PR 时自动执行
`build + bundle-lint + skill-compliance + dependency-scan + malware-scan`，任一失败即红。
用法：复制到目标插件仓库 `.github/workflows/plugin-gate.yml`。

## Development

```sh
pnpm install
pnpm test    # vitest (mocked fetch)
pnpm build   # tsc → lib/
```

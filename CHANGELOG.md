# CHANGELOG


## 1.1.1 (2026-08-17)

- fix: 插件 name 导出误为 dsh-compliancehub（复制遗留）→ 修正为 dsh-plugin-tools

## 1.1.0 (2026-08-17)

- 新增技能：**bundle-lint**（bundle 结构一致性校验，BND-001~006）、**runtime-probe**（实机 list/get 验证 + 证据契约报告）
- 新增资产：`templates/ci/plugin-gate.yml`（GitHub Actions 发布门禁模板：build + bundle-lint + skill-compliance + dependency-scan + malware-scan）
- 线级 catalog 扩展：catalog-plugin-tools.json 4 → 6 技能
- 至此 dsh-plugin-tools = 完整"发布质量工具箱"（6 技能 + CI 模板）

## 1.0.1 (2026-08-17)

- fix peerDeps: @deepseek-ai/dsh-skill >=0.1.0-rc.6 (npm 只有 rc 版本，>=0.1.0 装不上)
## 1.0.0 (2026-08-17)

- 首个正式版本：plugin/skill 开发工具 provider（expert2skill、skill-compliance、dependency-scan、malware-scan，dsh.bundle）
- 线级 catalog 提供（catalog.json 过滤工具线），fail-soft 语义
- 收录于 dshbase（DSH Plugin Install Guide & Compatibility Review）

## 0.1.0 (2026-08-16)

- 初始版本（未发布）

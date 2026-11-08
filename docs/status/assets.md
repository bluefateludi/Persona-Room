# 素材线状态
- 工作树：C:\Users\86150\.codex\worktrees\gallery-assets\Hi3d-0765
- 分支：codex/assets；只在本工作树写入，不 push、不合并 main。
- 正在实现：真实 GLB/Spine/音频验证、内容 JSON、SpineActor、白名单发布脚本。
- 依赖请求（场景线统一安装）：pixi.js 7.4.3、@pixi-spine/runtime-3.8 4.0.6、@pixi-spine/base 4.0.6（版本将在实际播放验证后确认）。
- 家具：仅一件稻穗档案柜 PNG，免费报价后等待用户确认收费 3D；现有手办不重复生成。
- 当前未验收：GLB 渲染、Spine 动画、真实音频、家具 PNG。

## 2026-11-08 首个真实素材切片
- Hi3D OAuth 已重新授权成功；余额 1065；11 个工具可见。无需重启即可调用。
- 稻穗档案柜 PNG 已生成 assets/shu/rice-archive-cabinet.png。用户确认 45 积分后仅提交一次，create_generation 返回 HTTP 503 AUTH_SERVICE_UNAVAILABLE。任务列表无新增、余额仍 1065；未自动重试，家具 GLB 尚缺。
- GLB 实际 Chromium/Three.js 渲染成功：1 网格、1,019,424 顶点、1,980,890 三角面、两张内嵌 JPEG、原始包围盒 0.69623 × 1.00001 × 0.51196。原文件 48.5 MB，建议场景容器归一化到 2.5 单位，关注移动设备性能。
- Spine 真实版本 3.8.99，动画 Default、Interact、Move、Relax、Sit、Sleep；Relax 待机和 Interact 点击动作已实际播放。透明画布截图验证通过。
- 语音：Ark-Voice 普通话整合文件，按 voice_data.json 截取 CN_001 [0,11.301043) 秒；浏览器解码、用户手势播放、ended 事件均验证。对应字幕取 ArknightsGameData char_2025_shu_CN_001。未声称人工听感验收。
- 独立截图 output/playwright/assets-preview.png；正式证据将落 assets/shu/validation/。
- 已写 SpineActor.tsx 与 SpineActor.runtime.ts。依赖确认 pixi.js 7.4.3、@pixi-spine/runtime-3.8 4.0.6、@pixi-spine/base 4.0.6（场景线统一加依赖）。
- 正在收尾：白名单/契约检查、组件 TypeScript 检查、错误路径与清理验证、可交接提交。

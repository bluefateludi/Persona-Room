# 交互线状态

## 工作目录与分支
- 实际工作树：`C:\Users\86150\.codex\worktrees\gallery-interaction\Hi3d-0765`
- 分支：`codex/interaction`，基于 `98a9eae`；只提交本线文件，不 push、不合并 main。
- 已停用共享目录写入；主目录旧状态文件保留未动。

## 已交付代码（验证完成）
- `frontend/src/features/GalleryUI.tsx` 导出具名 GalleryUI，完整使用 GalleryUIProps。
- 精选档案、文库新页、语音/字幕、收藏、画廊、布展预设、旋转/恢复、存档导入导出。
- 单一浏览器 Audio 实例，新播放会停止并卸载旧音源；缺少音频与播放失败有真实提示。
- 存档以角色 + 展厅区分；校验版本、ID、有限坐标、大小，错误导入保持原状态。
- CSS 全部限定在 `.g-ui`；象牙白、深蓝、金色，无全局样式修改。

## 接入说明
- `import { GalleryUI } from '../features/GalleryUI'`；不需要新运行依赖，只需 React/ReactDOM。
- App 持有 selection、furnitureOverrides；传入稳定 onSelect/onLayoutChange 更佳。
- 初次挂载恢复本地存档，并调用 onLayoutChange；空对象表示默认布局。
- 场景点击小人只调用 onSelect（传新的 selection 对象）；不要另起音频播放器。小人按绑定 contentId 优先匹配语音，否则选择首条有音频的条目。
- 所有素材 URL 从 props 读取，场景线先处理部署 base 前缀。
- 配置导入导出范围是当前角色/展厅的用户存档，不含素材或替换内容包；内容包替换由 App/素材数据层完成。
- 导航、品牌标题由 GalleryUI 自带；场景装配时避免重复显示另一套导航或品牌。桌面侧栏右侧宽 460px，手机面板底部预留导航。
- 收藏档案能回到指定章节；收藏语音点击后试听对应条目。来源及文库链接仅接受 http(s)。
- 样式/导入模块无需额外库；Node 专用测试采用 `.mjs`，避免引入前端工程的 Node 类型依赖。

## 验证结果
- 严格 TypeScript 检查通过（包含 noUnusedLocals/noUnusedParameters/verbatimModuleSyntax，适配场景线编译配置）。
- Node 存档测试 3/3 通过：有效往返、无效 JSON/版本/引用/坐标/过大文件/原型键拒绝、外链协议限制。
- Playwright 实际浏览器通过：故事入口、章节切换、收藏/已读刷新恢复、布局预设/旋转刷新恢复、无效导入保留状态、导出/导入往返、缺失/失败音频反馈。
- 原生 Audio + 测试静音 WAV 验证互斥播放、暂停/继续、静音保持、切到缺失条目停旧声音；不声称真实角色音频已验收。
- 1280×720 与 390×844 截图已人工查看；移动面板不超出视口、不覆盖导航，Escape 关闭通过。
- 浏览器控制台只有测试页 favicon 404（测试音频失败亦属预期），无 React 运行错误。
- 复现命令和验证细节：`frontend/src/features/__tests__/README.md`。
- 本机截图：工作树 `output/playwright/interaction-archive.png` 与 `interaction-mobile.png`，不打包正式产品。

## 风险与后续
- 无新增依赖请求；本地通过 node_modules junction 只读复用了场景分支依赖，junction 不入提交。
- 真实素材、场景遮挡/点击与部署 base URL 仍由场景线最终集成验收。
- 当前仅支持 schemaVersion=1；不同角色/展厅存档和未知条目会明确拒绝，不做猜测迁移。
- 本地存储不可用时保留会话状态并提示导出；配置不等于公开分享。

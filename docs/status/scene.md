# 场景线状态

- 工作树：`C:\Users\86150\.codex\worktrees\gallery-scene\Hi3d-0765`
- 分支：`codex/scene`；只在此工作树写入，不修改 main。
- 已建立 React 19 / TypeScript / Vite 7 工程；R3F 9、Drei 10、Three 0.180。
- 依赖和锁文件由本线唯一维护；素材/交互需求请通过各自状态或提交交接。
- 正在实现：真实 GLB、程序化家具、镜头切换和 App 装配。
- 接口遵循 shared/src/contracts.ts，未修改公共契约。
- 待交接：素材内容包、SpineActor 和 GalleryUI 的完成提交。

## 第一版切片
- 已实现真实 GLB 归一化，程序化房间、展示台、档案柜、语音台、画框和小人预留区。
- 固定家具 ID 触发契约 selection；furnitureOverrides 驱动位置/旋转；镜头聚焦、全馆复位和 OrbitControls 已实现。
- 页面采用米白、靛蓝、稻金主题；桌面与窄屏均支持展品目录。
- 验证：`npm run build --prefix frontend` 通过（TypeScript + Vite）；Playwright 已实际渲染 GLB，参考截图 `frontend/output/playwright/scene-initial.png`。
- 浏览器发现 React StrictMode 与 Drei Html 的同步卸载开发警告，已移除入口 StrictMode，待复测。
- 已按素材线需求安装 pixi.js 7.4.3、@pixi-spine/runtime-3.8 4.0.6、@pixi-spine/base 4.0.6。
- 待接入：两线已完成提交。当前 App 明确标为内容包待接入，没有模拟音频或 Spine 完成。
- 模型实际体积 48.5 MB，首次下载较重；最终内容包可保持本地静态服务运行，不触发生成。
- 首版可交接提交：`bc1a115`。交互线可在自己的分支合并该提交以取得构建配置与锁文件（依赖内容包待接入），不要复制进行中的文件。
- 进一步修正：将展品标牌改为 Three 原生纹理精灵，避免 React/Drei 独立 DOM 根的开发卸载警告；显示真实加载进度。

## 复测与下一步
- 2026-11-08：正常浏览器加载已达零错误、零警告（React 标牌卸载问题已通过 Three 原生标牌解决）。
- 已验证 1440px 桌面与 390px 窄屏，模型聚焦可操作；检视时收起页面标题防止遮挡。
- 浏览器阻断 GLB 请求：显示“模型加载失败 · 当前为图片预览”，其他展品入口可用；恢复网络并点击重试后真实模型恢复。
- 家具 GLB 按目标高度 1.7 自动归一化；失败时退回程序化档案柜；画框失败显示明确提示。
- 当前生产构建通过。下一步合并两线交付并验收完整参观、音频与存档。
- 已预留 GalleryScene 的可选 companion ReactNode 插槽（不修改 shared 契约，原 props 仍兼容），随 shu-companion 的位置覆盖投影透明画布；App 将装配 SpineActor，所有音频仍由 GalleryUI 独占。
- 场景改为按需渲染：静止时不持续占用 GPU，镜头过渡、用户旋转与布局变化继续刷新。
- 真实鼠标点击三维档案柜已打开 archive 选择（不是只验证底部导航）；镜头随之聚焦，固定 ID 绑定有效。
- 当前场景工作已形成可运行切片，等待资产和交互的完成提交后执行合并集成；未因等待而声明完整交付。

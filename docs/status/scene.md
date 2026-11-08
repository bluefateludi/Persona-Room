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

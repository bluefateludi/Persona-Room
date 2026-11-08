# 02 — 可进入、可检视、可点击的展厅
**What to build:** 建立可运行网页，用户能检视真实手办，点击家具，切换镜头，最终接入小人和交互面板。
**Blocked by:** None — can start immediately。最终集成需要 01、03 的产物，初始场景不等待它们。
**Status:** completed — integrated and browser-verified
- [x] 初始化 React/TS/Vite 工程，维护唯一依赖锁文件，提供本地运行命令。
- [x] GalleryScene 遵守共享 props，房间/家具/灯光风格统一，真 GLB 加载并归一化。
- [x] 家具固定 ID 发出选择事件，布局覆盖能立即反映位置。
- [x] App 接入 GalleryUI 与 SpineActor；导入真实内容、处理缺失/加载状态。
- [x] 构建及浏览器完整参观验收，记录 docs/status/scene.md。

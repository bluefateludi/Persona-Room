# 场景线与最终集成状态

## 交付
- 状态：三线实现已集成，完整浏览器参观验收完成；不发布、不 push、不合并 main。
- 工作树：`C:\Users\86150\.codex\worktrees\gallery-scene\Hi3d-0765`
- 分支：`codex/scene`
- 已合并明确交付提交：交互 `89da211`；素材 `312a54a`。其模块未由本线覆盖；shared 公共契约未修改。
- React 19 / TypeScript / Vite、Three/R3F/Drei 与 Spine 运行库均已安装并锁定。本线唯一维护 package 与锁文件。

## 已实现
- 真实 GLB 归一化、统一主题房间/家具/灯光、点击拾取、选中环、旋转缩放、镜头聚焦与复位。
- 固定展品 ID 与位置/旋转覆盖；三维标牌消费内容包标签；生成家具支持 modelUrl 与失败时程序化回退。
- App 装配 GalleryUI 和真实 SpineActor。小人透明画布随家具位置投影，音频只由 GalleryUI 管理；内容解析后才恢复存档。
- 内容包结构、版本、角色关联、有限坐标与重复 ID 校验；部署 base 前缀统一转换。
- 异步加载进度、GLB 图片回退/重试、画框缺失提示、独立 WebGL 错误边界；静止场景按需渲染。
- 响应式标题、展品目录和内容面板；手机标题不覆盖场景；小人资源与主场景拆成独立 bundle。

## 验证证据（2026-11-08，香港时间）
- `npm run build --prefix frontend`：TypeScript + Vite 生产构建通过。
- `node scripts/prepare-assets.mjs` / `node scripts/validate-content.mjs`：9 项白名单素材、契约引用、GLB 内嵌贴图与 WAV 头通过；内部生成记录不发布。
- `node --experimental-strip-types --test frontend/src/features/__tests__/storage.test.mjs`：3 项全部通过。
- Chromium 真实渲染：GLB 与 Spine 同时出现；真实鼠标点击三维档案柜打开 archive；模型检视、家具/画框/语音入口有效。
- 点击真实小人 → Interact 动作 → 普通话 CN_001 → 对应整条字幕；播放与暂停成功。未声称人工听感评价。
- 阅读真实档案、切换章节、收藏；刷新后 `archive:profile`、已读 profile/care 及家具覆盖保留。
- 实际布展后 archive-desk 坐标 (-2.2, 0, -1.2)、Y 旋转 0.9653981633974482；刷新恢复。导出配置、恢复默认、再导入，坐标/收藏/已读一起恢复。
- 文库链接 `target=_blank`、`rel=noopener noreferrer`；真实新标签页打开「泰拉文库 · 多语言剧情阅读器」，原展馆保留。
- 1440×900 和 390×844 截图检查；手机内容面板不越界、底部导航可用；Escape 关闭有效。
- 故障注入：阻断 GLB 显示图片预览，恢复网络后重试成功；禁用 WebGL 后独立错误边界保留阅读/收藏/布展界面。
- `/gallery/` 生产子路径构建与真实浏览器通过：JSON、GLB、Spine 三件套全部 200，点击小人仍可播放真实语音；GLB 在发布产物中仅一份。
- 正常完整页面：控制台 0 errors；1 条第三方 Spine/Pixi rgb2hex 弃用警告，未掩盖或抑制。
- 本机截图：`frontend/output/playwright/production-gallery.png`、`final-mobile-clean.png`、`mobile-editor.png` 等。浏览器日志归档于同目录 session-logs；不作为发布素材。

## 限制与后续
- 新档案柜 GLB 尚缺：素材线在已确认报价下提交一次遭遇 503；当前使用程序化档案柜，档案交互完整。没有重复生成。
- 48.5 MB、约 198 万三角面的原始手办较重；手机尺寸验收不等于真实低端手机性能保证。
- 仅一条真实语音；文库角色直达页尚未核验，使用首页＋搜索提示。
- 当前存档是本浏览器保存与 JSON 导入导出，不是云分享或跨设备同步。

## 本地启动
在本工作树 `frontend` 内执行 `npm ci`、`npm run dev -- --port 5173`。构建 `npm run build`；预览 `npm run preview`。运行与实现说明见 `frontend/README.md`。
- 收尾发现 Windows Vite 监听备用构建目录中的 GLB 时产生 EBUSY；已在 server.watch 中排除 output 与浏览器日志目录，正式生产包不受影响，开发服务重启后复核。

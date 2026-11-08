# 穗间 · 本地互动展馆

已集成真实 GLB 手办、Spine 3.8 小人、普通话语音与字幕、精选档案、收藏、家具布置及 JSON 存档。

## 运行

本轮在 Node.js 24.20.0 验证。进入此工作树的 frontend 目录：

```powershell
npm ci
npm run dev -- --port 5173
```

打开终端打印的本地地址。生产构建与本地预览：

```powershell
npm run build
npm run preview
```

内容或素材更新后，在仓库根目录运行：

```powershell
node scripts/prepare-assets.mjs
node scripts/validate-content.mjs
```

发布目录只包含白名单素材，不包含生成记录或任务令牌。子路径部署可使用 `npm run build -- --base=/gallery/`；本轮已在真实浏览器验证 JSON、GLB、Spine 和语音路径。

## 参观路线

1. 点击小人：真实 Interact 动画、普通话语音和字幕。
2. 点击手办或「检视手办」：镜头聚焦；拖动旋转、滚轮缩放；「全馆视角」返回。
3. 点击档案柜或「了解她的故事」：阅读、切换章节、收藏；文库在新标签页打开。
4. 进入「布展」：选择家具、改变位置与旋转；刷新恢复。导出 JSON 可在同一角色展厅重新导入。

## 实现边界

- `GalleryScene` 遵循 shared 契约，额外提供可选 companion 插槽；App 持有选择与布局覆盖，GalleryUI 独占音频和存档。
- GLB 在容器内归一化，不改源模型。三维标牌、灯光与家具由代码构建。Spine 透明画布在 App 中投影到对应家具，跟随布局与镜头。
- 无 WebGL 时保留内容面板。模型失败显示图片和重试入口；家具模型与画框失败局部回退。
- 稻穗档案柜生成服务失败，当前使用可交互程序化柜；没有把参考 PNG 冒充 GLB。
- 原始手办约 48.5 MB、198 万三角面；桌面和手机尺寸浏览器均已检查，真实低端手机 GPU 性能尚未验证。
- 目前只有一条真实语音。文库首页可打开，角色直达链接未核验。无云端分享或跨设备同步。
- Spine 依赖有一条 Pixi rgb2hex API 弃用警告；正常运行没有控制台错误。

验证细节见 `docs/status/scene.md`、`docs/status/assets.md`、`docs/status/interaction.md`。

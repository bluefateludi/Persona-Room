# 交互模块验证

此目录只包含明确标注的示例内容，不作为正式角色内容发布。无需额外运行依赖。

在仓库根目录（已安装 frontend 依赖）执行：

```powershell
node --experimental-strip-types --test frontend/src/features/__tests__/storage.test.mjs
node frontend/node_modules/vite/bin/vite.js --config frontend/src/features/__tests__/vite.config.mjs
```

Node 22.6+ 支持类型擦除；本次在 Node 24.20.0 验证。测试页位于 `http://127.0.0.1:5186/`，端口占用时先结束自己的旧测试进程。

独立严格编译：

```powershell
frontend/node_modules/.bin/tsc.cmd --noEmit --jsx react-jsx --target ES2022 --module ESNext --moduleResolution bundler --strict --noUnusedLocals --noUnusedParameters --verbatimModuleSyntax --skipLibCheck --lib ES2022,DOM frontend/src/features/GalleryUI.tsx frontend/src/features/__tests__/harness.tsx
```

已执行的浏览器验收：

1. 点击「了解她的故事」显示精选档案；选择第二章节；收藏第一章节，刷新后二者保持已读、收藏保留。
2. 文库按钮使用配置链接，`target=_blank` 和 `rel=noopener noreferrer`，显示未核验直达链接的搜索提示。未把外部站点可用性算作交互测试结果。
3. 家具「向右」与「旋转 45°」即时更新测试场景回调；刷新后恢复位置和朝向。
4. 错误 JSON 导入显示错误，布局不变；导出 JSON、恢复默认、再导入会恢复原布局。
5. 空音频条目展示「暂缺语音」和字幕；坏 URL 显示播放失败。
6. 使用 Playwright 临时路由返回测试生成的 20 秒静音 PCM WAV，调用浏览器原生 Audio，验证暂停/继续、连续点击旧音频停止并卸载 src、静音跨条目保持；切换到缺失条目也停止旧音频。这仅证明播放器行为，不代表真实角色语音验收。
7. 1280×720 桌面与 390×844 手机截图检查；手机面板边界不超出视口、不遮挡底部导航；Escape 关闭。

正式集成后仍需使用真实内容包检查场景点击、小人语音和部署 base URL。播放器必须由 GalleryUI 唯一持有。

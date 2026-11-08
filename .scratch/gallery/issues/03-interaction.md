# 03 — 角色互动与可保存的个人展厅
**What to build:** 用户通过面板听语音、读精选档案、前往文库、收藏内容、修改家具位置并保存/导入导出。
**Blocked by:** None — can start immediately，使用公共契约与明确标记的示例数据；真实内容完成后由场景线接入。
**Status:** ready-for-agent
- [ ] GalleryUI 遵守公共 props，接收场景 selection 并显示相应面板。
- [ ] 语音互斥播放、暂停/静音与字幕；空音频给出缺失提示。
- [ ] 精选档案与新标签页文库入口，收藏与已读可恢复。
- [ ] 家具位置预设通过 onLayoutChange 反馈，保存刷新恢复。
- [ ] 配置导入验证结构、版本与数值，坏数据不破坏现有状态。
- [ ] 独立行为验证和 docs/status/interaction.md，依赖请求交由场景线统一安装。

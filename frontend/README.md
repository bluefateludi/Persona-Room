# 本地运行

需要 Node.js 22.12+ 或 24，安装依赖后启动：

```powershell
cd frontend
npm ci
npm run dev -- --port 5173
```

打开终端输出的本地地址。生产验证：`npm run build`，随后 `npm run preview`。

场景读取 `/content/characters/shu.json` 与 `/content/exhibitions/shu.json`。内容包尚未发布时，使用现有 GLB 和明确标注的场景预览；不会伪造语音、Spine 或档案完成状态。

GalleryScene 遵循 `shared/src/contracts.ts`；App 拥有选择和布局覆盖。已有模型在容器内按目标高度缩放、居中并对齐地面，不改变源 GLB。家具外观和点击 ID 分离，后续档案柜模型可通过 `modelUrl` 接入。

源素材约 48.5 MB，首次加载会显示实际加载进度。模型故障会显示图片预览及重试按钮；图片/家具加载故障有局部回退。

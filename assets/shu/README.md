# 黍素材包来源与接入

## 运行与发布
- `node scripts/prepare-assets.mjs` 复制明确白名单到 `frontend/public/content/`。
- `node scripts/validate-content.mjs` 检查契约、内容引用、发布目录白名单及媒体头；遇到任何额外公开文件都会失败。
- 场景线依赖：pixi.js 7.4.3、@pixi-spine/base 4.0.6、@pixi-spine/runtime-3.8 4.0.6。
- `SpineActor` 使用公共 `SpineActorProps`，透明 DOM 画布；宿主给定宽高，点击回调由场景/交互线接语音。内部自动播放真实 Relax，点击 Interact 后回到 Relax；错误明确显示并可重试。组件卸载销毁画布、纹理和监听器。
- URL `/content/` 自动适配 Vite BASE_URL；不调用生成服务。

## 素材来源
- GLB：用户已有 Hi3D 手办 https://www.hi3d.ai/3d-model/f0fd85ac4abc4919a0aeb776205c0b42 。保留原始 48,497,152 字节，内嵌两张 JPEG。
- Spine：isHarryh/Ark-Models，提交 e65fb9147846b64bcf2df956b8cd8da77a51b9b8，models/2025_shu/build_char_2025_shu.{skel,atlas,png}。实际骨骼版本 3.8.99，图集 748×748，PMA。
- 字幕、档案：Kengxxiao/ArknightsGameData，提交 63c7cec73c3858d0ae913f85cc89af3cef4d744f，zh_CN/gamedata/excel/{charword_table,handbook_info_table}.json。客观履历为节选，其他档案为明确标注的创作者导读。
- 音频：isHarryh/Ark-Voice，提交 79584841f7a28f9d029ec2dc1b72444bce87eb1e，voice_cn/char_2025_shu.ogg；按同版本 voice_data.json 中 CN_001 [0,11.301043) 截取为单声道 44100Hz PCM16 WAV。对应 char_2025_shu_CN_001，不把整合音频当成单句播放。
- 游戏素材版权归上海鹰角网络有限公司；Ark-Models 与 Ark-Voice 声明不得用于商业用途、不得损害版权方利益。项目程序复用不意味着游戏素材获得通用商用授权。
- 原有 shu-reference.png、shu-figurine-concept.png 由用户工作区提供；后者为 AI 手办概念图，已在内容中标注。
- 泰拉文库仅配置用户指定首页 https://terra-library.pages.dev/ ，黍的直达地址未核验，提示搜索“黍”。

## 档案柜
- rice-archive-cabinet.png 由内置 image_gen 生成，未使用 Hi3D 2D 收费生成。
- Prompt：Single complete freestanding archive cabinet, ivory lacquer body, midnight-blue doors, gold rice-ear relief, two closed doors and two upper drawers, four short sturdy feet. Front three-quarter view, pure white background, no text, no scene, no characters, all parts connected.
- Hi3D v3.0 高质、带贴图、PBR、私有 GLB 当前报价 45 积分。用户确认后提交一次，授权校验 HTTP 503；未返回新任务，复核无扣分，未自动重试。
- 家具 GLB 仍未完成；展厅继续使用程序化 archive-desk 外观。内部报价与生成记录不在公开白名单。

## 验证与限制
- Chromium 实际渲染 GLB 和 Spine，截图 validation/assets-preview.png。
- 动画列表 Default / Interact / Move / Relax / Sit / Sleep，Relax 待机与 Interact 点击实际播放。
- 真实音频浏览器解码与点击播放至 ended 已通过；未声称人工听感验收。
- 高面数模型约 198 万三角面，移动设备性能仍需集成测试。
- Pixi Spine 4.0.6 在 Pixi 7.4.3 下有一次 utils.rgb2hex 弃用警告，实际动画与渲染正常。未修改第三方包或屏蔽警告。
- 独立预览（场景工程安装依赖后）：先运行准备脚本，再 `node scripts/serve-asset-preview.mjs`，打开提示的 /scripts/asset-preview.html。预览只读已发布静态素材，不依赖内部生成记录。

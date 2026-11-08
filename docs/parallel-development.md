# 互动展馆：三条并行流的执行规格

## 目标与授权
用户要求创建三个独立聊天并立即开发：素材线、场景线、交互线。交付黍的互动展馆，包含真实 GLB 手办、Spine 小人、语音字幕、精选档案及文库链接、家具点击、收藏与布局保存。用户已明确选择：只新生成一件主题家具，其余家具用代码搭建，时间优先。主题家具采用“稻穗主题档案柜”，先生成 PNG，再查询 Hi3D 3D 报价；收费 3D 提交仍须用户确认具体报价。无论家具等待多久，其他开发继续。

README 是产品说明；本文件与 shared/src/contracts.ts 是本轮集成约定。仅本轮技术边界以本文件为准。内容包 schemaVersion 固定 1。用户没有要求云端账号或在线生成，首版为静态前端＋本地状态。暂无后端运行依赖。

## 用户路径与验收
1. 打开展馆能见房间、家具和可检视的真实手办。
2. 点击小人触发已验证的动画与至少一条真实语音，显示对应字幕。
3. 点击档案家具，打开“了解她的故事”精选档案，文库在新页打开。
4. 点击语音家具可选音频，连续点击只有一条播放。
5. 收藏条目、调整一件家具布局，刷新恢复；支持配置导入导出。
6. 读取角色与展厅配置，无需在展示模块中硬编码黍的档案或语音。
7. 缺失素材清楚提示，缺失能力不能声明已完成。

## 接口
统一使用 shared/src/contracts.ts。素材线产出 content/characters/shu.json、content/exhibitions/shu.json；公开内容输出 frontend/public/content/characters/shu.json、exhibitions/shu.json 及 assets/shu/ 文件。所有公开地址以 /content/ 开头，由场景线处理部署 base 前缀。不发布 generation-state.json、generation-result.json 或令牌。
展厅对象 ID 固定：shu-figure、shu-companion、archive-desk、voice-station、art-frame。主手办目标高度约 2.5 场景单位，地面 Y=0；家具比例由场景线统一。模型文件保留原始内容，通过容器归一化。

场景导出 frontend/src/scene/GalleryScene.tsx 的 GalleryScene，使用 GallerySceneProps。
交互导出 frontend/src/features/GalleryUI.tsx 的 GalleryUI，使用 GalleryUIProps。
Spine 播放由素材线导出 frontend/src/character/SpineActor.tsx 的 SpineActor，使用 SpineActorProps；可先使用独立透明画布 overlay，场景线负责展示位置。仅当真实运行验证后将 verified 设为 true。
场景线 App 持有 selection 和 furnitureOverrides 状态，并把两者传给组件。交互线通过 onLayoutChange 向场景同步位置覆盖；归一化与存档逻辑由交互线实现。未知 selection 为 null。

## 文件所有权
- 素材线：assets/、content/、scripts/、frontend/public/content/、frontend/src/character/SpineActor.tsx 及其同名前缀支撑文件；docs/status/assets.md；任务 01。
- 场景线：frontend 的 package.json、锁文件、构建配置、index.html、app/、入口、scene/、furniture/、character/ 中除 SpineActor* 外文件、data/、styles/；docs/status/scene.md；任务 02。负责依赖安装、最终集成和构建验证。
- 交互线：frontend/src/features/、components/、state/；交互专用测试；docs/status/interaction.md；任务 03。
- shared/src/contracts.ts 公共接口已由协调聊天写好；三条线只读，如必须调整先写 status 提案，场景线协调兼容改动。根 README、公共任务设置不由子聊天修改。
- 不重置、不删除别人的文件。需要依赖时素材/交互线在各自 status 写明包名和版本需求，由场景线统一修改 package 和安装。

## 节奏与依赖
三项任务均可立即开始，没有互相阻塞的启动条件。场景线用契约兼容的最小数据启动，不捏造音频。素材、交互各自能验证一条完整路径。
最终集成验收依赖三项输出，场景线负责。每完成一项可用产物就写 status，场景线在开发过程中检查另两份状态并接入，勿等至结束才集成。
优先在 45–60 分钟内交付首个可运行版本，再分批补充。5 小时是总目标时间，不是各自都先工作满 5 小时。最后至少留 1 小时验证与演示。
每条线独立记录：已交付文件、运行/测试证据、下一项、风险、需要其他线处理的接口与依赖。工作完成时在独立聊天交付结果，用户可继续跟进。

## 素材来源
已有 assets/shu/shu-figurine.glb，先验证并复用，不重新生成手办。
https://www.hi3d.ai/3d-model/f0fd85ac4abc4919a0aeb776205c0b42
Spine: https://github.com/isHarryh/Ark-Models/tree/main/models/2025_shu （3.8，PMA）
档案/台词: https://github.com/Kengxxiao/ArknightsGameData
立绘: https://github.com/Aceship/Arknight-Images
文库: https://terra-library.pages.dev/ （具体黍链接尚未核验，允许首页＋角色名提示）
实际音频来源未落实，必须查证并试听，缺失不得伪造。

## 生成与 MCP
素材线是唯一有权管理生成的工作线。用户已授权一件主题家具参考 PNG；生成目标为单件完整稻穗主题档案柜，象牙白、深蓝和金色，与黍风格协调，白底、无文字、无场景、便于 3D 重建。确认 PNG 后免费查询一次 3D 报价；向用户给出当前报价并按工具规则等待确认，等待时继续档案与素材工作。不自动重复提交、不把余额充足当作已确认报价。
新家具未到时使用程序化档案柜，保持 archive-desk 的 ID 与点击绑定；到位后替换外观。
保存任务 ID、报价、费用和 next_poll_after，统一限频查询。其他线程不调用生成 MCP。PNG 是参考图，3D 交付格式是 GLB；用户的“mac”暂理解为 MCP，未承诺其他格式。

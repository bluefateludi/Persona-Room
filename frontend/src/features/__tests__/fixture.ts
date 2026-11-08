import type { CharacterContent, ExhibitionContent } from '../../../../shared/src/contracts';
// Interaction-only fixture. These are not official character facts or voice recordings.
export const character: CharacterContent = {
  schemaVersion: 1, id: 'interaction-fixture', name: '示例角色', intro: '仅用于交互验证的示例内容，不是官方角色档案。',
  model: { url: '', posterUrl: '', targetHeight: 2.5, rotation: [0, 0, 0] }, spine: null,
  archives: [{ id: 'one', title: '示例档案一', text: '这是一段测试用的档案文字。\n用于验证换行、阅读和收藏。', source: { label: '测试数据', url: 'https://example.com/' } }, { id: 'two', title: '示例档案二', text: '第二段测试内容。', source: { label: '测试数据', url: 'https://example.com/' } }],
  voices: [{ id: 'missing', title: '缺失音频示例', text: '这是一段测试字幕，不是官方台词。', audioUrl: null, language: '测试' }, { id: 'broken', title: '失败音频示例', text: '用于验证加载失败。', audioUrl: '/missing-test.wav', language: '测试' }],
  artworks: [], story: { label: '前往文库阅读', url: 'https://terra-library.pages.dev/', directLinkVerified: false, searchHint: '示例角色' },
};
export const exhibition: ExhibitionContent = { schemaVersion: 1, id: 'test-gallery', characterId: character.id, title: '交互测试展馆', furniture: [
  { id: 'archive-desk', kind: 'archive', label: '档案桌', position: [-2, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: 'shu-companion', kind: 'companion', label: '小人', position: [2, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  { id: 'shu-figure', kind: 'model', label: '手办', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
] };

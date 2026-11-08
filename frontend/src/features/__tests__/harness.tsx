import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { FurnitureOverrides, Selection } from '../../../../shared/src/contracts';
import { GalleryUI } from '../GalleryUI';
import { character, exhibition } from './fixture';
function Harness() {
  const [selection, setSelection] = useState<Selection>(null);
  const [layout, setLayout] = useState<FurnitureOverrides>({});
  return <><div style={{ color: 'white', padding: 150 }}><p>示例数据 · 非官方内容</p><button onClick={() => setSelection({ id: 'shu-companion', kind: 'companion' })}>测试点击小人</button><pre id="layout-preview">{JSON.stringify(layout)}</pre></div><GalleryUI character={character} exhibition={exhibition} selection={selection} furnitureOverrides={layout} onSelect={setSelection} onLayoutChange={setLayout} /></>;
}
createRoot(document.getElementById('root')!).render(<Harness />);

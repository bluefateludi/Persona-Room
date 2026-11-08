import { useRef, useState } from 'react';
import type { ExhibitionContent, FurnitureOverrides } from '../../../../shared/src/contracts';
import { EmptyState } from '../../components/GalleryPrimitives';
import { MAX_IMPORT_BYTES } from '../../state/galleryStorage';
export function EditorPanel({ exhibition, overrides, onChange, onExport, onImport }: {
  exhibition: ExhibitionContent; overrides: FurnitureOverrides; onChange: (value: FurnitureOverrides) => void;
  onExport: () => void; onImport: (raw: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(exhibition.furniture[0]?.id ?? '');
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const item = exhibition.furniture.find(x => x.id === selectedId) ?? exhibition.furniture[0];
  const value = item ? overrides[item.id] ?? item : null;
  function preset(dx: number, dz: number) {
    if (!item || !value) return;
    onChange({ ...overrides, [item.id]: { position: [item.position[0] + dx, item.position[1], item.position[2] + dz], rotation: [...value.rotation] } });
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('文件过大，请选择小于 256 KB 的 JSON 存档。');
      onImport(await file.text()); setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : '无法读取文件，原有布置已保留。'); }
    finally { if (input.current) input.current.value = ''; }
  }
  return <><p className="g-ui-eyebrow">CURATE / 我的布展</p><h2>留一处喜欢的位置</h2><p className="g-ui-intro">选择家具，再调整摆放。每次修改都会即时预览并尝试保存到此浏览器。</p>
    {item && value ? <><label className="g-ui-label" htmlFor="g-ui-furniture">当前家具</label><select id="g-ui-furniture" value={item.id} onChange={e => setSelectedId(e.target.value)}>{exhibition.furniture.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
      <h3>位置预设</h3><div className="g-ui-preset">{[['原位', 0, 0], ['向左', -1, 0], ['向右', 1, 0], ['靠前', 0, 1], ['靠后', 0, -1]].map(([label, dx, dz]) => <button type="button" key={label} onClick={() => preset(Number(dx), Number(dz))}>{label}</button>)}</div>
      <p className="g-ui-note">位置 ({value.position.map(n => n.toFixed(1)).join(', ')}) · 相对初始位置调整</p>
      <div className="g-ui-actions"><button type="button" onClick={() => onChange({ ...overrides, [item.id]: { position: [...value.position], rotation: [value.rotation[0], ((value.rotation[1] + Math.PI / 4) % (Math.PI * 2)), value.rotation[2]] } })}>旋转 45°</button><button type="button" onClick={() => { const next = { ...overrides }; delete next[item.id]; onChange(next); }}>恢复此家具</button></div>
    </> : <EmptyState>当前展厅没有可编辑的家具。</EmptyState>}
    <section className="g-ui-reading"><h3>带走你的布展</h3><p>导出当前展厅的家具位置、收藏和已读记录。在同一角色展厅导入后恢复；素材文件不包含在存档中。</p><div className="g-ui-actions"><button className="g-ui-primary" type="button" onClick={onExport}>导出配置</button><button type="button" onClick={() => input.current?.click()}>导入配置</button></div><input ref={input} type="file" accept=".json,application/json" aria-label="导入展馆 JSON 配置" className="g-ui-file" onChange={e => void importFile(e.target.files?.[0])} /><p className="g-ui-note">仅在本机保存，不会发布或同步到其他设备。</p>{error && <p className="g-ui-error" role="alert">{error}</p>}</section>
  </>;
}

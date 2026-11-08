/** 公共契约 v1：三条并行流共用，UI 无关。 */
export type Vec3 = [number, number, number];
export interface SourceRef { label: string; url: string }
export interface ArchiveEntry { id: string; title: string; text: string; source: SourceRef }
export interface VoiceEntry { id: string; title: string; text: string; language: string; audioUrl: string | null; source?: SourceRef }
export interface Artwork { id: string; title: string; imageUrl: string; description: string }
export interface SpineAsset { skeletonUrl: string; atlasUrl: string; textureUrl: string; version: '3.8'; premultipliedAlpha: boolean; animations: { idle: string; interact?: string; move?: string }; verified: boolean }
export interface CharacterContent {
  schemaVersion: 1; id: string; name: string; intro: string;
  model: { url: string; posterUrl: string; targetHeight: number; rotation: Vec3 };
  spine: SpineAsset | null;
  archives: ArchiveEntry[]; voices: VoiceEntry[]; artworks: Artwork[];
  story: { label: string; url: string; directLinkVerified: boolean; searchHint: string };
}
export type ExhibitKind = 'model' | 'companion' | 'archive' | 'voice' | 'art';
export interface FurnitureItem {
  id: string; kind: ExhibitKind; label: string; position: Vec3; rotation: Vec3;
  scale: Vec3; contentId?: string; modelUrl?: string;
}
export interface ExhibitionContent { schemaVersion: 1; id: string; characterId: string; title: string; furniture: FurnitureItem[] }
export type Selection = { id: string; kind: ExhibitKind } | null;
export type FurnitureOverrides = Record<string, { position: Vec3; rotation: Vec3 }>;
export interface GallerySceneProps {
  character: CharacterContent; exhibition: ExhibitionContent;
  selection: Selection; furnitureOverrides: FurnitureOverrides;
  onSelect: (selection: Selection) => void;
}
export interface GalleryUIProps extends GallerySceneProps {
  isWalking?: boolean;
  onLayoutChange: (overrides: FurnitureOverrides) => void;
}
export interface SpineActorProps { source: SpineAsset; onInteract?: () => void; className?: string; moving?: boolean; facing?: 'left' | 'right' }

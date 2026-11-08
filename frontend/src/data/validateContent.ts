import type {
  CharacterContent,
  ExhibitionContent,
} from "../../../shared/src/contracts";
type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue =>
  !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string";
const vector = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.length === 3 &&
  value.every((x) => typeof x === "number" && Number.isFinite(x));
const entries = (
  value: unknown,
  valid: (entry: RecordValue) => boolean,
): boolean =>
  Array.isArray(value) &&
  value.every((x) => record(x) && text(x.id) && valid(x));
const source = (value: unknown): boolean =>
  record(value) && text(value.label) && text(value.url);
/** Check the structural assumptions the renderers rely on before mounting them. */
export function validateContent(
  character: unknown,
  exhibition: unknown,
): { character: CharacterContent; exhibition: ExhibitionContent } {
  if (!record(character) || !record(exhibition))
    throw new Error("内容包必须是对象");
  const model = character.model,
    story = character.story,
    spine = character.spine;
  const validCharacter =
    character.schemaVersion === 1 &&
    text(character.id) &&
    text(character.name) &&
    text(character.intro) &&
    record(model) &&
    text(model.url) &&
    text(model.posterUrl) &&
    typeof model.targetHeight === "number" &&
    Number.isFinite(model.targetHeight) &&
    model.targetHeight > 0 &&
    vector(model.rotation) &&
    record(story) &&
    text(story.label) &&
    text(story.url) &&
    text(story.searchHint) &&
    typeof story.directLinkVerified === "boolean" &&
    entries(
      character.archives,
      (x) => text(x.title) && text(x.text) && source(x.source),
    ) &&
    entries(
      character.voices,
      (x) =>
        text(x.title) &&
        text(x.text) &&
        text(x.language) &&
        (x.audioUrl === null || text(x.audioUrl)),
    ) &&
    entries(
      character.artworks,
      (x) => text(x.title) && text(x.imageUrl) && text(x.description),
    ) &&
    (spine === null ||
      (record(spine) &&
        text(spine.skeletonUrl) &&
        text(spine.atlasUrl) &&
        text(spine.textureUrl) &&
        spine.version === "3.8" &&
        typeof spine.verified === "boolean" &&
        typeof spine.premultipliedAlpha === "boolean" &&
        record(spine.animations) &&
        text(spine.animations.idle)));
  const validExhibition =
    exhibition.schemaVersion === 1 &&
    text(exhibition.id) &&
    text(exhibition.title) &&
    exhibition.characterId === character.id &&
    entries(
      exhibition.furniture,
      (x) =>
        ["model", "companion", "archive", "voice", "art"].includes(
          String(x.kind),
        ) &&
        text(x.label) &&
        vector(x.position) &&
        vector(x.rotation) &&
        vector(x.scale),
    );
  if (!validCharacter || !validExhibition)
    throw new Error("内容包格式或角色关联不匹配");
  const furniture = exhibition.furniture as { id: string }[];
  if (new Set(furniture.map((x) => x.id)).size !== furniture.length)
    throw new Error("展品 ID 不可重复");
  return {
    character: character as unknown as CharacterContent,
    exhibition: exhibition as unknown as ExhibitionContent,
  };
}

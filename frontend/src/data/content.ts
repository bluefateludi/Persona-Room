import { validateContent } from "./validateContent";
import type {
  CharacterContent,
  ExhibitionContent,
} from "../../../shared/src/contracts";
import modelUrl from "../../../assets/shu/shu-figurine.glb?url";
import posterUrl from "../../../assets/shu/shu-figurine-concept.png?url";
export const initialCharacter: CharacterContent = {
  schemaVersion: 1,
  id: "shu",
  name: "黍",
  intro: "一穗一岁，一岁一生。于此停步，走近黍的故事。",
  model: { url: modelUrl, posterUrl, targetHeight: 2.5, rotation: [0, 0, 0] },
  spine: null,
  archives: [],
  voices: [],
  artworks: [
    {
      id: "shu-concept",
      title: "数字手办 · 设计参考",
      imageUrl: posterUrl,
      description: "AI 生成的手办参考效果图，与中央的真实三维模型分别展示。",
    },
  ],
  story: {
    label: "了解她的故事",
    url: "https://terra-library.pages.dev/",
    directLinkVerified: false,
    searchHint: "黍",
  },
};
export const initialExhibition: ExhibitionContent = {
  schemaVersion: 1,
  id: "shu-gallery",
  characterId: "shu",
  title: "穗间",
  furniture: [
    {
      id: "shu-figure",
      kind: "model",
      label: "数字手办",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    {
      id: "archive-desk",
      kind: "archive",
      label: "岁月档案",
      position: [-3.2, 0, -1.2],
      rotation: [0, 0.18, 0],
      scale: [1, 1, 1],
    },
    {
      id: "voice-station",
      kind: "voice",
      label: "听见黍",
      position: [3.2, 0, -0.2],
      rotation: [0, -0.25, 0],
      scale: [1, 1, 1],
    },
    {
      id: "art-frame",
      kind: "art",
      label: "丹青留影",
      position: [2.6, 0, -3.3],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    {
      id: "shu-companion",
      kind: "companion",
      label: "与黍相遇",
      position: [-2.2, 0, 1.8],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
  ],
};
export function publicUrl(url: string) {
  return url.startsWith("/content/")
    ? `${import.meta.env.BASE_URL}${url.slice(1)}`
    : url;
}
export async function loadContent(
  signal: AbortSignal,
): Promise<{ character: CharacterContent; exhibition: ExhibitionContent }> {
  const [character, exhibition] = await Promise.all(
    ["characters/shu.json", "exhibitions/shu.json"].map(async (path) => {
      const response = await fetch(
        `${import.meta.env.BASE_URL}content/${path}`,
        { signal },
      );
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("json")
      )
        throw new Error("内容包尚未就绪");
      return response.json();
    }),
  );
  validateContent(character, exhibition);
  const mapped = JSON.parse(
    JSON.stringify({ character, exhibition }),
    (_key, value) => (typeof value === "string" ? publicUrl(value) : value),
  );
  return mapped;
}

import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
/** Scene-native label avoids a separate DOM root for every exhibit. */
export function SceneLabel({
  text,
  position,
  width = 1.6,
  height = 0.3,
  light = false,
}: {
  text: string;
  position: [number, number, number];
  width?: number;
  height?: number;
  light?: boolean;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 144;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = light ? "#e8dfcb" : "#263e40";
    ctx.fillRect(0, 0, 768, 144);
    ctx.fillStyle = light ? "#35484a" : "#e8dfcb";
    ctx.font = '42px "Noto Serif SC", SimSun, serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 384, 72);
    ctx.fillStyle = "#b99a56";
    ctx.fillRect(0, 140, 768, 4);
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    return map;
  }, [text, light]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[width, height, 1]}>
      <spriteMaterial map={texture} toneMapped={false} />
    </sprite>
  );
}

import type { LookPreset } from "./lookPresets";

const HEX_NAMES: Record<string, string> = {
  "#e8dcc8": "milk tea beige",
  "#8a8278": "greige ash brown",
  "#c87868": "pink brown",
  "#a898c8": "soft lavender",
  "#1a1614": "jet black",
  "#788088": "cool ash brown",
  "#d4a860": "honey blonde",
};

function hexLabel(hex: string): string {
  const key = hex.toLowerCase();
  return HEX_NAMES[key] || `color ${hex}`;
}

function hairStylePhrase(effect?: LookPreset["hairStyleEffect"]): string {
  switch (effect) {
    case "bangs":
      return "with soft see-through bangs";
    case "no-bangs":
      return "with forehead visible, no bangs";
    case "bob":
      return "in a chin-length bob cut";
    case "long":
      return "in long layered hair";
    case "layer":
      return "with face-framing layers";
    default:
      return "";
  }
}

function makeupPhrase(preset: LookPreset): string {
  const m = preset.makeup;
  if (!m) return "natural Korean soft glam makeup";
  const lip = hexLabel(m.lipHex);
  const cheek = hexLabel(m.cheekHex);
  const eye = m.eyeHex ? hexLabel(m.eyeHex) : "subtle brown";
  return `${lip} lips, ${cheek} blush, ${eye} eyeshadow, dewy skin, natural lashes`;
}

function fashionPhrase(preset: LookPreset): string {
  const f = preset.fashionOverlay;
  if (!f) return "stylish feminine outfit";
  const top = hexLabel(f.topHex);
  const acc = f.accentHex ? hexLabel(f.accentHex) : top;
  return `outfit in ${top} and ${acc} tones, clean Korean fashion aesthetic`;
}

/**
 * English prompts for image-editing models (FLUX Kontext / Gemini Image).
 */
export function buildSimulatePrompt(
  preset: LookPreset,
  options?: { hasReference?: boolean }
): string {
  const refNote = options?.hasReference
    ? " Match the color palette and mood of the reference style image. "
    : "";

  const identity =
    "Keep the same person, face identity, pose, expression, background, and accessories. Photorealistic beauty photo, salon quality, no cartoon, no filter band, no green tint.";

  switch (preset.category) {
    case "hairColor": {
      const color = preset.hairTint
        ? hexLabel(preset.hairTint.hex)
        : preset.name;
      return `Change ONLY the hair color to natural ${color} (${preset.name}). ${identity}${refNote}`;
    }
    case "hairStyle": {
      const style = hairStylePhrase(preset.hairStyleEffect);
      const color = preset.hairTint
        ? ` Hair color: ${hexLabel(preset.hairTint.hex)}.`
        : "";
      return `Change ONLY the hairstyle ${style} (${preset.name}).${color} Do not change makeup or clothes. ${identity}${refNote}`;
    }
    case "makeup": {
      const mk = makeupPhrase(preset);
      return `Apply ONLY makeup: ${mk} (${preset.name}). Do not change hair color or outfit. ${identity}${refNote}`;
    }
    case "fashion": {
      const fa = fashionPhrase(preset);
      return `Change ONLY the clothing to: ${fa} (${preset.name}). Do not change face or hair. ${identity}${refNote}`;
    }
    case "finish":
    default: {
      const hair = preset.hairTint
        ? `Hair: ${hexLabel(preset.hairTint.hex)} ${hairStylePhrase(preset.hairStyleEffect)}.`
        : "";
      const mk = preset.makeup ? `Makeup: ${makeupPhrase(preset)}.` : "";
      const fa = preset.fashionOverlay ? `Fashion: ${fashionPhrase(preset)}.` : "";
      return `Full beauty transformation (${preset.name}): ${hair} ${mk} ${fa} ${identity}${refNote}`;
    }
  }
}

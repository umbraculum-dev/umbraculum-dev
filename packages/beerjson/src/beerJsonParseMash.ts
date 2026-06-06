import { parseMashFromBeerJson } from "./beerJsonHelpers";
import type { EditorMash } from "./editorTypes";

export function parseMashFromBeerJsonRecipeRoot(r0: unknown): EditorMash {
  return parseMashFromBeerJson(r0);
}

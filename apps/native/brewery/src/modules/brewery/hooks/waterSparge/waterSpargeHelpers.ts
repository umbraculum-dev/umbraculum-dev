export { formatFixed, mixIonProfilesByVolume, type IonProfilePpm } from "../waterMash/waterMashHelpers";

export function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number): number {
  return bicarbPpm * (50 / 61);
}

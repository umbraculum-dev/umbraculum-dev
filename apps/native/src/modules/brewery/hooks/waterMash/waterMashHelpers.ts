export type IonProfilePpm = {
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

export function mixIonProfilesByVolume(
  a: IonProfilePpm,
  aVolumeLiters: number,
  b: IonProfilePpm,
  bVolumeLiters: number,
): IonProfilePpm | null {
  const av = Math.max(0, aVolumeLiters);
  const bv = Math.max(0, bVolumeLiters);
  const total = av + bv;
  if (!(total > 0)) return null;
  const mix = (x: number, y: number) => (x * av + y * bv) / total;
  return {
    calcium: mix(a.calcium, b.calcium),
    magnesium: mix(a.magnesium, b.magnesium),
    sodium: mix(a.sodium, b.sodium),
    sulfate: mix(a.sulfate, b.sulfate),
    chloride: mix(a.chloride, b.chloride),
    bicarbonate: mix(a.bicarbonate, b.bicarbonate),
  };
}

export function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

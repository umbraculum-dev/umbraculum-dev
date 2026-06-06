import type { IonProfilePpm } from "@umbraculum/contracts";

export type DisplayStream = {
  key: "mash" | "sparge" | "boil";
  label: string;
  volumeLiters: number | null;
  ph: number | null;
  finalAlkalinityPpmCaCO3: number | null;
  saltsAddedLabel: string | null;
  acidType: string | null;
  acidAmountLabel: string | null;
  ionsAfterAcid: IonProfilePpm | null;
};

import * as acidificationOps from "./waterCalc/waterCalcAcidificationOps.js";
import * as mashPhOps from "./waterCalc/waterCalcMashPhOps.js";
import * as overallOps from "./waterCalc/waterCalcOverallOps.js";
import * as saltsOps from "./waterCalc/waterCalcSaltsOps.js";

export class WaterCalcService {
  spargeAcidification(body: Record<string, unknown>) {
    return acidificationOps.spargeAcidification(body);
  }

  spargeAcidificationManual(body: Record<string, unknown>) {
    return acidificationOps.spargeAcidificationManual(body);
  }

  mashAcidification(body: Record<string, unknown>) {
    return acidificationOps.mashAcidification(body);
  }

  mashAcidificationManual(body: Record<string, unknown>) {
    return acidificationOps.mashAcidificationManual(body);
  }

  mashPhEstimate(body: Record<string, unknown>) {
    return mashPhOps.mashPhEstimate(body);
  }

  mashAcidificationTargetMashPh(body: Record<string, unknown>) {
    return mashPhOps.mashAcidificationTargetMashPh(body);
  }

  saltAdditions(body: Record<string, unknown>) {
    return saltsOps.saltAdditions(body);
  }

  mashOverall(body: Record<string, unknown>) {
    return overallOps.mashOverall(body);
  }

  spargeOverall(body: Record<string, unknown>) {
    return overallOps.spargeOverall(body);
  }

  boilOverall(body: Record<string, unknown>) {
    return overallOps.boilOverall(body);
  }
}

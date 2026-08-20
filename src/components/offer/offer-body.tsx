import { CareerMap } from "@/components/offer/career-map";
import { HonestyBlock } from "@/components/offer/honesty";
import { SalaryBand } from "@/components/offer/salary-band";
import { TaskSimPanel } from "@/components/offer/task-sim";
import { ToolsRack } from "@/components/offer/tools-rack";
import { Voices } from "@/components/offer/voices";
import { WeekRing } from "@/components/offer/week-ring";
import { WorkplaceTour } from "@/components/offer/workplace-tour";
import type { OfferPack, SimOutcome } from "@/lib/offer";

export function OfferBody({
  pack,
  salaryMin,
  salaryMax,
  currency,
  onSimResolved,
}: {
  pack: OfferPack;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  onSimResolved?: (out: SimOutcome) => void;
}) {
  return (
    <div className="mt-10 space-y-10">
      <SalaryBand min={salaryMin} max={salaryMax} mark={pack.pay} currency={currency} />
      <HonestyBlock honesty={pack.honesty} benefits={pack.benefits} />
      <WeekRing slices={pack.week} />
      <CareerMap nodes={pack.career} />
      {pack.workplace && <WorkplaceTour workplace={pack.workplace} />}
      <Voices voices={pack.voices} />
      <ToolsRack tools={pack.tools} />
      {pack.sim && <TaskSimPanel sim={pack.sim} onResolved={onSimResolved} />}
    </div>
  );
}

export { ApplyTrial } from "@/components/offer/apply-trial";

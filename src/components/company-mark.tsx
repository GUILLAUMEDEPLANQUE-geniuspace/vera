import { cn } from "@/lib/utils";

export function CompanyMark({ name, className }: { name: string; className?: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || "V";
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-lg bg-primary font-serif text-lg text-primary-fg",
        className,
      )}
    >
      {letter}
    </span>
  );
}

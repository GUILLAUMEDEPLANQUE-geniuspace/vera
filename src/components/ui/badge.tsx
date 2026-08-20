import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  children,
}: {
  className?: string;
  tone?: "default" | "good" | "warn" | "bad" | "primary";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tone === "default" && "bg-paper text-muted",
        tone === "primary" && "bg-primary/10 text-primary",
        tone === "good" && "bg-good/10 text-good",
        tone === "warn" && "bg-warn/12 text-warn",
        tone === "bad" && "bg-bad/10 text-bad",
        className,
      )}
    >
      {children}
    </span>
  );
}

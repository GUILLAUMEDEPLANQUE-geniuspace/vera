import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function LocaleToggle() {
  const [locale, setLocale] = useLocale();
  return (
    <div className="inline-flex h-9 items-center rounded-lg border border-border bg-surface p-0.5 text-[11px] font-medium sm:h-10 sm:text-xs">
      <button
        type="button"
        className={cn(
          "grid h-8 min-w-8 place-items-center rounded-md px-1.5 sm:h-9 sm:min-w-10 sm:px-2",
          locale === "fr" ? "bg-primary text-primary-fg" : "text-muted hover:text-ink",
        )}
        onClick={() => setLocale("fr")}
        aria-pressed={locale === "fr"}
      >
        FR
      </button>
      <button
        type="button"
        className={cn(
          "grid h-8 min-w-8 place-items-center rounded-md px-1.5 sm:h-9 sm:min-w-10 sm:px-2",
          locale === "en" ? "bg-primary text-primary-fg" : "text-muted hover:text-ink",
        )}
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}

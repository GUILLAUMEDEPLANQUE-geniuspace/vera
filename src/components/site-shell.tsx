import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LocaleToggle } from "@/components/locale-toggle";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [locale] = useLocale();
  const en = locale === "en";
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const nav = [
    { to: "/jobs", label: en ? "Jobs" : "Emplois" },
    { to: "/academies", label: en ? "Academies" : "Académies" },
    { to: "/companies", label: en ? "Companies" : "Entreprises" },
    { to: "/europe", label: "Europe" },
  ] as const;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-baseline gap-2">
            <span className="font-serif text-2xl tracking-tight text-primary">Vera</span>
            <span className="hidden text-xs tracking-wide text-muted 2xl:inline">
              {en ? "Proof before the degree." : "L’emploi, lisible."}
            </span>
          </Link>
          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-4 pr-3 lg:flex xl:gap-5">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "text-sm font-medium text-muted transition-colors hover:text-ink",
                  pathname.startsWith(item.to) && "text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            <LocaleToggle />
            <AuthSlot en={en} />
            <button
              type="button"
              className="grid size-11 place-items-center rounded-lg lg:hidden"
              aria-label={open ? (en ? "Close menu" : "Fermer le menu") : en ? "Open menu" : "Ouvrir le menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border px-4 py-3 lg:hidden">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
                {item.label}
              </Link>
            ))}
            <Link to="/marches" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              {en ? "Markets" : "Marchés"}
            </Link>
            <Link to="/me/formation" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              {en ? "My training" : "Ma formation"}
            </Link>
            <Link to="/savoirs" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              {en ? "Guides" : "Fiches"}
            </Link>
            <Link to="/jobs" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              {en ? "All jobs" : "Toutes les offres"}
            </Link>
            <SignedOut>
              <Link to="/login" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
                {en ? "Sign in" : "Connexion"}
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/me" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
                {en ? "My space" : "Mon espace"}
              </Link>
            </SignedIn>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <div className="font-serif text-xl text-primary">Vera</div>
            <p className="mt-1 max-w-md text-sm text-muted">
              {en
                ? "The trial before the CV. Miss → module → retry. A passport you can export. Europe, not a translation."
                : "L’épreuve avant le CV. Échec → module → retry. Un passeport exportable. Europe, pas une traduction."}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <Link to="/europe" className="hover:text-ink">
              Europe
            </Link>
            <Link to="/preuve" className="hover:text-ink">
              {en ? "Trial" : "Épreuve"}
            </Link>
            <Link to="/passport" className="hover:text-ink">
              {en ? "Passport" : "Passeport"}
            </Link>
            <Link to="/marches" className="hover:text-ink">
              {en ? "Markets" : "Marchés"}
            </Link>
            <Link to="/academies" className="hover:text-ink">
              {en ? "Academies" : "Académies"}
            </Link>
            <Link to="/apprendre" className="hover:text-ink">
              {en ? "Learn" : "Apprendre"}
            </Link>
            <Link to="/pacte" className="hover:text-ink">
              Pacte
            </Link>
            <Link to="/jobs" className="hover:text-ink">
              {en ? "Jobs" : "Emplois"}
            </Link>
            <Link to="/me" className="hover:text-ink">
              {en ? "My space" : "Mon espace"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AuthSlot({ en }: { en: boolean }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="hidden h-10 w-20 animate-pulse rounded-lg bg-paper lg:block" />;
  }
  return (
    <>
      <SignedOut>
        <Button asChild variant="secondary" size="sm" className="hidden lg:inline-flex">
          <Link to="/login">{en ? "Sign in" : "Connexion"}</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <div className="hidden items-center gap-3 sm:flex">
          <Link to="/passport" className="text-sm font-medium text-muted hover:text-ink">
            {en ? "Passport" : "Passeport"}
          </Link>
          <Link to="/me/formation" className="text-sm font-medium text-muted hover:text-ink">
            {en ? "Training" : "Formation"}
          </Link>
          <Link to="/me" className="text-sm font-medium text-muted hover:text-ink">
            {en ? "My space" : "Mon espace"}
          </Link>
          <UserButton />
        </div>
        {user && (
          <Link
            to="/me"
            className="grid size-10 place-items-center rounded-full bg-primary font-serif text-primary-fg sm:hidden"
          >
            {(user.displayName ?? "V").charAt(0)}
          </Link>
        )}
      </SignedIn>
    </>
  );
}

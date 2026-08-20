import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/jobs", label: "Emplois" },
  { to: "/companies", label: "Maisons" },
  { to: "/savoirs", label: "Savoirs" },
  { to: "/lieux", label: "Lieux" },
  { to: "/viviers", label: "Viviers" },
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-serif text-2xl tracking-tight text-primary">Vera</span>
            <span className="hidden text-xs tracking-wide text-muted sm:inline">L’emploi, lisible.</span>
          </Link>
          <nav className="hidden items-center gap-5 lg:flex">
            {NAV.map((item) => (
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
          <div className="flex items-center gap-2">
            <AuthSlot />
            <button
              type="button"
              className="grid size-11 place-items-center rounded-lg lg:hidden"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border px-4 py-3 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block py-3 text-base text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link to="/savoirs" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Savoirs
            </Link>
            <Link to="/drive" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Drive
            </Link>
            <Link to="/lexique" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Lexique
            </Link>
            <Link to="/marche" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Marché
            </Link>
            <Link to="/pacte" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Pacte
            </Link>
            <Link to="/me/brief" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Brief
            </Link>
            <Link to="/coach" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Coach
            </Link>
            <Link to="/me/carnet" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Carnet
            </Link>
            <Link to="/me/maison" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Maison
            </Link>
            <Link to="/guides" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Guides
            </Link>
            <Link to="/apprendre" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Apprendre
            </Link>
            <Link to="/me/creneaux" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Créneaux
            </Link>
            <Link to="/post" onClick={() => setOpen(false)} className="block py-3 text-base text-ink">
              Publier une offre
            </Link>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <div className="font-serif text-xl text-primary">Vera</div>
            <p className="mt-1 max-w-md text-sm text-muted">
              Le Verdict dit de passer. Le Pacte rend les retards visibles. Le Brief remplace le CV. Les Savoirs
              préforment le geste.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <Link to="/savoirs" className="hover:text-ink">
              Savoirs
            </Link>
            <Link to="/drive" className="hover:text-ink">
              Drive
            </Link>
            <Link to="/lexique" className="hover:text-ink">
              Lexique
            </Link>
            <Link to="/viviers" className="hover:text-ink">
              Viviers
            </Link>
            <Link to="/apprendre" className="hover:text-ink">
              Apprendre
            </Link>
            <Link to="/me/creneaux" className="hover:text-ink">
              Créneaux
            </Link>
            <Link to="/journal" className="hover:text-ink">
              Journal
            </Link>
            <Link to="/tension" className="hover:text-ink">
              Tension
            </Link>
            <Link to="/ppqc" className="hover:text-ink">
              PPQC
            </Link>
            <Link to="/lieux" className="hover:text-ink">
              Lieux
            </Link>
            <Link to="/metiers" className="hover:text-ink">
              Métiers
            </Link>
            <Link to="/guides" className="hover:text-ink">
              Guides
            </Link>
            <Link to="/marche" className="hover:text-ink">
              Marché
            </Link>
            <Link to="/pacte" className="hover:text-ink">
              Pacte
            </Link>
            <Link to="/coach" className="hover:text-ink">
              Coach
            </Link>
            <Link to="/post" className="hover:text-ink">
              Publier
            </Link>
            <Link to="/me" className="hover:text-ink">
              Espace
            </Link>
            <a href="/sitemap.xml" className="hover:text-ink">
              Sitemap
            </a>
            <a href="/llms.txt" className="hover:text-ink">
              llms.txt
            </a>
            <a href="/feed.json" className="hover:text-ink">
              feed.json
            </a>
            <a href="/vera-code.zip" download="vera-code.zip" className="hover:text-ink">
              Code source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-10 w-24 animate-pulse rounded-lg bg-paper" />;
  }
  return (
    <>
      <SignedOut>
        <Button asChild variant="secondary" size="sm">
          <Link to="/login">Connexion</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <div className="hidden items-center gap-3 sm:flex">
          <Link to="/me/brief" className="text-sm font-medium text-muted hover:text-ink">
            Brief
          </Link>
          <Link to="/me" className="text-sm font-medium text-muted hover:text-ink">
            Espace
          </Link>
          <UserButton />
        </div>
        {user && (
          <Link to="/me" className="grid size-10 place-items-center rounded-full bg-primary font-serif text-primary-fg sm:hidden">
            {(user.displayName ?? "V").charAt(0)}
          </Link>
        )}
      </SignedIn>
    </>
  );
}

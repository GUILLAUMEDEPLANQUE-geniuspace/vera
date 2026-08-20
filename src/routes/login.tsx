import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await authClient.signUp.email({ name: name || email.split("@")[0]!, email, password });
        if (error) throw new Error(error.message ?? "Inscription impossible");
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "Connexion impossible");
      }
      toast.success(mode === "up" ? "Compte créé" : "Connecté");
      void navigate({ to: "/me" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Espace Vera</p>
        <h1 className="mt-3 font-serif text-5xl">Entrez.</h1>
        <p className="mt-4 max-w-md text-muted">
          Un compte pour postuler, suivre vos candidatures, et activer le signal sur chaque offre. Google, X, ou un
          email.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-soft sm:p-8">
        {authEnabled ? (
          <div className="space-y-3">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => void signIn(p.providerId, { callbackURL: "/me" })}
              >
                Continuer avec {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">La connexion est désactivée.</p>
        )}

        <div className="my-6 flex items-center gap-3 text-xs tracking-wide text-subtle uppercase">
          <span className="h-px flex-1 bg-border" />
          ou par email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onEmail} className="space-y-3">
          {mode === "up" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "…" : mode === "up" ? "Créer le compte" : "Se connecter"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 text-sm text-muted hover:text-ink"
          onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
        >
          {mode === "in" ? "Pas encore de compte ? Créer un espace" : "Déjà un compte ? Se connecter"}
        </button>
        <p className="mt-6 text-xs text-subtle">
          En continuant, vous acceptez que Vera stocke votre profil et vos candidatures.{" "}
          <Link to="/" className="underline">
            Retour
          </Link>
        </p>
      </div>
    </div>
  );
}

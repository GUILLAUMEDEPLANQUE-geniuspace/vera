import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { detectPlace } from "@/lib/geo";
import { useLocale } from "@/lib/locale";

export function SearchBar({
  initial = "",
  size = "lg",
}: {
  initial?: string;
  size?: "md" | "lg";
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initial);
  const [locale] = useLocale();
  const en = locale === "en";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const raw = q.trim();
    if (!raw) {
      void navigate({ to: "/jobs" });
      return;
    }
    const place = detectPlace(raw);
    if (place.city) {
      void navigate({ to: "/lieux/$city", params: { city: place.city.slug } });
      return;
    }
    if (place.dept) {
      void navigate({ to: "/lieux/departements/$slug", params: { slug: place.dept.slug } });
      return;
    }
    if (place.region) {
      void navigate({ to: "/lieux/regions/$slug", params: { slug: place.region.slug } });
      return;
    }
    if (place.eu) {
      void navigate({ to: "/lieux/$city", params: { city: place.eu.slug } });
      return;
    }
    void navigate({ to: "/jobs", search: { q: raw } });
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={en ? "Agent Berlin, FHIR, lockout Fos…" : "Électricien Rennes, Fos, Berlin, Nord…"}
          aria-label={en ? "Search a role or a place" : "Rechercher une offre ou un territoire"}
          className={size === "lg" ? "h-12 rounded-xl pl-10 text-base" : "pl-10"}
        />
      </div>
      <Button type="submit" size={size === "lg" ? "lg" : "md"} className="px-6">
        {en ? "Search" : "Chercher"}
      </Button>
    </form>
  );
}

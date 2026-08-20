export function SeoFaq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl sm:text-3xl">Questions fréquentes</h2>
      <dl className="mt-5 divide-y divide-border border-y border-border">
        {items.map((f) => (
          <div key={f.q} className="py-4">
            <dt className="font-medium text-ink">{f.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

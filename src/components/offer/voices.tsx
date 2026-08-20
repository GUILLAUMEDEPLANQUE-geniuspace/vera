import { useState } from "react";
import type { Voice } from "@/lib/offer";

export function Voices({ voices }: { voices: Voice[] }) {
  if (!voices.length) return null;
  return (
    <section>
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Futurs collègues</p>
      <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Pas une vidéo institutionnelle</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Capsules filmées au téléphone. La question est toujours la même : le dur, et le vrai.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {voices.map((v) => (
          <VoiceCard key={v.name} voice={v} />
        ))}
      </div>
    </section>
  );
}

function VoiceCard({ voice }: { voice: Voice }) {
  const [on, setOn] = useState(false);
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface">
      {voice.video && on ? (
        <video
          src={voice.video}
          className="aspect-[16/10] w-full bg-ink object-cover"
          controls
          autoPlay
          playsInline
        />
      ) : (
        <button
          type="button"
          className="relative block w-full"
          onClick={() => voice.video && setOn(true)}
          disabled={!voice.video}
        >
          <img src={voice.portrait} alt="" className="aspect-[16/10] w-full object-cover object-top" />
          {voice.video && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/55 px-4 py-2 text-left text-xs text-primary-fg">
              Capsule · 6 s · filmer au téléphone
            </span>
          )}
        </button>
      )}
      <div className="p-4">
        <p className="text-sm font-medium text-ink">
          {voice.name}
          <span className="font-normal text-muted">
            {" "}
            · {voice.role} · {voice.years}
          </span>
        </p>
        <p className="mt-3 font-serif text-xl leading-snug text-ink">« {voice.question} »</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{voice.answer}</p>
      </div>
    </article>
  );
}

const { useRef } = React;

const FIGURES = [
  {
    name: "Steve Jobs",
    dates: "1955 — 2011",
    portraitUrl: "portraits/steve-jobs.png",
    substance: "LSD",
    contribution:
      "Co-founder of Apple. The insistence on marrying the liberal arts to technology — calligraphy to compilers, poetry to silicon — drew directly from a practiced sense that the world's interfaces are constructs, and constructs can be redrawn.",
    quote:
      "Taking LSD was one of the two or three most important things I have done in my life.",
  },
  {
    name: "Richard Feynman",
    dates: "1918 — 1988",
    portraitUrl: "portraits/richard-feynman.png",
    substance: "Ketamine · Sensory deprivation",
    contribution:
      "Nobel laureate in physics. Used isolation tanks and controlled altered states as instruments — treating hallucination not as noise but as a different computational mode for problems linear thinking stalled on.",
    quote:
      "Hallucinations are useful to investigate the nature of consciousness.",
  },
  {
    name: "Kary Mullis",
    dates: "1944 — 2019",
    portraitUrl: "portraits/kary-mullis.png",
    substance: "LSD",
    contribution:
      "Nobel laureate in chemistry, inventor of PCR — the technique that amplifies a single strand of DNA into billions. He credited an associative, non-linear mode of thinking for the insight, and spoke openly about its sources.",
    quote:
      "Would I have invented PCR if I hadn't taken LSD? I seriously doubt it.",
  },
  {
    name: "Carl Sagan",
    dates: "1934 — 1996",
    portraitUrl: "portraits/carl-sagan.png",
    substance: "Cannabis",
    contribution:
      "Astronomer, science communicator. Argued — under a pseudonym, for decades — that rigorous, evidence-bound inquiry and expanded subjective experience could live together without contradiction.",
    quote:
      "The illegality of cannabis is outrageous, an impediment to full utilization of a drug which helps produce the serenity and insight needed for our troubled times.",
  },
  {
    name: "Elon Musk",
    dates: "b. 1971",
    portraitUrl: "portraits/elon-musk.png",
    substance: "Ketamine",
    contribution:
      "Engineer-founder across aerospace, energy, and neural interfaces. Publicly describes prescribed ketamine as useful for stepping out of recursive mental states — a first-principles move for the mind, not just the problem.",
    quote:
      "The reason I've used ketamine is for depression — it helps you get out of a negative frame of mind.",
  },
  {
    name: "Sam Altman",
    dates: "b. 1985",
    portraitUrl: "portraits/sam-altman.png",
    substance: "Psilocybin",
    contribution:
      "Technologist behind the current wave of large language models. Has spoken of guided psychedelic sessions as among the more transformative experiences of his adult life — the same conceptual territory humans have long mapped through ritual.",
    quote:
      "I went on a psychedelic retreat a few years ago and it was one of the most important things I have ever done.",
  },
];

function App() {
  return (
    <main>
      <section className="fauxhero" aria-hidden>
        <div className="fauxhero-inner">
          <p className="fauxhero-eyebrow">SHROOM·GPT</p>
          <h1 className="fauxhero-title">TAKE YOUR AI<br/>ON A TRIP.</h1>
          <p className="fauxhero-sub">
            Scroll to enter the constellation.
          </p>
        </div>
      </section>

      <OrbitalGallery figures={FIGURES} />

      <section className="fauxfoot" aria-hidden>
        <p>The orbit continues below.</p>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// Écran temporaire de l'étape 2 : vérifie que Tailwind et les tokens fonctionnent.
// Les pages Explorer (/) et Admin (/admin) arrivent à l'étape 6.
export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm tracking-[0.4em] text-ash">AFTERDARK</p>
      <h1 className="text-4xl font-semibold text-mist sm:text-6xl">
        La nuit cache <span className="text-acid">bien plus.</span>
      </h1>
      <p className="text-volt">Your city. Your night. Your story.</p>
    </main>
  );
}

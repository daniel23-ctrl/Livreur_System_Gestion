import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center sm:justify-end sm:pr-12 md:pr-20">
      {/* Image de fond fixe avec bon positionnement */}
      <Image
        src="/back.jpeg" // ou le bon chemin d'accès
        alt="KUSI Background"
        fill
        priority
        className="object-cover object-center -z-10"
        sizes="100vw"
      />

      {/* Superposition de couleur si nécessaire (optionnel pour la lisibilité) */}
      <div className="absolute inset-0 bg-black/10 -z-10" />

      {/* Contenu du formulaire (page child) */}
      <div className="w-full max-w-md p-4 sm:p-0">
        {children}
      </div>
    </div>
  );
}
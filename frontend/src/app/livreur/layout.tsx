import { LivreurProvider } from "@/contexts/LivreurContext";

export default function LivreurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LivreurProvider>
      {children}
    </LivreurProvider>
  );
}
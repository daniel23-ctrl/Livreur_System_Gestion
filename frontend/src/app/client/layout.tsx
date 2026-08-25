import { ClientNotificationsProvider } from "@/contexts/ClientNotificationsContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientNotificationsProvider>
      {children}
    </ClientNotificationsProvider>
  );
}
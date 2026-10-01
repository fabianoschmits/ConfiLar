import { ModernHeader } from "@/components/layout/ModernHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { FullNotificationList } from "@/components/notifications/FullNotificationList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notificações | ConfiLar",
  description: "Visualize todas as suas notificações e alertas.",
};

export default function NotificationsPage() {
  return (
    <MainLayout requireAuth={true}>
      <div className="app-page app-page--narrow">
        <PageHeader
          title="Notificações"
          description="Suas atividades, mensagens e alertas em um só lugar."
        />

        <FullNotificationList />
      </div>
    </MainLayout>
  );
}

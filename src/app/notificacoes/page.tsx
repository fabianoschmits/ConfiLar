import { ModernHeader } from "@/components/layout/ModernHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { FullNotificationList } from "@/components/notifications/FullNotificationList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notificações | ConfiLar",
  description: "Visualize todas as suas notificações e alertas.",
};

export default function NotificationsPage() {
  return (
    <MainLayout requireAuth={true}>
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Notificações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe todas as suas atividades, mensagens e alertas em um só
            lugar.
          </p>
        </div>

        <FullNotificationList />
      </div>
    </MainLayout>
  );
}

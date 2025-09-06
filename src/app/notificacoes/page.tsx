import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { NotificationList } from '@/components/notifications/NotificationList';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { FadeIn } from '@/components/animations/FadeIn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings } from 'lucide-react';

export default function NotificacoesPage() {
  return (
    <MainLayout requireAuth={true}>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <FadeIn delay={0.1}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Notificações
              </h1>
              <p className="text-gray-600">
                Gerencie suas notificações e preferências de comunicação
              </p>
            </div>

            <Tabs defaultValue="notifications" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="space-y-6">
                <NotificationList />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <NotificationSettings />
              </TabsContent>
            </Tabs>
          </FadeIn>
        </div>
      </PageTransition>
    </MainLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfessionalAgenda } from '@/components/agenda/ProfessionalAgenda';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AgendaPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [isProfessional, setIsProfessional] = useState(false);

  useEffect(() => {
    if (user) {
      // Verificar se o usuário é profissional
      const checkUserType = async () => {
        try {
          const response = await fetch(`/api/user-type?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setIsProfessional(data.userType === 'professional');
          }
        } catch (error) {
          console.error('Erro ao verificar tipo de usuário:', error);
        }
      };
      checkUserType();
    }
  }, [user]);

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-4">Agenda</h1>
              <p className="text-gray-600 mb-4">
                Faça login para acessar sua agenda.
              </p>
              <Button onClick={() => router.push('/auth')}>
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!isProfessional) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-4">Agenda</h1>
              <p className="text-gray-600 mb-4">
                Esta funcionalidade está disponível apenas para profissionais.
              </p>
              <Button onClick={() => router.push('/perfil')}>
                Completar Perfil
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Minha Agenda Profissional</h1>
        <ProfessionalAgenda />
      </div>
    </MainLayout>
  );
}

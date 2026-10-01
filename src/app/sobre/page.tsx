"use client";

import {
  Shield,
  Users,
  Zap,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Instagram,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/common/BrandLogo";
import { useTranslations } from "next-intl";

// Desabilitar SSG para esta página
export const dynamic = "force-dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SobrePage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthContext();
  const t = useTranslations("about");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Se o usuário estiver logado, usar MainLayout
  if (user) {
    return (
      <MainLayout requireAuth={false}>
        <div className="app-screen bg-[var(--cl-paper)]">
          <div className="app-page">
            {/* Header da Página */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--cl-ink)] mb-6 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-base sm:text-lg text-[var(--cl-ink-secondary)] max-w-3xl mx-auto leading-relaxed">
                {t("subtitle")}
              </p>
            </div>

            {/* Benefícios */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--cl-ink)] text-center mb-6">
                {t("whyChoose")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield
                        size={32}
                        className="text-[var(--cl-teal)] dark:text-blue-400"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--cl-ink)] mb-4">
                      {t("security.title")}
                    </h3>
                    <p className="text-[var(--cl-ink-secondary)]">
                      {t("security.description")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users
                        size={32}
                        className="text-green-600 dark:text-green-400"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--cl-ink)] mb-4">
                      {t("qualified.title")}
                    </h3>
                    <p className="text-[var(--cl-ink-secondary)]">
                      {t("qualified.description")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="w-16 h-16 bg-[var(--cl-mist)] dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Zap
                        size={32}
                        className="text-[var(--cl-teal)] dark:text-[var(--cl-teal)]"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--cl-ink)] mb-4">
                      {t("fast.title")}
                    </h3>
                    <p className="text-[var(--cl-ink-secondary)]">
                      {t("fast.description")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Serviços */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--cl-ink)] text-center mb-6">
                {t("services")}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  {
                    icon: "🏠",
                    title: "Limpeza",
                    desc: "Limpeza residencial e comercial",
                  },
                  {
                    icon: "🔧",
                    title: "Manutenção",
                    desc: "Reparos e manutenção geral",
                  },
                  {
                    icon: "🌱",
                    title: "Jardinagem",
                    desc: "Cuidados com plantas e jardins",
                  },
                  {
                    icon: "📱",
                    title: "Tecnologia",
                    desc: "Suporte técnico e instalações",
                  },
                  {
                    icon: "🎨",
                    title: "Decoração",
                    desc: "Design e organização de espaços",
                  },
                  {
                    icon: "🚗",
                    title: "Transporte",
                    desc: "Serviços de mobilidade",
                  },
                  {
                    icon: "📚",
                    title: "Educação",
                    desc: "Aulas particulares e cursos",
                  },
                  {
                    icon: "💼",
                    title: "Consultoria",
                    desc: "Orientações profissionais",
                  },
                ].map((service, index) => (
                  <Card
                    key={index}
                    className="p-6 text-center hover:shadow-lg transition-shadow"
                  >
                    <CardContent>
                      <div className="text-4xl mb-4">{service.icon}</div>
                      <h3 className="text-lg font-semibold text-[var(--cl-ink)] mb-2">
                        {service.title}
                      </h3>
                      <p className="text-sm text-[var(--cl-ink-secondary)]">
                        {service.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contato */}
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--cl-ink)] mb-8">
                Entre em contato
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" className="px-6 py-3">
                  <Link href="/ajuda">
                    <Mail className="h-5 w-5 mr-2" />
                    Central de Ajuda
                  </Link>
                </Button>
                <Button asChild className="px-6 py-3">
                  <Link href="/buscar">
                    <Users className="h-5 w-5 mr-2" />
                    Buscar Profissionais
                  </Link>
                </Button>
                <Button asChild variant="outline" className="px-6 py-3">
                  <a
                    href="https://www.instagram.com/appconfilar"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="h-5 w-5 mr-2" />
                    @appconfilar
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Se o usuário não estiver logado, mostrar página pública
  return (
    <MainLayout requireAuth={false}>
      <div className="app-screen bg-[var(--cl-paper)]">
        {/* Hero Section */}
        <div className="app-page">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--cl-ink)] mb-6 tracking-tight">
              Conectando profissionais e clientes
            </h1>
            <p className="text-base sm:text-lg text-[var(--cl-ink-secondary)] max-w-3xl mx-auto leading-relaxed mb-8">
              A plataforma que facilita a contratação de serviços domésticos e
              comerciais de forma segura e confiável
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth?tab=register"
                className="px-5 py-3 bg-[var(--cl-cta)] text-[var(--cl-on-cta)] rounded-full text-sm font-medium hover:brightness-110 transition-colors"
              >
                Começar agora
              </Link>
              <Link
                href="/buscar"
                className="px-5 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Buscar profissionais
              </Link>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="app-page">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--cl-ink)] text-center mb-6">
            Por que escolher o ConfiLar?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield
                    size={32}
                    className="text-[var(--cl-teal)] dark:text-blue-400"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[var(--cl-ink)] mb-4">
                  Segurança garantida
                </h3>
                <p className="text-[var(--cl-ink-secondary)]">
                  Todos os profissionais são verificados e as transações são
                  protegidas para sua tranquilidade
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users
                    size={32}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[var(--cl-ink)] mb-4">
                  Profissionais qualificados
                </h3>
                <p className="text-[var(--cl-ink-secondary)]">
                  Acesso a uma rede de profissionais experientes e bem avaliados
                  pelos clientes
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="w-16 h-16 bg-[var(--cl-mist)] dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap
                    size={32}
                    className="text-[var(--cl-teal)] dark:text-[var(--cl-teal)]"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[var(--cl-ink)] mb-4">
                  Processo rápido
                </h3>
                <p className="text-[var(--cl-ink-secondary)]">
                  Cadastro simples e navegação intuitiva para encontrar o que
                  você precisa rapidamente
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Serviços */}
        <div className="app-page">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--cl-ink)] text-center mb-6">
            Serviços disponíveis
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: "🏠",
                title: "Limpeza",
                desc: "Limpeza residencial e comercial",
              },
              {
                icon: "🔧",
                title: "Manutenção",
                desc: "Reparos e manutenção geral",
              },
              {
                icon: "🌱",
                title: "Jardinagem",
                desc: "Cuidados com plantas e jardins",
              },
              {
                icon: "📱",
                title: "Tecnologia",
                desc: "Suporte técnico e instalações",
              },
              {
                icon: "🎨",
                title: "Decoração",
                desc: "Design e organização de espaços",
              },
              {
                icon: "🚗",
                title: "Transporte",
                desc: "Serviços de mobilidade",
              },
              {
                icon: "📚",
                title: "Educação",
                desc: "Aulas particulares e cursos",
              },
              {
                icon: "💼",
                title: "Consultoria",
                desc: "Orientações profissionais",
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <CardContent>
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-lg font-semibold text-[var(--cl-ink)] mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-[var(--cl-ink-secondary)]">
                    {service.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contato */}
        <div className="app-page text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--cl-ink)] mb-8">
            Entre em contato
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ajuda"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center"
            >
              <Mail className="h-5 w-5 mr-2" />
              Central de Ajuda
            </Link>
            <Link
              href="/buscar"
              className="px-6 py-3 bg-[var(--cl-cta)] text-[var(--cl-on-cta)] rounded-lg hover:brightness-110 transition-colors inline-flex items-center"
            >
              <Users className="h-5 w-5 mr-2" />
              Buscar Profissionais
            </Link>
            <a
              href="https://www.instagram.com/appconfilar"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center"
            >
              <Instagram className="h-5 w-5 mr-2" />
              @appconfilar
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  MessageCircle,
  Shield,
  Users,
  Star,
  Award,
  Settings,
  Zap,
  TrendingUp,
  BarChart3,
  Info,
  Check,
  AlertCircle,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Smartphone,
  Home,
  Building,
  Globe,
  ChevronsDown,
  Image,
  Layout,
  Bold,
  Italic,
  Underline,
  LogOut,
  Instagram,
  MessageSquare,
} from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import { useTranslations } from "next-intl";
import SupportModule from "@/modules/support/SupportModule";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AjudaPage() {
  const t = useTranslations("help");
  const tCommon = useTranslations("common");
  const [showSupport, setShowSupport] = useState(false);
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticket_id");

  useEffect(() => {
    if (
      ticketId ||
      searchParams.get("show") === "support" ||
      searchParams.get("open") === "tickets"
    ) {
      setShowSupport(true);
    }
  }, [ticketId, searchParams]);

  return (
    <ClientOnly>
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-black">
          <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* Header da Página */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Info className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {t("title")}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    {t("description")}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowSupport(!showSupport)}
                className="gap-2 shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              >
                {showSupport ? (
                  <>Voltar aos Artigos</>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    Abrir Ticket de Suporte
                  </>
                )}
              </Button>
            </div>

            {showSupport ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="min-h-[500px] sm:min-h-[600px] p-3 sm:p-6 bg-background/60 backdrop-blur-md border-primary/20">
                  <SupportModule initialTicketId={ticketId} />
                </Card>
              </div>
            ) : (
              <div className="grid gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                {/* Seção: Como Funciona */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Info className="h-6 w-6 text-blue-600" />
                      </div>
                      {t("howItWorks")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-6">
                      {t("howItWorksDescription")}
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {t("forClients")}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {t("forClientsDescription")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Star className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {t("forProfessionals")}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {t("forProfessionalsDescription")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seção: Recursos Principais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Zap className="h-6 w-6 text-yellow-600" />
                      </div>
                      {t("mainFeatures")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700">{t("feature1")}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700">{t("feature2")}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700">{t("feature3")}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700">{t("feature4")}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700">{t("feature5")}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700">{t("feature6")}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700">{t("feature7")}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700">{t("feature8")}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seção: Como Usar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-green-600" />
                      </div>
                      {t("howToUse")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            1
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {t("step1Title")}
                          </h4>
                          <p className="text-gray-600">
                            {t("step1Description")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            2
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {t("step2Title")}
                          </h4>
                          <p className="text-gray-600">
                            {t("step2Description")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            3
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {t("step3Title")}
                          </h4>
                          <p className="text-gray-600">
                            {t("step3Description")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            4
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {t("step4Title")}
                          </h4>
                          <p className="text-gray-600">
                            {t("step4Description")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seção: Contato */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-orange-600" />
                      </div>
                      {t("needMoreHelp")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-6">
                      {t("contactDescription")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href="mailto:suporte@appconfilar.com.br"
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t("emailSupport")}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            suporte@appconfilar.com.br
                          </p>
                        </div>
                      </a>
                      <a
                        href="https://www.instagram.com/appconfilar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Instagram className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t("instagram")}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            @appconfilar
                          </p>
                        </div>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </ClientOnly>
  );
}

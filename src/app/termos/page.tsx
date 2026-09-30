"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Download,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function TermosPage() {
  const { user } = useAuthContext();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("terms");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const Layout = user ? MainLayout : PublicLayout;

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--cl-paper)] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white">
                  {t("title")}
                </h1>
                <p className="text-gray-600">{t("subtitle")}</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {t("lastUpdate")}
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                {t("version")}
              </div>
            </div>
          </div>

          {/* Aviso Importante */}
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">
                    {t("importantNotice")}
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {t("importantNoticeText")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-8">
              {/* 1. Definições */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      1
                    </span>
                    {t("section1.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section1.subtitle")}
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        <strong>"ConfiLar"</strong> {t("section1.confilar")}
                      </li>
                      <li>
                        <strong>"Usuário"</strong> {t("section1.user")}
                      </li>
                      <li>
                        <strong>"Cliente"</strong> {t("section1.client")}
                      </li>
                      <li>
                        <strong>"Profissional"</strong>{" "}
                        {t("section1.professional")}
                      </li>
                      <li>
                        <strong>"Serviços"</strong> {t("section1.services")}
                      </li>
                      <li>
                        <strong>"Conteúdo"</strong> {t("section1.content")}
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Aceitação dos Termos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      2
                    </span>
                    {t("section2.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{t("section2.description")}</p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {t("section2.item1")}
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {t("section2.item2")}
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {t("section2.item3")}
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {t("section2.item4")}
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* 3. Descrição dos Serviços */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      3
                    </span>
                    {t("section3.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{t("section3.description")}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {t("section3.forClients")}
                      </h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• {t("section3.forClientsItem1")}</li>
                        <li>• {t("section3.forClientsItem2")}</li>
                        <li>• {t("section3.forClientsItem3")}</li>
                        <li>• {t("section3.forClientsItem4")}</li>
                        <li>• {t("section3.forClientsItem5")}</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {t("section3.forProfessionals")}
                      </h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• {t("section3.forProfessionalsItem1")}</li>
                        <li>• {t("section3.forProfessionalsItem2")}</li>
                        <li>• {t("section3.forProfessionalsItem3")}</li>
                        <li>• {t("section3.forProfessionalsItem4")}</li>
                        <li>• {t("section3.forProfessionalsItem5")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Cadastro e Conta */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      4
                    </span>
                    {t("section4.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section4.requirements")}
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• {t("section4.requirement1")}</li>
                      <li>• {t("section4.requirement2")}</li>
                      <li>• {t("section4.requirement3")}</li>
                      <li>• {t("section4.requirement4")}</li>
                      <li>• {t("section4.requirement5")}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section4.responsibilities")}
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• {t("section4.responsibility1")}</li>
                      <li>• {t("section4.responsibility2")}</li>
                      <li>• {t("section4.responsibility3")}</li>
                      <li>• {t("section4.responsibility4")}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 5. Condutas Proibidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      5
                    </span>
                    {t("section5.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{t("section5.description")}</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">
                        {t("section5.contentTitle")}
                      </h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• {t("section5.contentItem1")}</li>
                        <li>• {t("section5.contentItem2")}</li>
                        <li>• {t("section5.contentItem3")}</li>
                        <li>• {t("section5.contentItem4")}</li>
                        <li>• {t("section5.contentItem5")}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">
                        {t("section5.behaviorTitle")}
                      </h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• {t("section5.behaviorItem1")}</li>
                        <li>• {t("section5.behaviorItem2")}</li>
                        <li>• {t("section5.behaviorItem3")}</li>
                        <li>• {t("section5.behaviorItem4")}</li>
                        <li>• {t("section5.behaviorItem5")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 6. Propriedade Intelectual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      6
                    </span>
                    {t("section6.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section6.rightsTitle")}
                    </h4>
                    <p className="text-gray-700 mb-2">
                      {t("section6.rightsDescription")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section6.userContentTitle")}
                    </h4>
                    <p className="text-gray-700 mb-2">
                      {t("section6.userContentDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 7. Privacidade e Proteção de Dados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      7
                    </span>
                    {t("section7.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    O tratamento de dados pessoais segue nossa{" "}
                    <Link
                      href="/privacidade"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      {t("section7.privacyPolicy")}
                    </Link>{" "}
                    e está em conformidade com a LGPD.
                  </p>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section7.rightsTitle")}
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• {t("section7.right1")}</li>
                      <li>• {t("section7.right2")}</li>
                      <li>• {t("section7.right3")}</li>
                      <li>• {t("section7.right4")}</li>
                      <li>• {t("section7.right5")}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 8. Limitação de Responsabilidade */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      8
                    </span>
                    {t("section8.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{t("section8.description")}</p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• {t("section8.item1")}</li>
                    <li>• {t("section8.item2")}</li>
                    <li>• {t("section8.item3")}</li>
                    <li>• {t("section8.item4")}</li>
                    <li>• {t("section8.item5")}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* 9. Modificações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      9
                    </span>
                    {t("section9.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{t("section9.description")}</p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• {t("section9.item1")}</li>
                    <li>• {t("section9.item2")}</li>
                    <li>• {t("section9.item3")}</li>
                  </ul>
                  <p className="text-gray-700">{t("section9.continuation")}</p>
                </CardContent>
              </Card>

              {/* 10. Rescisão */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      10
                    </span>
                    {t("section10.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section10.byUserTitle")}
                    </h4>
                    <p className="text-gray-700">
                      {t("section10.byUserDescription")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section10.byConfilarTitle")}
                    </h4>
                    <p className="text-gray-700">
                      {t("section10.byConfilarDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 11. Lei Aplicável */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      11
                    </span>
                    {t("section11.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{t("section11.description")}</p>
                </CardContent>
              </Card>

              {/* 12. Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                      12
                    </span>
                    {t("section12.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{t("section12.description")}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          {t("section12.email")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          {t("section12.phone")}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <ExternalLink className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          {t("section12.website")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          {t("section12.helpCenter")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-500 mb-4 md:mb-0">
                <p>{t("footer.copyright")}</p>
                <p>{t("footer.validFrom")}</p>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/privacidade">
                    <Shield className="h-4 w-4 mr-2" />
                    {t("footer.privacyPolicy")}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/ajuda">
                    <Users className="h-4 w-4 mr-2" />
                    {t("footer.helpCenter")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

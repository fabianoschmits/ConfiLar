"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { SafeHTML } from "@/lib/sanitize";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Calendar,
  FileText,
  Users,
  Database,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function PrivacidadePage() {
  const { user } = useAuthContext();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("privacy");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const Layout = user ? MainLayout : PublicLayout;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-green-600" />
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
                {t("lgpdCompliance")}
              </div>
            </div>
          </div>

          {/* Aviso LGPD */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">
                    {t("lgpdNotice")}
                  </h3>
                  <p className="text-green-700 text-sm">
                    {t("lgpdNoticeText")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {/* 1. Introdução */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                    1
                  </span>
                  {t("section1.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{t("section1.description")}</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    {t("section1.dataController")}
                  </h4>
                  <SafeHTML
                    html={t("section1.dataControllerInfo")}
                    className="text-blue-700 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Dados Coletados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                    2
                  </span>
                  {t("section2.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section2.identificationTitle")}
                    </h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• {t("section2.identificationItem1")}</li>
                      <li>• {t("section2.identificationItem2")}</li>
                      <li>• {t("section2.identificationItem3")}</li>
                      <li>• {t("section2.identificationItem4")}</li>
                      <li>• {t("section2.identificationItem5")}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section2.locationTitle")}
                    </h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• {t("section2.locationItem1")}</li>
                      <li>• {t("section2.locationItem2")}</li>
                      <li>• {t("section2.locationItem3")}</li>
                      <li>• {t("section2.locationItem4")}</li>
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t("section2.professionalTitle")}
                    </h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• {t("section2.professionalItem1")}</li>
                      <li>• {t("section2.professionalItem2")}</li>
                      <li>• {t("section2.professionalItem3")}</li>
                      <li>• {t("section2.professionalItem4")}</li>
                      <li>• {t("section2.professionalItem5")}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t("section2.usageTitle")}
                    </h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• {t("section2.usageItem1")}</li>
                      <li>• {t("section2.usageItem2")}</li>
                      <li>• {t("section2.usageItem3")}</li>
                      <li>• {t("section2.usageItem4")}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    {t("section2.financialTitle")}
                  </h4>
                  <ul className="grid sm:grid-cols-3 gap-2 text-blue-800 dark:text-blue-200 text-sm">
                    <li>• {t("section2.financialItem1")}</li>
                    <li>• {t("section2.financialItem2")}</li>
                    <li>• {t("section2.financialItem3")}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 3. Finalidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                    3
                  </span>
                  {t("section3.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section3.consentTitle")}
                    </h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• {t("section3.consentItem1")}</li>
                      <li>• {t("section3.consentItem2")}</li>
                      <li>• {t("section3.consentItem3")}</li>
                      <li>• {t("section3.consentItem4")}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section3.legitimateInterestTitle")}
                    </h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• {t("section3.legitimateInterestItem1")}</li>
                      <li>• {t("section3.legitimateInterestItem2")}</li>
                      <li>• {t("section3.legitimateInterestItem3")}</li>
                      <li>• {t("section3.legitimateInterestItem4")}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Seus Direitos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                    4
                  </span>
                  {t("section4.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Eye className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {t("section4.accessTitle")}
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {t("section4.accessDescription")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {t("section4.correctionTitle")}
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {t("section4.correctionDescription")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Download className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {t("section4.portabilityTitle")}
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {t("section4.portabilityDescription")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Trash2 className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {t("section4.deletionTitle")}
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {t("section4.deletionDescription")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {t("section4.oppositionTitle")}
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {t("section4.oppositionDescription")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {t("section4.revocationTitle")}
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {t("section4.revocationDescription")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    {t("section4.howToExerciseTitle")}
                  </h4>
                  <p className="text-blue-700 text-sm">
                    {t("section4.howToExerciseDescription")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 5. Compartilhamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                    5
                  </span>
                  {t("section5.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{t("section5.description")}</p>
                <ul className="space-y-2 text-gray-700">
                  <li>• {t("section5.item1")}</li>
                  <li>• {t("section5.item2")}</li>
                  <li>• {t("section5.item3")}</li>
                  <li>• {t("section5.item4")}</li>
                </ul>
              </CardContent>
            </Card>

            {/* 6. Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                    6
                  </span>
                  {t("section6.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section6.technicalTitle")}
                    </h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• {t("section6.technicalItem1")}</li>
                      <li>• {t("section6.technicalItem2")}</li>
                      <li>• {t("section6.technicalItem3")}</li>
                      <li>• {t("section6.technicalItem4")}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                      {t("section6.organizationalTitle")}
                    </h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• {t("section6.organizationalItem1")}</li>
                      <li>• {t("section6.organizationalItem2")}</li>
                      <li>• {t("section6.organizationalItem3")}</li>
                      <li>• {t("section6.organizationalItem4")}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7. Retenção */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                    7
                  </span>
                  {t("section7.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{t("section7.description")}</p>
                <ul className="space-y-2 text-gray-700">
                  <li>• {t("section7.accountData")}</li>
                  <li>• {t("section7.usageData")}</li>
                  <li>• {t("section7.marketingData")}</li>
                  <li>• {t("section7.legalData")}</li>
                </ul>
              </CardContent>
            </Card>

            {/* 8. Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                    8
                  </span>
                  {t("section8.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{t("section8.description")}</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-800 text-sm">
                      {t("section8.essentialTitle")}
                    </h4>
                    <p className="text-blue-700 text-xs">
                      {t("section8.essentialDescription")}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-green-800 text-sm">
                      {t("section8.functionalTitle")}
                    </h4>
                    <p className="text-green-700 text-xs">
                      {t("section8.functionalDescription")}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-orange-800 text-sm">
                      {t("section8.analyticalTitle")}
                    </h4>
                    <p className="text-orange-700 text-xs">
                      {t("section8.analyticalDescription")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 9. Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                    9
                  </span>
                  {t("section9.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{t("section9.description")}</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                    {t("section9.dpoTitle")}
                  </h4>
                  <SafeHTML
                    html={t("section9.dpoInfo")}
                    className="text-gray-700 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 10. Reembolso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded mr-3">
                    10
                  </span>
                  {t("section10.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{t("section10.description")}</p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• {t("section10.item1")}</li>
                  <li>• {t("section10.item2")}</li>
                  <li>• {t("section10.item3")}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-500 mb-4 md:mb-0">
                <p>{t("footer.copyright")}</p>
                <p>{t("footer.validFrom")}</p>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/termos">
                    <FileText className="h-4 w-4 mr-2" />
                    {t("footer.termsOfUse")}
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

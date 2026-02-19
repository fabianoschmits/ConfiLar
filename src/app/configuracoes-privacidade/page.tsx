"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Download,
  Trash2,
  Eye,
  Settings,
  CheckCircle,
  AlertTriangle,
  FileText,
  Database,
  Bell,
  Lock,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { DataPortabilityModal } from "@/components/lgpd/DataPortabilityModal";
import { DeleteAccountForm } from "@/components/forms/DeleteAccountForm";
import { ProfileVisibilitySettings } from "@/components/lgpd/ProfileVisibilitySettings";
import { NotificationPreferences } from "@/components/lgpd/NotificationPreferences";
import { LocationDataSettings } from "@/components/lgpd/LocationDataSettings";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function ConfiguracoesPrivacidadePage() {
  const { user } = useAuthContext();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [showDataPortability, setShowDataPortability] = useState(false);
  const [showRightToBeForgotten, setShowRightToBeForgotten] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white mb-2">
                {t("restrictedAccess")}
              </h2>
              <p className="text-gray-600 mb-4">{t("loginRequired")}</p>
              <Button asChild>
                <a href="/auth">{t("login")}</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const privacySettings = [
    {
      id: "visibility",
      title: t("availability"),
      description: t("availabilityDescription"),
      icon: <Eye className="h-5 w-5" />,
      status: t("active"),
      action: t("configure"),
    },
    {
      id: "notifications",
      title: t("notifications"),
      description: t("notificationsDescription"),
      icon: <Bell className="h-5 w-5" />,
      status: t("inDevelopment"),
      action: t("comingSoon"),
    },
    {
      id: "location",
      title: t("locationData"),
      description: t("locationDataDescription"),
      icon: <Database className="h-5 w-5" />,
      status: t("inDevelopment"),
      action: t("comingSoon"),
    },
  ];

  const lgpdRights = [
    {
      title: t("dataAccess"),
      description: t("dataAccessDescription"),
      icon: <Eye className="h-5 w-5" />,
      action: t("view"),
      color: "blue",
    },
    {
      title: t("dataCorrection"),
      description: t("dataCorrectionDescription"),
      icon: <CheckCircle className="h-5 w-5" />,
      action: t("correct"),
      color: "green",
    },
    {
      title: t("portability"),
      description: t("portabilityDescription"),
      icon: <Download className="h-5 w-5" />,
      action: t("export"),
      color: "purple",
    },
    {
      title: t("rightToBeForgotten"),
      description: t("rightToBeForgottenDescription"),
      icon: <Trash2 className="h-5 w-5" />,
      action: t("delete"),
      color: "red",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white">
                  {t("title")}
                </h1>
                <p className="text-gray-600">{t("description")}</p>
              </div>
            </div>
          </div>

          {/* Status LGPD */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-green-800">
                    {t("lgpdCompliance")}
                  </h3>
                  <p className="text-green-700 text-sm">
                    {t("lgpdComplianceDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {/* Configurações de Privacidade */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                {t("privacySettings")}
              </h2>

              {privacySettings.map((setting, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-600">{setting.icon}</div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white dark:text-white">
                            {setting.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          {setting.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setActiveSection(
                              activeSection === setting.id ? null : setting.id,
                            )
                          }
                        >
                          {activeSection === setting.id
                            ? tCommon("close")
                            : setting.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Componentes Funcionais */}
            {activeSection === "visibility" && <ProfileVisibilitySettings />}

            {activeSection === "notifications" && <NotificationPreferences />}

            {activeSection === "location" && <LocationDataSettings />}

            {/* Direitos LGPD */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                {t("yourRights")}
              </h2>

              {lgpdRights.map((right, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`text-${right.color}-600`}>
                          {right.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white dark:text-white">
                            {right.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {right.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={
                          right.color === "red" ? "destructive" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          if (right.title === t("portability")) {
                            setShowDataPortability(true);
                          } else if (right.title === t("rightToBeForgotten")) {
                            setShowRightToBeForgotten(true);
                          } else {
                            toast.info(
                              t("featureInDevelopment", {
                                action: right.action,
                              }),
                            );
                          }
                        }}
                      >
                        {right.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Informações Importantes */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                {t("importantInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("privacyContact")}
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• {t("email")}: privacidade@appconfilar.com.br</li>
                    <li>• {t("dpo")}: privacidade@appconfilar.com.br</li>
                    <li>• {t("phone")}: (11) 99999-9999</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("legalDocuments")}
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      •{" "}
                      <a
                        href="/privacidade"
                        className="text-blue-600 hover:underline"
                      >
                        {t("privacyPolicy")}
                      </a>
                    </li>
                    <li>
                      •{" "}
                      <a
                        href="/termos"
                        className="text-blue-600 hover:underline"
                      >
                        {t("termsOfUse")}
                      </a>
                    </li>
                    <li>
                      •{" "}
                      <a
                        href="/ajuda"
                        className="text-blue-600 hover:underline"
                      >
                        {t("helpCenter")}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              {t("lastUpdate")}: 15 de Janeiro de 2025 |{t("lgpdCompliant")}
            </p>
          </div>
        </div>
      </div>

      {/* Modais */}
      <DataPortabilityModal
        isOpen={showDataPortability}
        onClose={() => setShowDataPortability(false)}
      />

      {showRightToBeForgotten && user?.email && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t("deleteAccount")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRightToBeForgotten(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <DeleteAccountForm userEmail={user.email} className="border-0" />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

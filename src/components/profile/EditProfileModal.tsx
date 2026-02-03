"use client";

import { useEffect, useState, useRef } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  MapPin,
  Camera,
  Shield,
  Briefcase,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { X } from "lucide-react";
import { AccountDataForm } from "./forms/AccountDataForm";
import { AvatarSelectionForm } from "./forms/AvatarSelectionForm";
import { AddressForm } from "./forms/AddressForm";
import { AccountTypeForm } from "./forms/AccountTypeForm";
import { SecurityForm } from "./forms/SecurityForm";
import { ProfessionalDataForm } from "./forms/ProfessionalDataForm";
import { SocialLinksEditor } from "./SocialLinksEditor";
import { Link2 } from "lucide-react";

export type ProfileTab =
  | "account"
  | "avatar"
  | "address"
  | "type"
  | "professional"
  | "social"
  | "security";

interface EditProfileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: ProfileTab;
}

export function EditProfileModal({
  isOpen,
  onOpenChange,
  initialTab = "account",
}: EditProfileModalProps) {
  const { profile, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const isProfessional = profile?.user_type === "professional";

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const tabs = [
    {
      id: "account",
      label: "Dados da Conta",
      icon: User,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "avatar",
      label: "Foto de Perfil",
      icon: Camera,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      id: "social",
      label: "Redes Sociais",
      icon: Link2,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
    {
      id: "address",
      label: "Endereço",
      icon: MapPin,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "type",
      label: "Tipo de Conta",
      icon: Settings,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    ...(isProfessional
      ? [
          {
            id: "professional",
            label: "Dados Profissionais",
            icon: Briefcase,
            color: "text-indigo-500",
            bgColor: "bg-indigo-50",
          },
        ]
      : []),
    {
      id: "security",
      label: "Segurança",
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={currentTab.label}
      description="Gerencie suas informações"
      className="sm:max-w-[1300px] w-[95vw] p-0 overflow-hidden"
    >
      <div className="flex flex-col bg-white dark:bg-black overflow-hidden h-[90vh] sm:h-auto">
        <div className="flex flex-col flex-1 sm:flex-row overflow-hidden">
          {/* Sidebar - Desktop */}
          <div className="hidden sm:flex w-72 flex-col bg-gray-50/50 dark:bg-gray-900/50 border-r border-gray-100 dark:border-gray-800 flex-shrink-0">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Meu Perfil
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Gerencie suas informações
              </p>
            </div>

            <nav className="flex-1 p-3 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ProfileTab)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                      isActive
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/30",
                    )}
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-lg transition-transform group-hover:scale-110",
                        tab.bgColor,
                      )}
                    >
                      <Icon className={cn("w-4 h-4", tab.color)} />
                    </div>
                    <span className="flex-1 text-left">{tab.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white dark:bg-black overflow-x-hidden">
            {/* Mobile Navigation */}
            <div className="sm:hidden border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black p-2 flex-shrink-0">
              <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar px-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ProfileTab)}
                      className={cn(
                        "flex-none flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all",
                        isActive
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
                          : "bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800",
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section Header - Desktop Only */}
            <div className="hidden sm:block p-8 border-b border-gray-50 dark:border-gray-900">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl", currentTab.bgColor)}>
                  {(() => {
                    const Icon = currentTab.icon;
                    return <Icon className={cn("w-6 h-6", currentTab.color)} />;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentTab.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Edite as informações correspondentes a esta seção
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 sm:px-10 py-8">
              <div className="w-full max-w-4xl mx-auto pb-8">
                {activeTab === "account" && (
                  <AccountDataForm onSuccess={() => {}} />
                )}
                {activeTab === "avatar" && (
                  <AvatarSelectionForm onSuccess={() => {}} />
                )}
                {activeTab === "address" && (
                  <AddressForm onSuccess={() => {}} />
                )}
                {activeTab === "type" && (
                  <AccountTypeForm onSuccess={() => {}} />
                )}
                {activeTab === "professional" && (
                  <ProfessionalDataForm onSuccess={() => {}} />
                )}
                {activeTab === "social" && profile && (
                  <SocialLinksEditor profile={profile} />
                )}
                {activeTab === "security" && <SecurityForm />}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}

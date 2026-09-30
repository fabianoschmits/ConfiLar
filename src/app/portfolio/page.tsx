"use client";

// Desabilitar SSG para esta página
export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  MapPin,
  Star,
  Plus,
  LayoutGrid,
  Filter,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ClientOnly } from "@/components/ClientOnly";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePortfolio } from "@/hooks/usePortfolio";
import { PortfolioProjectCard } from "@/components/portfolio/PortfolioProjectCard";
import { PortfolioDialog } from "@/components/portfolio/PortfolioDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Database } from "@/types/database";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PortfolioProject =
  Database["public"]["Tables"]["portfolio_projects"]["Row"];

export default function PortfolioPage() {
  const t = useTranslations("portfolio");
  const [mounted, setMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(
    null,
  );
  const [projectToDelete, setProjectToDelete] =
    useState<PortfolioProject | null>(null);

  const { projects, loading, fetchProjects, deleteProject, getPortfolioStats } =
    usePortfolio();

  const stats = getPortfolioStats();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreate = () => {
    setEditingProject(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (project: PortfolioProject) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <ClientOnly>
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-[var(--cl-paper)]">
          {/* Header Section */}
          <div className="bg-[var(--cl-surface)] border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Briefcase className="h-8 w-8 text-primary-600" />
                    {t("title")}
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Gerencie seus projetos e mostre o seu melhor trabalho para
                    os clientes.
                  </p>
                </div>
                <Button
                  onClick={handleCreate}
                  className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Projeto
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <Card className="bg-gradient-to-br from-[var(--cl-mist)] to-[var(--cl-mist)] dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-900/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <LayoutGrid className="h-6 w-6 text-[var(--cl-teal)] dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Projetos
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalProjects}
                      </h3>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-100 dark:border-green-900/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Média Avaliações
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.averageRating}
                      </h3>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[var(--cl-mist)] to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-100 dark:border-purple-900/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-[var(--cl-mist)] dark:bg-purple-900/30 rounded-lg">
                      <ImageIcon className="h-6 w-6 text-[var(--cl-teal)] dark:text-[var(--cl-teal)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Destaques
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.featuredProjects}
                      </h3>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-orange-100 dark:border-orange-900/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Star className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Views
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalViews}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-t-lg" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <PortfolioProjectCard
                    key={project.id}
                    project={project}
                    isOwner={true}
                    onEdit={handleEdit}
                    onDelete={setProjectToDelete}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Briefcase className="h-12 w-12 text-gray-400" />}
                title="Você ainda não tem projetos"
                description="Comece a construir seu portfólio adicionando seu primeiro projeto."
                action={{
                  label: "Criar Primeiro Projeto",
                  onClick: handleCreate,
                }}
              />
            )}
          </div>

          <PortfolioDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            projectToEdit={editingProject}
            onSuccess={fetchProjects}
          />

          <AlertDialog
            open={!!projectToDelete}
            onOpenChange={(open) => !open && setProjectToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Isso excluirá permanentemente
                  o projeto
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {" "}
                    {projectToDelete?.title}{" "}
                  </span>
                  e todas as imagens associadas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainLayout>
    </ClientOnly>
  );
}

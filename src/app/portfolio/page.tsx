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
import { PageHeader } from "@/components/layout/PageHeader";
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
        <div className="app-screen bg-[var(--cl-paper)]">
          {/* Header Section */}
          <div className="">
            <div className="app-page">
              <PageHeader
                title={t("title")}
                description="Seus projetos e trabalhos, organizados em um só lugar."
                icon={Briefcase}
                actions={
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4" />
                    Novo projeto
                  </Button>
                }
              />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <Card>
                  <CardContent className="p-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="p-2 bg-[var(--cl-mist)] rounded-xl">
                      <LayoutGrid className="h-5 w-5 text-[var(--cl-teal)] dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--cl-ink-muted)]">
                        Projetos
                      </p>
                      <h3 className="text-2xl font-bold text-[var(--cl-ink)]">
                        {stats.totalProjects}
                      </h3>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="p-2 bg-[var(--cl-mist)] rounded-xl">
                      <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--cl-ink-muted)]">
                        Média Avaliações
                      </p>
                      <h3 className="text-2xl font-bold text-[var(--cl-ink)]">
                        {stats.averageRating}
                      </h3>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="p-2 bg-[var(--cl-mist)] rounded-xl">
                      <ImageIcon className="h-5 w-5 text-[var(--cl-teal)] dark:text-[var(--cl-teal)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--cl-ink-muted)]">
                        Destaques
                      </p>
                      <h3 className="text-2xl font-bold text-[var(--cl-ink)]">
                        {stats.featuredProjects}
                      </h3>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="p-2 bg-[var(--cl-mist)] rounded-xl">
                      <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--cl-ink-muted)]">
                        Visualizações
                      </p>
                      <h3 className="text-2xl font-bold text-[var(--cl-ink)]">
                        {stats.totalViews}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="app-page">
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
                  <span className="font-semibold text-[var(--cl-ink)]">
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

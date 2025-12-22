"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Eye, Star, Calendar } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Database } from "@/types/database";

type PortfolioProject =
  Database["public"]["Tables"]["portfolio_projects"]["Row"];

interface PortfolioProjectCardProps {
  project: PortfolioProject;
  isOwner?: boolean;
  onEdit?: (project: PortfolioProject) => void;
  onDelete?: (project: PortfolioProject) => void;
  onClick?: (project: PortfolioProject) => void;
}

export function PortfolioProjectCard({
  project,
  isOwner = false,
  onEdit,
  onDelete,
  onClick,
}: PortfolioProjectCardProps) {
  return (
    <Card
      className={`group overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-xl ${onClick ? "cursor-pointer" : ""}`}
      onClick={() => onClick && onClick(project)}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {project.image_url ? (
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <span className="text-sm">Sem imagem</span>
          </div>
        )}

        {/* Overlay com gradiente para melhor leitura do texto se necessário ou efeitos de hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {isOwner && (
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-white/90 hover:bg-white text-gray-700 shadow-sm backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(project);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(project);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {project.title}
          </h3>
          {project.category && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {project.category}
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
          {project.description || "Sem descrição"}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{project.views_count || 0}</span>
          </div>
          {/* Rating futuro */}
          {/* <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>{project.rating || 0}</span>
          </div> */}
          <div className="flex items-center gap-1 ml-auto">
            <Calendar className="h-3 w-3" />
            <span>
              {format(new Date(project.created_at), "d MMM, yy", {
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Footer com Tags se existirem */}
      {project.tags && project.tags.length > 0 && (
        <CardFooter className="p-4 pt-0">
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 text-gray-400">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Eye, Star, Calendar, Maximize2 } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Database } from "@/types/database";
import { useState } from "react";
import { ImageModal } from "@/components/ui/ImageModal";

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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <>
      <Card
        className={`group overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md rounded-xl ${onClick ? "cursor-pointer" : ""}`}
        onClick={() => onClick && onClick(project)}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {project.image_url ? (
            <div
              className="relative h-full w-full cursor-zoom-in group/img"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageModalOpen(true);
              }}
            >
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover/img:scale-105"
              />

              {/* Overlay with subtle gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Expand Icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-all duration-300 transform scale-90 group-hover/img:scale-100 pointer-events-none border border-white/30">
                <Maximize2 className="h-5 w-5" />
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <span className="text-sm">Sem imagem</span>
            </div>
          )}

          {isOwner && (
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white text-gray-700 shadow-sm"
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
          <div className="mb-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {project.title}
              </h3>
              {project.category && (
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold text-muted-foreground border-border/50 h-5"
                >
                  {project.category}
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10 leading-relaxed italic opacity-80">
            {project.description || "Sem descrição"}
          </p>

          <div className="flex items-center justify-between gap-4 text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3 w-3" />
              <span>{project.views_count || 0} visualizações</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(project.created_at), "d MMM, yy", {
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>

          {/* Tags if they exist */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {project.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-[9px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full border border-border/30"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="text-[9px] px-1 text-muted-foreground/50">
                  +{project.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {project.image_url && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={project.image_url}
          alt={project.title}
          title={project.title}
        />
      )}
    </>
  );
}

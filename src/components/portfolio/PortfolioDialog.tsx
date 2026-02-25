"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { X, Camera } from "lucide-react";
import Image from "next/image";
import { UnifiedUpload } from "@/components/ui/UnifiedUpload";
import { Database } from "@/types/database";
import { toast } from "sonner";
import { usePortfolio } from "@/hooks/usePortfolio";

type PortfolioProject =
  Database["public"]["Tables"]["portfolio_projects"]["Row"];

const projectSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(100, "O título deve ter no máximo 100 caracteres"),
  description: z.string().optional(),
  category: z.string().optional(),
  tags_string: z.string().optional(), // Para input de tags separadas por vírgula
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface PortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectToEdit?: PortfolioProject | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  "Residencial",
  "Comercial",
  "Reforma",
  "Interiores",
  "Paisagismo",
  "Manutenção",
  "Outro",
];

export function PortfolioDialog({
  open,
  onOpenChange,
  projectToEdit,
  onSuccess,
}: PortfolioDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Mantemos o imagePreview apenas para mostrar a imagem existente do banco
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const { addProject, updateProject, uploadImages } = usePortfolio();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags_string: "",
    },
  });

  const textareaWrapperRef = useRef<HTMLDivElement>(null);

  // Efeito para scroll automático em dispositivos móveis quando o teclado aparece
  useEffect(() => {
    const wrapper = textareaWrapperRef.current;
    if (!wrapper) return;

    const handleFocusIn = () => {
      // Detectar se é mobile (largura < 768px)
      if (window.innerWidth < 768) {
        // Aguardar um pouco para o teclado aparecer
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (activeElement && wrapper.contains(activeElement)) {
            activeElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }, 300);
      }
    };

    wrapper.addEventListener("focusin", handleFocusIn);
    return () => wrapper.removeEventListener("focusin", handleFocusIn);
  }, []);

  useEffect(() => {
    if (open) {
      if (projectToEdit) {
        form.reset({
          title: projectToEdit.title,
          description: projectToEdit.description || "",
          category: projectToEdit.category || "",
          tags_string: projectToEdit.tags?.join(", ") || "",
        });
        setExistingImage(projectToEdit.image_url);
        setSelectedFiles([]);
      } else {
        form.reset({
          title: "",
          description: "",
          category: "",
          tags_string: "",
        });
        setExistingImage(null);
        setSelectedFiles([]);
      }
    }
  }, [open, projectToEdit, form]);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      setIsSubmitting(true);

      let imageUrl = existingImage;

      // Upload das imagens se houverem novas
      if (selectedFiles.length > 0) {
        const tempId = projectToEdit?.id || "temp-new-project";
        const urls = await uploadImages(selectedFiles, tempId);
        // Por enquanto, a tabela suporta apenas uma imagem, então pegamos a primeira
        imageUrl = urls[0];
      }

      const projectData = {
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags_string
          ? data.tags_string
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        image_url: imageUrl,
      };

      if (projectToEdit) {
        await updateProject(projectToEdit.id, projectData);
        toast.success("Projeto atualizado com sucesso!");
      } else {
        await addProject(projectData);
        toast.success("Projeto criado com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar projeto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={open}
      onOpenChange={onOpenChange}
      title={projectToEdit ? "Editar Projeto" : "Novo Projeto"}
      description={
        projectToEdit
          ? "Faça alterações no seu projeto do portfólio."
          : "Adicione um novo trabalho ao seu portfólio."
      }
      className="md:max-w-[600px]"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 w-full gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            form="portfolio-form"
            isLoading={isSubmitting}
            loadingText={projectToEdit ? "Salvando..." : "Criando..."}
          >
            {projectToEdit ? "Salvar Alterações" : "Criar Projeto"}
          </LoadingButton>
        </div>
      }
    >
      <Form {...form}>
        <form
          ref={textareaWrapperRef as any}
          id="portfolio-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Upload de Imagem */}
          <div className="space-y-4">
            <FormLabel>Imagens do Projeto</FormLabel>

            {existingImage && selectedFiles.length === 0 && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm group mb-4">
                <Image
                  src={existingImage}
                  alt="Imagem atual"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">
                    Suba novas fotos para trocar
                  </p>
                </div>
              </div>
            )}

            <UnifiedUpload
              selectedFiles={selectedFiles}
              onFilesSelected={(files) =>
                setSelectedFiles((prev) => [...prev, ...files])
              }
              onRemoveFile={(index) =>
                setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
              }
              maxFiles={5}
              title="Adicionar fotos ao projeto"
              description="Mostre seu trabalho com fotos de qualidade"
              subDescription="PNG, JPG ou WEBP (Max. 5MB por arquivo)"
              isLoading={isSubmitting}
            />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Reforma Cozinha Moderna" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags_string"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (separadas por vírgula)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: moderno, madeira, luxo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva os detalhes do projeto..."
                    className="resize-none h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ResponsiveModal>
  );
}

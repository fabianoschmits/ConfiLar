"use client";

import { useState, useEffect } from "react";
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
import { ImagePlus, X, Upload } from "lucide-react";
import Image from "next/image";
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    if (open) {
      if (projectToEdit) {
        form.reset({
          title: projectToEdit.title,
          description: projectToEdit.description || "",
          category: projectToEdit.category || "",
          tags_string: projectToEdit.tags?.join(", ") || "",
        });
        setImagePreview(projectToEdit.image_url);
      } else {
        form.reset({
          title: "",
          description: "",
          category: "",
          tags_string: "",
        });
        setImagePreview(null);
        setSelectedImage(null);
      }
    }
  }, [open, projectToEdit, form]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      setIsSubmitting(true);

      let imageUrl = projectToEdit?.image_url || null;

      // Upload da imagem se houver nova
      if (selectedImage) {
        // Usar um ID temporário se for criação nova, ou o ID do projeto se for edição
        const tempId = projectToEdit?.id || "temp-new-project";
        const urls = await uploadImages([selectedImage], tempId);
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
      className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
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
          id="portfolio-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Upload de Imagem */}
          <div className="space-y-2">
            <FormLabel>Imagem do Projeto</FormLabel>
            <div className="flex items-center justify-center w-full">
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm group">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setImagePreview(null);
                        setSelectedImage(null);
                      }}
                      className="p-1 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      title="Remover"
                    >
                      <X className="h-5 w-5" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="group flex flex-col items-center justify-center w-full min-h-[12rem] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-900/5 transition-all bg-white dark:bg-gray-950">
                  <div className="flex flex-col items-center justify-center p-6 pb-2">
                    <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-all duration-300">
                      <ImagePlus className="w-10 h-10 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Clique para enviar imagem
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG ou WEBP (Max. 5MB)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 mb-6">
                    <span className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-xs font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95">
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Arquivo
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </label>
              )}
            </div>
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

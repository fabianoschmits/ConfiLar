"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {projectToEdit ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
          <DialogDescription>
            {projectToEdit
              ? "Faça alterações no seu projeto do portfólio."
              : "Adicione um novo trabalho ao seu portfólio."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Upload de Imagem */}
            <div className="space-y-2">
              <FormLabel>Imagem do Projeto</FormLabel>
              <div className="flex items-center justify-center w-full">
                {imagePreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 group">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="rounded-full"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedImage(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImagePlus className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          Clique para enviar
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG ou WEBP (Max. 5MB)
                      </p>
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
                    <Input
                      placeholder="Ex: Reforma Cozinha Moderna"
                      {...field}
                    />
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

            <DialogFooter>
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
                isLoading={isSubmitting}
                loadingText={projectToEdit ? "Salvando..." : "Criando..."}
              >
                {projectToEdit ? "Salvar Alterações" : "Criar Projeto"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

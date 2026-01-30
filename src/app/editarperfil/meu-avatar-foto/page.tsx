"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, RefreshCw, Save, Sparkles } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type AvatarType = "upload" | "dicebear";

type AvatarSelection = {
  type: AvatarType;
  value: string | File;
  preview?: string;
};

export default function MeuAvatarFotoPage() {
  const { user, profile, refreshAuth } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarSelection | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"upload" | "dicebear">("upload");
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);

  // Carregar avatar atual do perfil
  useEffect(() => {
    if (profile?.avatar_url) {
      setCurrentAvatarUrl(profile.avatar_url);

      // Se é um avatar DiceBear, definir como selecionado
      if (profile.avatar_url.includes("dicebear.com")) {
        setSelectedAvatar({
          type: "dicebear",
          value: profile.avatar_url,
          preview: profile.avatar_url,
        });
        setActiveTab("dicebear");
      } else {
        // É uma foto upload
        setSelectedAvatar({
          type: "upload",
          value: profile.avatar_url,
          preview: profile.avatar_url,
        });
        setActiveTab("upload");
      }
    }
  }, [profile?.avatar_url]);

  // Gerar avatar aleatório do DiceBear
  const generateRandomAvatar = async () => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsGeneratingAvatar(true);
    try {
      // Gerar seed aleatório único
      const seed = `${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const encodedSeed = encodeURIComponent(seed);

      // Gerar avatar usando API do DiceBear
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodedSeed}&backgroundColor=transparent`;

      // Verificar se a URL é válida fazendo uma requisição
      const response = await fetch(avatarUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const content = await response.text();
      if (!content || content.includes("error") || !content.includes("<svg")) {
        throw new Error("Conteúdo SVG inválido retornado");
      }

      // Definir como selecionado
      setSelectedAvatar({
        type: "dicebear",
        value: avatarUrl,
        preview: avatarUrl,
      });

      setActiveTab("dicebear");
    } catch (error) {
      console.error("❌ Erro ao gerar avatar Dicebear:", error);
      toast.error("Erro ao gerar avatar", {
        description: "Não foi possível gerar o avatar. Tente novamente.",
      });
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  // Upload de foto
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ⚠️ SEGURANÇA: Validação completa de arquivo (tipo, tamanho e magic bytes)
    const { validateImageFile } = await import("@/lib/fileValidation");
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const validation = await validateImageFile(file, {
      allowedTypes,
      maxSizeMB: 5,
      validateMagicBytes: true,
    });

    if (!validation.valid) {
      toast.error("Arquivo inválido", {
        description:
          validation.error || "Por favor, selecione uma imagem válida.",
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedAvatar({
        type: "upload",
        value: file,
        preview: e.target?.result as string,
      });
      setActiveTab("upload");
    };
    reader.readAsDataURL(file);
  };

  // Salvar avatar
  const handleSave = async () => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    if (!selectedAvatar) {
      toast.error("Nenhum avatar selecionado");
      return;
    }

    setIsLoading(true);

    try {
      let avatarUrl = null;

      if (selectedAvatar.type === "dicebear") {
        // Avatar DiceBear - usar URL diretamente
        avatarUrl = selectedAvatar.value as string;
        console.log("💾 Salvando avatar DiceBear:", avatarUrl);
      } else if (selectedAvatar.type === "upload") {
        // Upload de foto
        if (selectedAvatar.value instanceof File) {
          setIsUploading(true);
          const file = selectedAvatar.value;
          const fileExt = file.name.split(".").pop() || "jpg";
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

          console.log("📤 Iniciando upload do arquivo:", {
            fileName,
            fileSize: file.size,
            fileType: file.type,
          });

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error("❌ Erro no upload:", uploadError);
            toast.error("Erro ao fazer upload da imagem", {
              description:
                uploadError.message ||
                "Não foi possível enviar a imagem. Verifique o tamanho do arquivo (máx. 5MB) e tente novamente.",
            });
            setIsLoading(false);
            setIsUploading(false);
            return;
          }

          console.log("✅ Upload realizado com sucesso");

          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(fileName);

          console.log("🔗 URL pública gerada:", publicUrl);
          avatarUrl = publicUrl;
          setIsUploading(false);
        } else if (typeof selectedAvatar.value === "string") {
          // Já é uma URL (avatar existente sendo reutilizado)
          avatarUrl = selectedAvatar.value;
          console.log("🔗 Usando URL existente:", avatarUrl);
        }
      }

      if (!avatarUrl) {
        throw new Error("Não foi possível obter URL do avatar");
      }

      // Atualizar perfil com nova URL do avatar
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);

      if (profileError) {
        console.error("❌ Erro ao atualizar perfil:", profileError);
        toast.error("Erro ao salvar avatar", {
          description:
            profileError.message || "Não foi possível salvar o avatar.",
        });
        setIsLoading(false);
        return;
      }

      console.log("✅ Avatar salvo com sucesso!");
      toast.success("Avatar atualizado com sucesso!");

      // Atualizar contexto
      await refreshAuth();

      // Redirecionar após salvar
      setTimeout(() => {
        router.push("/editarperfil/dados-da-conta");
      }, 1000);
    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
      toast.error("Erro inesperado ao salvar avatar", {
        description:
          "Ocorreu um erro inesperado. Tente novamente em alguns instantes.",
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            {/* Page Header */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    Meu Avatar/Foto
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Faça upload de sua foto ou gere um avatar aleatório
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Preview do Avatar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 border-4 border-purple-300 rounded-full overflow-hidden shadow-lg bg-white">
                        {selectedAvatar?.preview ? (
                          <img
                            src={selectedAvatar.preview}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                          />
                        ) : currentAvatarUrl ? (
                          <img
                            src={currentAvatarUrl}
                            alt="Avatar atual"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
                            <Camera className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-gray-500 text-xs text-center">
                              Nenhum avatar selecionado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {selectedAvatar?.type === "dicebear"
                          ? "Avatar Aleatório"
                          : selectedAvatar?.type === "upload"
                            ? "Foto Enviada"
                            : "Preview"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Opções de Upload/Avatar */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Escolha sua opção
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      value={activeTab}
                      onValueChange={(v) =>
                        setActiveTab(v as "upload" | "dicebear")
                      }
                    >
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger
                          value="upload"
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload de Foto
                        </TabsTrigger>
                        <TabsTrigger
                          value="dicebear"
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Avatar Aleatório
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="upload" className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Enviar Foto Própria
                            </label>
                            <div className="w-full">
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="avatar-upload"
                              />
                              <label
                                htmlFor="avatar-upload"
                                className="group flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-900/5 transition-all cursor-pointer bg-white dark:bg-gray-950"
                              >
                                <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-all duration-300">
                                  <Upload className="h-10 w-10 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                </div>
                                <div className="mt-4 text-center">
                                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Clique para selecionar uma foto
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                    JPG, PNG, WebP ou GIF (máx. 5MB)
                                  </p>
                                </div>
                                <div className="mt-6">
                                  <span className="inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 text-white text-sm font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95">
                                    <Camera className="w-4 h-4 mr-2" />
                                    Selecionar Foto
                                  </span>
                                </div>
                              </label>
                            </div>
                            {selectedAvatar?.type === "upload" && (
                              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                <span className="text-green-600 text-sm">
                                  ✓ Foto selecionada
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="dicebear" className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Gerar Avatar Aleatório
                            </label>
                            <p className="text-sm text-gray-600 mb-4">
                              Clique no botão abaixo para gerar um avatar
                              aleatório único usando o DiceBear.
                            </p>
                            <Button
                              onClick={generateRandomAvatar}
                              disabled={isGeneratingAvatar}
                              className="w-full"
                              variant="outline"
                            >
                              {isGeneratingAvatar ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Gerando...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Gerar Novo Avatar Aleatório
                                </>
                              )}
                            </Button>
                            {selectedAvatar?.type === "dicebear" && (
                              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                <span className="text-green-600 text-sm">
                                  ✓ Avatar gerado
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Botão Salvar */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Button
                        onClick={handleSave}
                        disabled={isLoading || !selectedAvatar || isUploading}
                        className="w-full"
                        size="lg"
                      >
                        {isLoading || isUploading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            {isUploading ? "Enviando..." : "Salvando..."}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Avatar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

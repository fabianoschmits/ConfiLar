"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, RefreshCw, Save, Sparkles, User } from "lucide-react";
import { UnifiedUpload } from "@/components/ui/UnifiedUpload";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";

export function AvatarSelectionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user, profile, refreshAuth } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "dicebear">("upload");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const handleFocusIn = () => {
      if (window.innerWidth < 768) {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (
            activeElement &&
            (activeElement.tagName === "INPUT" ||
              activeElement.tagName === "TEXTAREA" ||
              activeElement.tagName === "SELECT" ||
              activeElement.getAttribute("role") === "combobox")
          ) {
            activeElement.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }, 300);
      }
    };
    wrapper.addEventListener("focusin", handleFocusIn);
    return () => wrapper.removeEventListener("focusin", handleFocusIn);
  }, []);

  useEffect(() => {
    if (profile?.avatar_url) {
      setPreview(profile.avatar_url);
      setActiveTab(
        profile.avatar_url.includes("dicebear") ? "dicebear" : "upload",
      );
    }
  }, [profile?.avatar_url]);

  const generateAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setPreview(url);
    setSelectedFiles([]);
  };

  const [preview, setPreview] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    // Para avatar, pegamos apenas o último selecionado
    const latestFile = files[files.length - 1];
    setSelectedFiles([latestFile]);
    setPreview(URL.createObjectURL(latestFile));
  };

  const removeFile = () => {
    setSelectedFiles([]);
    setPreview(profile?.avatar_url || null);
  };

  const { updateProfile, isUpdating: isProfileUpdating } = useProfileUpdate();

  const handleSave = async () => {
    if (!user || !preview) return;
    setIsLoading(true);
    try {
      let avatarUrl = preview;
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0];
        const fileName = `${user.id}/${Date.now()}.png`;
        await supabase.storage.from("avatars").upload(fileName, file);
        avatarUrl = supabase.storage.from("avatars").getPublicUrl(fileName)
          .data.publicUrl;
      }

      const { success } = await updateProfile({
        avatar_url: avatarUrl,
      });

      if (success) {
        toast.success("🎉 Avatar atualizado!");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={wrapperRef} className="space-y-6">
      <form
        id="avatar-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-6"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full border-4 border-purple-100 overflow-hidden bg-gray-50 flex items-center justify-center">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-gray-300" />
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Camera className="w-4 h-4 mr-2" /> Foto
            </TabsTrigger>
            <TabsTrigger value="dicebear">
              <RefreshCw className="w-4 h-4 mr-2" /> Avatar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="pt-4">
            <UnifiedUpload
              selectedFiles={selectedFiles}
              onFilesSelected={handleFilesSelected}
              onRemoveFile={removeFile}
              multiple={false}
              maxFiles={1}
              title="Mudar Foto de Perfil"
              description="Escolha uma foto bem iluminada"
              subDescription="JPG, PNG ou WEBP até 1MB"
              compressOptions={{
                maxSizeMB: 0.3,
                maxWidthOrHeight: 512,
              }}
            />
          </TabsContent>

          <TabsContent value="dicebear" className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={generateAvatar}
              className="w-full h-12"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Gerar Aleatório
            </Button>
          </TabsContent>
        </Tabs>

        <div className="block">
          <Button
            type="submit"
            disabled={isLoading || !preview}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "Salvando..." : "Salvar Foto"}
          </Button>
        </div>
      </form>
      {/* Espaçador extra para evitar que o teclado cubra os campos finais no mobile */}
      <div className="h-40 sm:h-0" />
    </div>
  );
}

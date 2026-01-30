"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, RefreshCw, Save, Sparkles } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function AvatarSelectionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user, profile, refreshAuth } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    setSelectedFile(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user || !preview) return;
    setIsLoading(true);
    try {
      let avatarUrl = preview;
      if (selectedFile) {
        const fileName = `${user.id}/${Date.now()}.png`;
        await supabase.storage.from("avatars").upload(fileName, selectedFile);
        avatarUrl = supabase.storage.from("avatars").getPublicUrl(fileName)
          .data.publicUrl;
      }
      await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);
      toast.success("🎉 Avatar atualizado!");
      await refreshAuth();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Erro ao salvar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={wrapperRef} className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 rounded-full border-4 border-purple-100 overflow-hidden bg-gray-50">
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-full h-full p-8 text-gray-300" />
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" /> Foto
          </TabsTrigger>
          <TabsTrigger value="dicebear">
            <RefreshCw className="w-4 h-4 mr-2" /> Avatar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="pt-4">
          <label className="flex flex-col items-center p-8 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm">Clique para subir foto</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFile}
              accept="image/*"
            />
          </label>
        </TabsContent>
        <TabsContent value="dicebear" className="pt-4">
          <Button
            variant="outline"
            onClick={generateAvatar}
            className="w-full h-12"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Gerar Aleatório
          </Button>
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleSave}
        disabled={isLoading || !preview}
        className="w-full h-12 bg-purple-600 hover:bg-purple-700"
      >
        {isLoading ? "Salvando..." : "Salvar Foto"}
      </Button>
      {/* Espaçador extra para evitar que o teclado cubra os campos finais no mobile */}
      <div className="h-40 sm:h-0" />
    </div>
  );
}

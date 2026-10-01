"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";

export default function OwnProfilePage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  useEffect(() => {
    if (!loading)
      router.replace(
        user
          ? `/perfil/${user.id}${window.location.search}`
          : "/auth?redirect=%2Fperfil",
      );
  }, [loading, router, user]);
  return (
    <p role="status" className="app-page">
      Abrindo seu perfil…
    </p>
  );
}

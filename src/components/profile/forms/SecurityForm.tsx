"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { DeleteAccountForm } from "@/components/forms/DeleteAccountForm";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { useEffect, useRef } from "react";

export function SecurityForm() {
  const { user } = useAuthContext();
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

  if (!user) return null;

  return (
    <div ref={wrapperRef} className="space-y-8">
      {/* Alterar Senha */}
      <ChangePasswordForm />

      {/* Deletar Conta */}
      <div className="pt-4">
        <DeleteAccountForm userEmail={user?.email || ""} />
      </div>
      {/* Espaçador extra para evitar que o teclado cubra os campos finais no mobile */}
      <div className="h-40 sm:h-0" />
    </div>
  );
}

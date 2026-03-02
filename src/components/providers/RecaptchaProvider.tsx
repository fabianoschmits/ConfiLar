"use client";

import { useState, useEffect } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      console.warn(
        "⚠️ reCAPTCHA Site Key não encontrada nas variáveis de ambiente!",
      );
    }
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
      language="pt-BR"
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      <style>{`.grecaptcha-badge { visibility: hidden !important; }`}</style>
      {children}
    </GoogleReCaptchaProvider>
  );
}

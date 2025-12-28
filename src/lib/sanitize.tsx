import DOMPurify from "isomorphic-dompurify";
import React from "react";

/**
 * Configuração de tags e atributos permitidos
 * Mantemos apenas o essencial para formatação básica de texto
 */
const sanitizeConfig = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "a",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "span",
    "div",
    "blockquote",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "className", "class"],
  // Evitar ataques de abertura de nova aba (reverse tabnabbing)
  ADD_ATTR: ["target"],
};

// Hook para adicionar rel="noopener noreferrer" em links externos
DOMPurify.addHook("afterSanitizeAttributes", function (node) {
  if ("target" in node && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

/**
 * Sanitiza HTML usando DOMPurify (biblioteca padrão de segurança)
 * Previne XSS (Cross-Site Scripting) de forma robusta
 */
export function sanitizeHTML(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, sanitizeConfig);
}

/**
 * Componente React seguro para renderizar HTML sanitizado
 */
export function SafeHTML({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const sanitized = sanitizeHTML(html);
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

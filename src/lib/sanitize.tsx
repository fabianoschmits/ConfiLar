import React from "react";

/**
 * Sanitiza HTML removendo tags e atributos perigosos
 * Previne XSS (Cross-Site Scripting) attacks
 */

const ALLOWED_TAGS = [
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
];
const ALLOWED_ATTRIBUTES = ["href", "target", "rel"];

/**
 * Sanitiza uma string HTML removendo tags e atributos perigosos
 */
export function sanitizeHTML(html: string): string {
  if (!html) return "";

  // Remover tags script, iframe, object, embed, form, input, etc.
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
    .replace(/<input\b[^>]*>/gi, "")
    .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, "")
    .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, "");

  // Remover atributos de eventos (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");

  // Remover javascript: e data: URLs
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:text\/html/gi, "");

  // Remover style tags e atributos style perigosos
  sanitized = sanitized.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    "",
  );
  sanitized = sanitized.replace(
    /\s*style\s*=\s*["'][^"']*expression[^"']*["']/gi,
    "",
  );
  sanitized = sanitized.replace(
    /\s*style\s*=\s*["'][^"']*javascript:[^"']*["']/gi,
    "",
  );

  return sanitized;
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

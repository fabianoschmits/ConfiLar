"use client";

import { CompleteProfileData } from "@/hooks/useProfileData";

interface AIProfileSchemaProps {
  profile: CompleteProfileData;
}

export function AIProfileSchema({ profile }: AIProfileSchemaProps) {
  // LGPD Check: Only generate schema if user gave explicit consent
  if (!profile.allow_ai_indexing) {
    return null;
  }

  const isProfessional = profile.user_type === "professional";

  // Prepare structured data according to Schema.org
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name,
    url: `${typeof window !== "undefined" ? window.location.origin : ""}/perfil/${profile.id}`,
    image: profile.avatar_url || profile.profile_photo_url,
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.location_city,
      addressRegion: profile.location_state,
      addressCountry: "BR",
    },
    // Only include these for professionals who opted-in
    ...(isProfessional && {
      jobTitle: profile.professional_services?.join(", "),
      description: profile.bio,
      telephone: profile.phone,
      hasCredential: profile.is_verified
        ? {
            "@type": "EducationalOccupationalCredential",
            name: "Profissional Verificado ConfiLar",
            credentialCategory: "Professional Verification",
          }
        : undefined,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

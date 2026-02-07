import { MetadataRoute } from "next";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { services } from "@/data/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminSupabaseClient();
  const baseUrl = "https://appconfilar.com.br";

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/buscar`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. Service Category Routes
  const categoryRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/profissionais/${service.id}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // 3. Dynamic Profiles (Only those that allowed AI Indexing)
  try {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, updated_at")
      .eq("allow_ai_indexing", true);

    const profileRoutes: MetadataRoute.Sitemap = (profiles || []).map(
      (profile) => ({
        url: `${baseUrl}/perfil/${profile.id}`,
        lastModified: new Date(profile.updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    );

    return [...staticRoutes, ...categoryRoutes, ...profileRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return [...staticRoutes, ...categoryRoutes];
  }
}

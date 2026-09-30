import { Metadata } from "next";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import { ProVerifiedBadge } from "@/components/ui/ProVerifiedBadge";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import { services } from "@/data/services";
import {
  normalizeSearchTerm,
  getRecommendedCategories,
} from "@/lib/searchUtils";

interface CategoryPageProps {
  params: Promise<{
    service: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { service: serviceId } = await params;
  const normalizedId = normalizeSearchTerm(serviceId);
  const service = services.find(
    (s) => s.id === serviceId || s.id === normalizedId,
  );
  const name = service?.name || "Profissionais";

  return {
    title: `${name} em sua região | ConfiLar`,
    description: `Encontre os melhores profissionais de ${name.toLowerCase()} verificados e recomendados na plataforma ConfiLar.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { service: serviceId } = await params;
  const supabase = createAdminSupabaseClient();
  const normalizedId = normalizeSearchTerm(serviceId);

  // Tentar encontrar por ID exato ou ID normalizado (plural/singular)
  const service = services.find(
    (s) => s.id === serviceId || s.id === normalizedId,
  );

  if (!service) {
    // Se não encontrou a categoria, ainda assim podemos tentar dar dicas
    const similarCategories = getRecommendedCategories(
      serviceId,
      services.map((s) => s.name),
    );

    let recommendations: any[] = [];
    if (similarCategories.length > 0) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_type", "professional")
        .eq("allow_ai_indexing", true)
        .or(
          similarCategories
            .map((cat) => `professional_services.cs.{${cat}}`)
            .join(","),
        )
        .order("rating", { ascending: false })
        .limit(3);
      recommendations = data || [];
    }

    return (
      <MainLayout requireAuth={false}>
        <div className="bg-[var(--cl-paper)] min-h-screen py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Categoria "{serviceId}" não encontrada
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Não encontramos uma categoria exata para sua busca, mas talvez
              você esteja procurando por:
            </p>

            {recommendations.length > 0 ? (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {recommendations.map((prof) => (
                  <Link key={prof.id} href={`/perfil/${prof.id}`}>
                    <Card className="h-full hover:shadow-xl transition-all border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <UserAvatar
                            src={prof.avatar_url}
                            alt={prof.full_name}
                            size="md"
                          />
                          <div>
                            <h3 className="font-bold">{prof.full_name}</h3>
                            <p className="text-xs text-gray-500">
                              {prof.location_city} - {prof.location_state}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-1">
                          {prof.professional_services
                            ?.slice(0, 2)
                            .map((s: string) => (
                              <UiBadge
                                key={s}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {s}
                              </UiBadge>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href="/buscar"
                className="mt-8 inline-block px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              >
                Ir para a busca avançada
              </Link>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  // Fetch professionals of this category who allowed AI indexing
  const { data: professionals } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_type", "professional")
    .eq("allow_ai_indexing", true)
    .contains("professional_services", [service.name])
    .order("rating", { ascending: false })
    .limit(50);

  // Generate JSON-LD Structured Data for AI
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Profissionais de ${service.name} em ConfiLar`,
    description: `Lista de profissionais de ${service.name.toLowerCase()} verificados na plataforma ConfiLar.`,
    itemListElement: (professionals || []).map((prof, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: prof.full_name,
        url: `https://appconfilar.com.br/perfil/${prof.id}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: prof.location_city,
          addressRegion: prof.location_state,
          addressCountry: "BR",
        },
        jobTitle: service.name,
        image: prof.avatar_url || prof.profile_photo_url,
        aggregateRating: prof.rating
          ? {
              "@type": "AggregateRating",
              ratingValue: prof.rating,
              reviewCount: prof.total_reviews || 0,
            }
          : undefined,
      },
    })),
  };

  // Se não houver profissionais, buscar recomendações de categorias semelhantes
  let recommendedProfessionals: any[] = [];
  if (!professionals || professionals.length === 0) {
    const similarCategories = getRecommendedCategories(
      service.name,
      services.map((s) => s.name),
    ).filter((name) => name !== service.name);

    if (similarCategories.length > 0) {
      const { data: recommended } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_type", "professional")
        .eq("allow_ai_indexing", true)
        .or(
          similarCategories
            .map((cat) => `professional_services.cs.{${cat}}`)
            .join(","),
        )
        .order("rating", { ascending: false })
        .limit(3);

      recommendedProfessionals = recommended || [];
    }
  }

  return (
    <MainLayout requireAuth={false}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-[var(--cl-paper)] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {service.icon} {service.name}
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Lista de profissionais de {service.name.toLowerCase()} verificados
              e prontos para atender você com segurança e qualidade.
            </p>
          </div>

          {!professionals || professionals.length === 0 ? (
            <div className="space-y-12">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Ainda não temos profissionais nesta categoria com indexação
                  ativa.
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Tente buscar em uma região diferente ou explore as sugestões
                  abaixo.
                </p>
                <Link
                  href="/buscar"
                  className="mt-6 inline-block font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ir para a busca avançada →
                </Link>
              </div>

              {recommendedProfessionals.length > 0 && (
                <div className="mt-16">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Não encontramos {service.name}, mas estes profissionais
                      podem ajudar:
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendedProfessionals.map((prof) => (
                      <Link key={prof.id} href={`/perfil/${prof.id}`}>
                        <Card className="h-full hover:shadow-2xl transition-all duration-300 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden group">
                          <CardContent className="p-0">
                            <div className="p-6">
                              <div className="flex items-start gap-4">
                                <UserAvatar
                                  src={
                                    prof.avatar_url || prof.profile_photo_url
                                  }
                                  alt={prof.full_name}
                                  userId={prof.id}
                                  size="lg"
                                  className="border-2 border-primary/10"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                      {prof.full_name}
                                    </h3>
                                    <ProVerifiedBadge
                                      isVerified={prof.is_verified}
                                      isPro={(prof as any).is_pro}
                                      proExpiresAt={
                                        (prof as any).pro_expires_at
                                      }
                                      iconSize={3}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="truncate">
                                      {prof.location_city} -{" "}
                                      {prof.location_state}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 flex items-center gap-6 border-t border-gray-50 dark:border-gray-800 pt-6">
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                    Avaliação
                                  </span>
                                  <div className="flex items-center gap-1 mt-1 text-amber-500 font-bold">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span>{prof.rating || "N/A"}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 flex flex-wrap gap-2">
                                {(prof.professional_services || [])
                                  .slice(0, 3)
                                  .map((s: string) => (
                                    <UiBadge
                                      key={s}
                                      variant="secondary"
                                      className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-none font-medium"
                                    >
                                      {s}
                                    </UiBadge>
                                  ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {professionals.map((prof) => (
                <Link key={prof.id} href={`/perfil/${prof.id}`}>
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <UserAvatar
                            src={prof.avatar_url || prof.profile_photo_url}
                            alt={prof.full_name}
                            userId={prof.id}
                            size="lg"
                            className="border-2 border-primary/10"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                {prof.full_name}
                              </h3>
                              <ProVerifiedBadge
                                isVerified={prof.is_verified}
                                isPro={(prof as any).is_pro}
                                proExpiresAt={(prof as any).pro_expires_at}
                                iconSize={2.5}
                              />
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {prof.location_city} - {prof.location_state}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center gap-6 border-t border-gray-50 dark:border-gray-800 pt-6">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                              Avaliação
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-amber-500 font-bold">
                              <Star className="w-4 h-4 fill-current" />
                              <span>{prof.rating || "N/A"}</span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                              Avaliações
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                              {prof.total_reviews || 0}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                          {(prof.professional_services || [])
                            .slice(0, 3)
                            .map((s: string) => (
                              <UiBadge
                                key={s}
                                variant="secondary"
                                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-none font-medium"
                              >
                                {s}
                              </UiBadge>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

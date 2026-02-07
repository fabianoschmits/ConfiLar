import { Metadata } from "next";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, CheckCircle } from "lucide-react";
import Link from "next/link";
import { services } from "@/data/services";

interface CategoryPageProps {
  params: Promise<{
    service: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { service: serviceId } = await params;
  const service = services.find((s) => s.id === serviceId);
  const name = service?.name || "Profissionais";

  return {
    title: `${name} em sua região | ConfiLar`,
    description: `Encontre os melhores profissionais de ${name.toLowerCase()} verificados e recomendados na plataforma ConfiLar.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { service: serviceId } = await params;
  const supabase = createAdminSupabaseClient();
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <MainLayout requireAuth={false}>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Categoria não encontrada</h1>
          <p className="mt-4 text-gray-600">
            A categoria que você está procurando não existe em nossa base.
          </p>
          <Link
            href="/buscar"
            className="mt-8 text-primary hover:underline inline-block"
          >
            Voltar para a busca
          </Link>
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

  return (
    <MainLayout requireAuth={false}>
      <div className="bg-gray-50 dark:bg-black min-h-screen py-12">
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
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Ainda não temos profissionais nesta categoria com indexação
                ativa.
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Tente buscar em uma região diferente ou explore outras
                categorias.
              </p>
              <Link
                href="/buscar"
                className="mt-6 inline-block font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ir para a busca avançada →
              </Link>
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
                              {prof.is_verified && (
                                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                              )}
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
                              <Badge
                                key={s}
                                variant="secondary"
                                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-none font-medium"
                              >
                                {s}
                              </Badge>
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

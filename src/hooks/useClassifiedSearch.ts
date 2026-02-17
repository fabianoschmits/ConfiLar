"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ClassifiedAd {
  id: string;
  user_id: string;
  user_name: string;
  user_type: "client" | "professional";
  title: string;
  description: string;
  category: string;
  location_state: string;
  location_city: string;
  created_at: string;
  is_active: boolean;
  views: number;
  user_avatar_url: string | null;
  ad_type: string;
  is_featured?: boolean;
  is_premium?: boolean;
  premium_points_spent?: number;
  premium_expires_at?: string;
  premium_highlight_color?: string;
  price_range?: string;
  contact_phone?: string;
  contact_email?: string;
  images?: string[];
}

interface ClassifiedFilters {
  searchTerm: string;
  state: string;
  city: string;
  category: string;
  adType: "all" | "offers" | "requests";
}

interface ClassifiedStats {
  total: number;
  offers: number;
  requests: number;
  categories: number;
}

export function useClassifiedSearch() {
  const [classifiedAds, setClassifiedAds] = useState<ClassifiedAd[]>([]);
  const [filteredAds, setFilteredAds] = useState<ClassifiedAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ClassifiedStats>({
    total: 0,
    offers: 0,
    requests: 0,
    categories: 0,
  });

  // Carregar todos os anúncios
  const loadClassifiedAds = useCallback(async () => {
    try {
      setLoading(true);

      // Pegar adId da URL caso exista para dar prioridade (pinning)
      const urlParams =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const pinAdId = urlParams ? urlParams.get("ad") : null;

      console.log("📋 Tentando carregar dados reais da tabela classified_ads");

      // 1. Se houver um pinAdId, buscar esse anúncio especificamente primeiro
      let pinnedAd: any = null;
      if (pinAdId) {
        const { data: specificAd, error: specificError } = await supabase
          .from("classified_ads")
          .select(
            `
            id, user_id, user_name, user_type, title, description, category,
            location_state, location_city, created_at, is_active, views,
            ad_type, is_premium, is_featured, premium_points_spent,
            premium_expires_at, premium_highlight_color, price_range,
            contact_phone, contact_email, images
          `,
          )
          .eq("id", pinAdId)
          .single();

        if (!specificError && specificAd) {
          pinnedAd = specificAd;
        }
      }

      // 2. Buscar o restante dos anúncios
      const query = supabase
        .from("classified_ads")
        .select(
          `
          id,
          user_id,
          user_name,
          user_type,
          title,
          description,
          category,
          location_state,
          location_city,
          created_at,
          is_active,
          views,
          ad_type,
          is_premium,
          is_featured,
          premium_points_spent,
          premium_expires_at,
          premium_highlight_color,
          price_range,
          contact_phone,
          contact_email,
          images
        `,
        )
        .eq("is_active", true);

      if (pinAdId) {
        query.neq("id", pinAdId);
      }

      const { data, error } = await query
        // Ordenar: premium primeiro, depois por data (mais recente primeiro)
        .order("is_premium", { ascending: false })
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      console.log("🔍 Resultado da query:", {
        data: data?.length || 0,
        error: error?.message || "Nenhum erro",
      });

      if (error) {
        console.warn(
          "⚠️ Erro ao buscar dados reais da tabela classified_ads:",
          error,
        );
        console.log("📋 Nenhum anúncio encontrado no banco de dados");

        // Usar array vazio se não houver dados
        setClassifiedAds([]);
        setFilteredAds([]);

        // Estatísticas zeradas
        setStats({ total: 0, offers: 0, requests: 0, categories: 0 });
        setLoading(false);
        return;
      }

      // Se chegou aqui, os dados reais foram carregados com sucesso
      console.log(
        "✅ Dados reais carregados com sucesso:",
        data?.length || 0,
        "anúncios",
      );

      // Buscar dados completos dos usuários (otimizado)
      const userIds = Array.from(
        new Set([
          ...(pinnedAd ? [pinnedAd.user_id] : []),
          ...(data?.map((ad) => ad.user_id) || []),
        ]),
      );

      const { data: profilesData } = await supabase
        .from("profiles")
        .select(
          `
          id, 
          full_name, 
          avatar_url, 
          profile_photo_url,
          user_type,
          escolaridade,
          filhos,
          estado_civil,
          referencia_profissional,
          turno_trabalho,
          idade,
          professional_experience_years,
          professional_services,
          bio,
          is_verified,
          is_pro,
          pro_expires_at
        `,
        )
        .in("id", userIds)
        .limit(20);

      const profilesMap = new Map(
        profilesData?.map((profile) => [profile.id, profile]) || [],
      );

      const allAds = [...(pinnedAd ? [pinnedAd] : []), ...(data || [])];

      const adsWithUserInfo = allAds.map((ad) => {
        const profile = profilesMap.get(ad.user_id);
        // Verificar se premium está expirado
        const premiumExpired =
          ad.is_premium && ad.premium_expires_at
            ? new Date(ad.premium_expires_at) < new Date()
            : false;

        return {
          id: ad.id,
          user_id: ad.user_id,
          user_name: profile?.full_name || ad.user_name || "Usuário",
          // Dados completos do perfil do anunciante
          user_profile: profile
            ? {
                escolaridade: profile.escolaridade,
                filhos: profile.filhos,
                estado_civil: profile.estado_civil,
                referencia_profissional: profile.referencia_profissional,
                turno_trabalho: profile.turno_trabalho,
                idade: profile.idade,
                professional_experience_years:
                  profile.professional_experience_years,
                professional_services: profile.professional_services,
                bio: profile.bio,
                user_type: profile.user_type,
                is_verified: profile.is_verified,
                is_pro: profile.is_pro,
                pro_expires_at: profile.pro_expires_at,
              }
            : null,
          user_type: ad.user_type || "client",
          title: ad.title,
          description: ad.description,
          category: ad.category,
          location_state: ad.location_state,
          location_city: ad.location_city,
          created_at: ad.created_at,
          is_active: ad.is_active,
          views: ad.views || 0,
          user_avatar_url:
            profile?.avatar_url || profile?.profile_photo_url || null,
          ad_type: ad.ad_type,
          is_premium: ad.is_premium && !premiumExpired, // Só marcar como premium se não estiver expirado
          is_featured: ad.is_featured && !premiumExpired,
          premium_points_spent: ad.premium_points_spent,
          premium_expires_at: ad.premium_expires_at,
          premium_highlight_color: ad.premium_highlight_color,
          price_range: ad.price_range,
          contact_phone: ad.contact_phone,
          contact_email: ad.contact_email,
          images: ad.images || [],
        };
      });

      // Ordenar manualmente: premium primeiro, depois por data
      adsWithUserInfo.sort((a, b) => {
        // Se houver um pinAdId, ele SEMPRE ganha (fica no topo)
        if (pinAdId) {
          if (a.id === pinAdId) return -1;
          if (b.id === pinAdId) return 1;
        }

        // Premium primeiro
        if (a.is_premium && !b.is_premium) return -1;
        if (!a.is_premium && b.is_premium) return 1;
        // Featured depois
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        // Por data (mais recente primeiro)
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      setClassifiedAds(adsWithUserInfo);
      setFilteredAds(adsWithUserInfo);

      // Calcular estatísticas
      const total = adsWithUserInfo.length;
      const offers = adsWithUserInfo.filter(
        (ad) => ad.ad_type === "oferecer",
      ).length;
      const requests = adsWithUserInfo.filter(
        (ad) => ad.ad_type === "procurar",
      ).length;
      const categories = Array.from(
        new Set(adsWithUserInfo.map((ad) => ad.category)),
      ).length;

      setStats({ total, offers, requests, categories });
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error);
      toast.error("Erro ao carregar anúncios");
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback(
    (filters: ClassifiedFilters) => {
      console.log("🔍 applyFilters chamado com:", {
        filters,
        totalAds: classifiedAds.length,
      });

      // Log das categorias disponíveis
      const availableCategories = Array.from(
        new Set(classifiedAds.map((ad) => ad.category)),
      );
      console.log(
        "🔍 Categorias disponíveis nos anúncios:",
        availableCategories,
      );

      let filtered = [...classifiedAds];

      // Filtrar por tipo de anúncio
      if (filters.adType !== "all") {
        filtered = filtered.filter((ad) => {
          if (filters.adType === "offers") {
            return ad.ad_type === "oferecer";
          } else if (filters.adType === "requests") {
            return ad.ad_type === "procurar";
          }
          return true;
        });
      }

      // Filtrar por termo de busca com variações e sinônimos
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();

        // Mapeamento de sinônimos e variações para todos os serviços
        const synonyms: { [key: string]: string[] } = {
          // Construção e Reforma
          "construção e reforma": [
            "construção",
            "reforma",
            "obra",
            "construir",
            "reformar",
            "edificação",
          ],
          pedreiro: [
            "construção",
            "obra",
            "alvenaria",
            "tijolo",
            "cimento",
            "concreto",
            "reforma",
            "masonry",
            "alvenaria",
          ],
          elétrica: [
            "eletricista",
            "elétrica",
            "luz",
            "energia",
            "fiação",
            "tomada",
            "interruptor",
            "disjuntor",
            "elétrico",
          ],
          encanamento: [
            "encanador",
            "hidráulica",
            "água",
            "cano",
            "vazamento",
            "torneira",
            "chuveiro",
            "plumbing",
            "hidráulico",
          ],
          pintura: [
            "pintor",
            "tinta",
            "parede",
            "cor",
            "verniz",
            "esmalte",
            "acabamento",
            "pintar",
          ],
          marcenaria: [
            "marceneiro",
            "madeira",
            "móveis",
            "carpintaria",
            "serralheria",
            "estrutura",
            "carpintaria",
          ],
          telhado: [
            "telhas",
            "cobertura",
            "telhamento",
            "roofing",
            "cobertura",
          ],
          pisos: ["piso", "chão", "revestimento", "flooring", "pavimento"],

          // Limpeza e Higiene
          "limpeza e higiene": [
            "limpeza",
            "higiene",
            "higienização",
            "cleaning",
          ],
          diarista: [
            "limpeza",
            "faxina",
            "doméstica",
            "casa",
            "limpar",
            "faxineira",
            "housekeeping",
            "doméstica",
          ],
          "limpeza profunda": [
            "limpeza profunda",
            "limpeza detalhada",
            "deep cleaning",
            "limpeza especializada",
          ],
          "limpeza de tapetes": [
            "tapetes",
            "carpetes",
            "carpet cleaning",
            "higienização de tapetes",
          ],

          // Jardinagem e Exteriores
          jardinagem: [
            "jardim",
            "jardineiro",
            "planta",
            "plantas",
            "gardening",
            "jardim",
          ],
          paisagismo: [
            "paisagista",
            "jardim",
            "planta",
            "paisagismo",
            "poda",
            "verde",
            "landscaping",
          ],
          "manutenção de piscina": [
            "piscina",
            "piscinas",
            "pool maintenance",
            "tratamento de piscina",
          ],
          "poda de árvores": [
            "poda",
            "árvores",
            "tree care",
            "arborização",
            "poda arbórea",
          ],

          // Beleza e Bem-estar
          "beleza e bem-estar": ["beleza", "bem-estar", "estética", "beauty"],
          cabeleireiro: [
            "cabelo",
            "corte",
            "penteado",
            "salão",
            "beleza",
            "hairdressing",
            "cabelereiro",
          ],
          manicure: [
            "unhas",
            "esmaltação",
            "beleza",
            "nail art",
            "unha",
            "manicure",
          ],
          esteticista: [
            "estética",
            "tratamentos",
            "facial",
            "corporal",
            "esthetics",
          ],
          "personal trainer": [
            "academia",
            "treino",
            "fitness",
            "musculação",
            "exercício",
            "personal",
            "trainer",
          ],
          massagem: [
            "massoterapia",
            "terapia",
            "relaxamento",
            "massage",
            "massagista",
          ],

          // Tecnologia e Informática
          tecnologia: ["tecnologia", "ti", "informática", "technology", "tech"],
          "manutenção de computadores": [
            "computador",
            "pc",
            "manutenção",
            "reparo",
            "computer repair",
            "informática",
          ],
          "redes e internet": [
            "rede",
            "internet",
            "wi-fi",
            "network",
            "conexão",
          ],
          "desenvolvimento de software": [
            "software",
            "programação",
            "desenvolvimento",
            "software development",
            "programador",
          ],

          // Transporte e Logística
          transporte: ["transporte", "transport", "locomoção"],
          mudanças: ["mudança", "mudar", "moving", "transporte de móveis"],
          entregas: ["entrega", "delivery", "entregador"],
          "transporte de passageiros": [
            "passageiros",
            "carona",
            "uber",
            "taxi",
            "passenger transport",
          ],

          // Educação e Tutoria
          educação: ["educação", "education", "ensino", "aprendizado"],
          "aulas particulares": [
            "aula",
            "particular",
            "tutoria",
            "tutoring",
            "reforço escolar",
          ],
          idiomas: ["idioma", "language", "língua", "inglês", "espanhol"],
          música: ["música", "music", "instrumento", "aula de música"],

          // Cuidados e Assistência
          "cuidados e assistência": [
            "cuidados",
            "assistência",
            "care",
            "cuidar",
          ],
          babá: [
            "babá",
            "babysitter",
            "criança",
            "bebê",
            "cuidador infantil",
            "creche",
            "babysitting",
          ],
          "cuidador de idosos": [
            "idosos",
            "idoso",
            "elderly care",
            "cuidado de idosos",
            "assistência idosos",
          ],
          "cuidados com animais": [
            "animais",
            "pet care",
            "cuidado de animais",
            "veterinário",
          ],
          "passeador de cães": [
            "passeador",
            "passeio",
            "dog walking",
            "passear cães",
          ],
          tosador: ["tosa", "tosador", "pet grooming", "tosa de animais"],

          // Lavanderia e Costura
          lavanderia: ["lavanderia", "laundry", "lavagem", "passadoria"],
          costura: ["costura", "sewing", "conserto", "confeção", "alfaiate"],

          // Eventos e Celebrações
          eventos: ["evento", "events", "festa", "celebração"],
          buffet: ["buffet", "catering", "alimentação", "comida"],
          decoração: ["decoração", "decoration", "ornamentação", "enfeites"],

          // Manutenção Geral
          "manutenção geral": [
            "manutenção",
            "maintenance",
            "reparo",
            "conserto",
          ],
          "reparo de eletrodomésticos": [
            "eletrodomésticos",
            "appliance repair",
            "conserto de aparelhos",
          ],
          chaveiro: ["chaveiro", "locksmith", "chaves", "fechaduras"],
          vidraçaria: ["vidro", "vidraçaria", "glass repair", "vidros"],
        };

        // Função para verificar se o texto contém a palavra ou suas variações
        const containsSearchTerm = (text: string): boolean => {
          const textLower = text.toLowerCase();

          // Busca direta
          if (textLower.includes(searchLower)) {
            return true;
          }

          // Busca por sinônimos
          for (const [mainTerm, variations] of Object.entries(synonyms)) {
            // Se a busca é por uma palavra principal, busca suas variações
            if (searchLower === mainTerm) {
              for (const variation of variations) {
                if (textLower.includes(variation)) {
                  return true;
                }
              }
            }

            // Se a busca é por uma variação, busca a palavra principal
            if (variations.includes(searchLower)) {
              if (textLower.includes(mainTerm)) {
                return true;
              }
            }
          }

          // Busca por palavras parciais (ex: "encan" encontra "encanador" e "encanamento")
          const searchWords = searchLower
            .split(" ")
            .filter((word) => word.length > 2);
          for (const word of searchWords) {
            if (textLower.includes(word)) {
              return true;
            }
          }

          return false;
        };

        console.log("🔍 Buscando por:", {
          searchTerm: filters.searchTerm,
          searchLower,
        });

        filtered = filtered.filter((ad) => {
          const matches =
            containsSearchTerm(ad.title) ||
            containsSearchTerm(ad.description) ||
            containsSearchTerm(ad.category) ||
            containsSearchTerm(ad.user_name);

          if (matches) {
            console.log("✅ Anúncio encontrado:", {
              title: ad.title,
              category: ad.category,
              searchTerm: filters.searchTerm,
            });
          }

          return matches;
        });

        console.log("🔍 Resultado da busca:", {
          searchTerm: filters.searchTerm,
          totalAds: classifiedAds.length,
          filteredAds: filtered.length,
        });
      }

      // Filtrar por estado (aceita tanto sigla quanto nome completo)
      if (filters.state) {
        filtered = filtered.filter((ad) => {
          const adState = ad.location_state;
          const filterState = filters.state;

          // Verificar se é uma sigla (2 caracteres) ou nome completo
          if (filterState.length === 2) {
            // É uma sigla, comparar diretamente
            return adState === filterState;
          } else {
            // É um nome completo, verificar se corresponde à sigla do anúncio
            // Mapear nomes para siglas
            const stateMapping: { [key: string]: string } = {
              "Rio Grande do Sul": "RS",
              "São Paulo": "SP",
              "Rio de Janeiro": "RJ",
              "Minas Gerais": "MG",
              Bahia: "BA",
              Paraná: "PR",
              "Santa Catarina": "SC",
              Goiás: "GO",
              Pernambuco: "PE",
              Ceará: "CE",
              Pará: "PA",
              Maranhão: "MA",
              Paraíba: "PB",
              Amazonas: "AM",
              "Espírito Santo": "ES",
              Piauí: "PI",
              Alagoas: "AL",
              Tocantins: "TO",
              "Rio Grande do Norte": "RN",
              Acre: "AC",
              Amapá: "AP",
              Rondônia: "RO",
              Roraima: "RR",
              Sergipe: "SE",
              "Mato Grosso": "MT",
              "Mato Grosso do Sul": "MS",
              "Distrito Federal": "DF",
            };

            const expectedSigla = stateMapping[filterState];
            return expectedSigla
              ? adState === expectedSigla
              : adState === filterState;
          }
        });
      }

      // Filtrar por cidade
      if (filters.city) {
        filtered = filtered.filter((ad) => ad.location_city === filters.city);
      }

      // Filtrar por categoria
      if (filters.category && filters.category !== "all") {
        console.log("🔍 Filtrando por categoria:", {
          category: filters.category,
          adsBefore: filtered.length,
        });
        filtered = filtered.filter((ad) => {
          const matches = ad.category === filters.category;
          console.log("🔍 Verificando anúncio:", {
            adCategory: ad.category,
            filterCategory: filters.category,
            matches,
            title: ad.title,
          });
          return matches;
        });
        console.log("🔍 Após filtro de categoria:", {
          adsAfter: filtered.length,
        });
      }

      console.log("🔍 Filtros aplicados:", {
        original: classifiedAds.length,
        filtered: filtered.length,
        searchTerm: filters.searchTerm,
        state: filters.state,
        city: filters.city,
        category: filters.category,
        adType: filters.adType,
      });
      setFilteredAds(filtered);
    },
    [classifiedAds],
  );

  // Executar busca com filtros
  const executeSearch = useCallback(
    (filters: ClassifiedFilters) => {
      console.log("🔍 executeSearch chamado com filtros:", filters);
      applyFilters(filters);
    },
    [applyFilters],
  );

  // Carregar dados iniciais
  useEffect(() => {
    loadClassifiedAds();
  }, [loadClassifiedAds]);

  // Aplicar filtros quando os dados mudarem
  useEffect(() => {
    if (classifiedAds.length > 0) {
      // Aplicar filtros padrão (todos os anúncios)
      applyFilters({
        searchTerm: "",
        state: "",
        city: "",
        category: "all",
        adType: "all",
      });
    }
  }, [classifiedAds, applyFilters]);

  return {
    classifiedAds,
    filteredAds,
    loading,
    stats,
    executeSearch,
    loadClassifiedAds,
  };
}

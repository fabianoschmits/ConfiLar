"use client";

import React, { useState, Suspense, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Search,
  Book,
  LifeBuoy,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Instagram,
  Mail,
  Flag,
  Shield,
  CreditCard,
  User,
  HelpCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientOnly } from "@/components/ClientOnly";
import SupportModule from "@/modules/support/SupportModule";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Sub-component to safely use useSearchParams
function AjudaContent() {
  const searchParams = useSearchParams();
  const initialTicketId = searchParams.get("ticket_id");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showSupport, setShowSupport] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (initialTicketId) {
      setShowSupport(true);
    }
  }, [initialTicketId]);

  const categories = [
    {
      id: "all",
      label: "Todos",
      icon: Book,
      color: "bg-blue-500",
    },
    {
      id: "general",
      label: "Geral",
      icon: LifeBuoy,
      color: "bg-purple-500",
    },
    {
      id: "account",
      label: "Sua Conta",
      icon: User,
      color: "bg-green-500",
    },
    {
      id: "security",
      label: "Privacidade",
      icon: Shield,
      color: "bg-red-500",
    },
    {
      id: "payments",
      label: "Pagamentos",
      icon: CreditCard,
      color: "bg-amber-500",
    },
  ];

  const articles = [
    {
      id: 1,
      category: "general",
      title: "O que é o ConfiLar?",
      excerpt:
        "Conheça nossa missão e como conectamos você a profissionais de confiança.",
      content:
        "O ConfiLar é uma plataforma de marketplace de serviços que prioriza a transparência e a confiança. Conectamos clientes que precisam de serviços (desde limpeza até consultorias técnicas) com profissionais qualificados. Nosso diferencial é que você pode ver quem já contratou aquele profissional, ler recomendações reais e acompanhar o histórico de confiabilidade de cada um.",
    },
    {
      id: 2,
      category: "account",
      title: "Como proteger minha conta",
      excerpt:
        "Dicas essenciais para manter seus dados seguros e sua senha forte.",
      content:
        "Para manter sua conta segura, recomendamos: 1. Use uma senha forte com letras, números e símbolos. 2. Nunca compartilhe seu código de verificação ou dados bancários por chat. 3. Mantenha seu e-mail e telefone sempre atualizados. Se houver qualquer atividade suspeita, entre em contato com nosso suporte imediatamente.",
    },
    {
      id: 3,
      category: "general",
      title: "Sistema de indicações (ConfiPoints)",
      excerpt:
        "Entenda como ganhar pontos e benefícios indicando amigos para a plataforma.",
      content:
        "O sistema de Indicações premia você por trazer novas pessoas para o ConfiLar. Ao compartilhar seu link exclusivo, você ganha 200 pontos assim que seu amigo inicia o cadastro. Além disso, você ganha um bônus especial de 50 pontos quando seu indicado atinge o nível Diamante!\n\nAcumular indicações também faz seu próprio nível subir (de Bronze até Diamante), desbloqueando benefícios como selos exclusivos e maior visibilidade no feed da plataforma.",
    },
    {
      id: 4,
      category: "account",
      title: "Como alterar dados do perfil",
      excerpt:
        "Passo a passo para atualizar suas informações, fotos e serviços oferecidos.",
      content:
        "Para editar seu perfil, clique no seu avatar no topo da página e selecione 'Meu Perfil'. Lá, você encontrará o botão 'Editar Perfil'. Você pode alterar sua foto, biografia, serviços prestados, cidade de atendimento e muito mais.",
    },
    {
      id: 5,
      category: "payments",
      title: "Como funcionam as recargas de ConfiPoints",
      excerpt:
        "Tudo sobre pagamentos, PIX e como turbinar seus anúncios com pontos.",
      content:
        "As recargas são feitas via PIX e o saldo entra na sua conta instantaneamente. Basta clicar no saldo de ConfiPoints no seu painel, escolher o valor da recarga e efetuar o pagamento. Com esses pontos, você pode impulsionar seus anúncios para que eles apareçam primeiro nas buscas do ConfiLar.",
    },
    {
      id: 6,
      category: "security",
      title: "Política de Privacidade e LGPD",
      excerpt:
        "Entenda como seus dados são tratados seguindo a legislação brasileira.",
      content:
        "Levamos a sério a Lei Geral de Proteção de Dados (LGPD). Seus dados de contato só são liberados para o profissional após você aceitar uma proposta. Você tem controle total sobre quais informações deseja exibir publicamente no seu perfil.",
    },
    {
      id: 7,
      category: "general",
      title: "Diferença entre Cliente e Profissional",
      excerpt:
        "Veja as funcionalidades exclusivas para cada tipo de conta no ConfiLar.",
      content:
        "A conta de 'Cliente' é focada em encontrar e avaliar serviços. A conta de 'Profissional' possui ferramentas extras como criação de catálogo de serviços, gestão de agenda, impulsionamento de anúncios e histórico de recomendações públicas para atrair novos negócios.",
    },
    {
      id: 8,
      category: "payments",
      title: "Anúncios Premium e Destaques",
      excerpt:
        "Saiba como destacar seus serviços para aparecer no topo das buscas.",
      content:
        "Anúncios Premium têm 3x mais visibilidade na plataforma. Eles aparecem no topo do feed social e no início dos resultados de busca por categoria. Para tornar um anúncio premium, você usa seus ConfiPoints durante a criação ou edição do post.",
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (showSupport) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSupport(false)}
          className="mb-4 sm:mb-6 gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para a Central de Ajuda
        </Button>

        <Card className="min-h-[500px] sm:min-h-[600px] flex flex-col items-stretch p-3 sm:p-6 bg-background/60 backdrop-blur-md border border-border/50 shadow-2xl shadow-primary/5 rounded-2xl sm:rounded-3xl overflow-hidden">
          <SupportModule initialTicketId={initialTicketId} />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Search Header */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <Badge
          variant="secondary"
          className="mb-4 px-4 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary border-none"
        >
          Central de Ajuda
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
          Como podemos <span className="text-primary italic">ajudar?</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Pesquise por temas, artigos ou entre em contato com nosso time de
          especialistas.
        </p>

        <div className="relative max-w-xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Ex: Como funciona o sistema de indicações..."
              className="w-full pl-12 h-14 bg-background/50 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 text-base rounded-2xl shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Links / Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        {categories.map((cat) => {
          const IconStyle = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 text-left group
                ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                    : "border-border/50 bg-background/50 hover:border-primary/30 hover:bg-muted/30"
                }`}
            >
              <div
                className={`w-10 h-10 rounded-xl sm:rounded-2xl ${cat.color} flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg shadow-black/10 transition-transform group-hover:scale-110 duration-300`}
              >
                <IconStyle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span
                className={`text-xs sm:text-sm font-bold block ${isActive ? "text-primary" : "text-foreground"}`}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 sm:gap-12">
        {/* Main Content: Articles */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
              <Book className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Artigos Populares
            </h2>
            {selectedCategory !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="text-xs uppercase font-bold tracking-widest hover:text-primary"
              >
                Ver Todos
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:gap-6">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => {
                const isExpanded = expandedId === article.id;
                return (
                  <Card
                    key={article.id}
                    onClick={() =>
                      setExpandedId(isExpanded ? null : article.id)
                    }
                    className={`group hover:border-primary/30 hover:bg-muted/5 transition-all duration-300 cursor-pointer rounded-2xl sm:rounded-3xl border-border/50 overflow-hidden ${
                      isExpanded ? "ring-2 ring-primary/20 bg-primary/5" : ""
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="p-5 sm:p-7 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h3
                            className={`text-base sm:text-lg font-bold mb-1 transition-colors truncate ${isExpanded ? "text-primary" : "group-hover:text-primary"}`}
                          >
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 italic">
                            {article.excerpt}
                          </p>
                        </div>
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0 transition-all duration-300 ${isExpanded ? "bg-primary text-white rotate-90" : "group-hover:bg-primary group-hover:text-white"}`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-7 sm:px-7 sm:pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="pt-4 border-t border-primary/10">
                            <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                              {article.content}
                            </p>
                            <div className="mt-6 flex items-center gap-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-xs font-bold gap-2"
                              >
                                <HelpCircle className="w-4 h-4" />
                                Isso foi útil?
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-xs font-bold gap-2 text-muted-foreground"
                              >
                                Ainda tenho dúvidas
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/30">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  Nenhum artigo encontrado para sua busca.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Contact & Support */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
          <Card className="bg-primary/5 border-primary/20 rounded-2xl sm:rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
              <LifeBuoy className="w-20 h-20 text-primary" />
            </div>
            <div className="relative">
              <h2 className="text-xl font-bold text-foreground mb-3">
                Suporte Direto
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed italic">
                Não encontrou o que procurava? Nosso time está pronto para
                ajudar você em tempo real.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => setShowSupport(true)}
                  className="w-full h-12 text-sm font-bold gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" />
                  Abrir Ticket de Suporte
                </Button>
                <Link href="/minhas-denuncias" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-sm font-bold gap-2 rounded-xl border-2 hover:bg-muted/50 transition-all"
                  >
                    <Flag className="w-5 h-5 text-red-500" />
                    Minhas Denúncias
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Connect Section */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-2">
              Conecte-se conosco
            </h3>
            <div className="grid gap-3">
              <a
                href="mailto:suporte@confilar.com.br"
                className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">E-mail</h4>
                  <p className="text-[10px] text-muted-foreground">
                    suporte@confilar.com.br
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href="https://www.instagram.com/appconfilar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Instagram</h4>
                  <p className="text-[10px] text-muted-foreground">
                    @appconfilar
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Quick Section */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-3">
          <HelpCircle className="text-primary" />
          Dúvidas Frequentes
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/40 hover:border-primary/20 transition-colors">
            <CardHeader className="p-5">
              <CardTitle className="text-base">
                Como funcionam as indicações?
              </CardTitle>
              <CardDescription>
                Ganhe 200 pontos assim que seu amigo iniciar o cadastro e mais
                50 pontos bônus quando ele atingir o nível Diamante.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/40 hover:border-primary/20 transition-colors">
            <CardHeader className="p-5">
              <CardTitle className="text-base">Meus pontos expiram?</CardTitle>
              <CardDescription>
                Não, os ConfiPoints não expiram. Você pode usá-los quando quiser
                para turbinar seus anúncios.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/40 hover:border-primary/20 transition-colors">
            <CardHeader className="p-5">
              <CardTitle className="text-base">
                Como me tornar um Profissional Verificado?
              </CardTitle>
              <CardDescription>
                Basta acessar seu perfil, clicar em "Verificar Identidade" e
                seguir os passos para envio de documento.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/40 hover:border-primary/20 transition-colors">
            <CardHeader className="p-5">
              <CardTitle className="text-base">
                O que é o Selo ConfiLar Pro?
              </CardTitle>
              <CardDescription>
                É uma assinatura mensal que dá visibilidade máxima, pontos bônus
                e selo exclusivo de destaque.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-20 sm:mt-32 pt-12 border-t border-border/30 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 opacity-50">
          <p className="text-[11px] sm:text-xs">© 2024 ConfiLar Marketplace</p>
          <div className="flex gap-6">
            <Link
              href="/termos"
              className="text-[11px] sm:text-xs hover:text-primary transition-colors italic"
            >
              Termos de Uso
            </Link>
            <Link
              href="/privacidade"
              className="text-[11px] sm:text-xs hover:text-primary transition-colors italic"
            >
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AjudaPage() {
  return (
    <ClientOnly>
      <MainLayout requireAuth={true}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }
        >
          <AjudaContent />
        </Suspense>
      </MainLayout>
    </ClientOnly>
  );
}

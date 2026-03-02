"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ArrowRight,
  LogIn,
  ShieldCheck,
  Users,
  Star,
  Zap,
  Briefcase,
  Smartphone,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function TestHomePage() {
  const t = useTranslations("landing");
  const tNav = useTranslations("navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#00b0b0]/20 selection:text-[#00b0b0]">
      {/* Header Simplificado e Focado */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8",
          scrolled
            ? "py-3 bg-white/90 backdrop-blur-md shadow-sm"
            : "py-5 bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/imagens/logo/Logo azul - sem fundo - horizontal.png"
              alt="ConfiLar"
              width={180}
              height={48}
              priority
              className="h-8 md:h-10 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6 text-sm font-semibold text-gray-600">
              <Link
                href="/buscar"
                className="hover:text-[#00b0b0] transition-colors"
              >
                Buscar
              </Link>
              <Link
                href="/profissionais"
                className="hover:text-[#00b0b0] transition-colors"
              >
                Profissionais
              </Link>
              <Link
                href="/sobre"
                className="hover:text-[#00b0b0] transition-colors"
              >
                Sobre
              </Link>
            </nav>
            <div className="h-4 w-[1px] bg-gray-200" />
            <div className="flex items-center gap-3">
              <Link
                href="/auth"
                className="text-sm font-bold text-[#00b0b0] hover:underline px-4"
              >
                Entrar
              </Link>
              <Button
                asChild
                className="bg-[#00b0b0] hover:bg-[#009090] text-white rounded-full px-6 font-bold shadow-md shadow-[#00b0b0]/20"
              >
                <Link href="/auth?tab=register">Criar Conta</Link>
              </Button>
            </div>
          </div>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Menu Mobile Simplificado */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white transition-transform duration-300 md:hidden pt-24 px-6",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <nav className="flex flex-col gap-6 text-xl font-bold">
          <Link
            href="/auth"
            className="flex items-center gap-3 py-4 border-b border-gray-100 text-[#00b0b0]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <LogIn size={24} /> Entrar na minha conta
          </Link>
          <Link
            href="/buscar"
            className="flex items-center gap-3 py-4 border-b border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Search size={24} /> Buscar Serviços
          </Link>
          <Link
            href="/profissionais"
            className="flex items-center gap-3 py-4 border-b border-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Users size={24} /> Profissionais
          </Link>
          <Link
            href="/auth?tab=register"
            className="mt-8"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button className="w-full bg-[#00b0b0] hover:bg-[#009090] text-white py-6 rounded-2xl text-lg font-bold">
              Começar Agora
            </Button>
          </Link>
        </nav>
      </div>

      <main>
        {/* Hero Section - Foco em Mobile e Clareza */}
        <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#00b0b0]/10 text-[#00b0b0] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <Zap size={14} className="fill-[#00b0b0]" /> 100% Verificado e
                Seguro
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
                Encontre quem você{" "}
                <span className="text-[#00b0b0]">confia</span> para o seu lar.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl">
                A plataforma mais prática e segura para contratar serviços
                domésticos e profissionais qualificados. Sem burocracia, direto
                ao ponto.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#00b0b0] hover:bg-[#009090] text-white py-7 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-[#00b0b0]/30 group"
                >
                  <Link href="/buscar">
                    Começar Buscar{" "}
                    <ArrowRight
                      size={20}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-200 py-7 px-8 rounded-2xl text-lg font-bold hover:bg-gray-50"
                >
                  <Link href="/auth">Fazer Login</Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden md:block">
              {/* Imagem de fundo decorativa - Círculo Brand */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#00b0b0]/5 rounded-full blur-3xl -z-10" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src="/imagens/Fotos/hero-bg.png"
                  alt="Serviços para o lar"
                  width={600}
                  height={800}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
                        >
                          <div className="w-full h-full bg-[#00b0b0]/20 flex items-center justify-center text-xs font-bold text-[#00b0b0]">
                            P{i}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        Mais de 5.000 profissionais
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        Atendimento garantido em Venâncio Aires e região.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Serviços em Cards - Otimizado para Mobile */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  O que você precisa hoje?
                </h2>
                <p className="text-gray-600">
                  Explore as categorias mais buscadas pelos nossos usuários.
                </p>
              </div>
              <Link
                href="/buscar"
                className="text-[#00b0b0] font-bold flex items-center gap-2 hover:underline"
              >
                Ver todos os serviços <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  name: "Limpeza",
                  icon: <Star className="text-yellow-500 fill-yellow-500" />,
                  img: "/imagens/Fotos/transparency.png",
                },
                {
                  name: "Reformas",
                  icon: <Briefcase className="text-blue-500" />,
                  img: "/imagens/Fotos/ads.png",
                },
                {
                  name: "Elétrica",
                  icon: <Zap className="text-orange-500 fill-orange-500" />,
                  img: "/imagens/Fotos/recommendations.png",
                },
                {
                  name: "Jardinagem",
                  icon: <CheckCircle className="text-green-500" />,
                  img: "/imagens/Fotos/referrals.png",
                },
              ].map((item, idx) => (
                <Card
                  key={idx}
                  className="group overflow-hidden rounded-2xl border-0 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/20 backdrop-blur-md w-10 h-10 rounded-xl flex items-center justify-center mb-2 border border-white/30">
                        {item.icon}
                      </div>
                      <h3 className="text-white font-bold text-lg">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section Diferenciais - Clean e Direto */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-[#00b0b0]/10 rounded-2xl flex items-center justify-center text-[#00b0b0] mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Segurança em 1º lugar
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Todos os profissionais passam por uma verificação rigorosa de
                  antecedentes e identidade antes de entrar na plataforma.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-[#00b0b0]/10 rounded-2xl flex items-center justify-center text-[#00b0b0] mb-6">
                  <Users size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Comunidade Real</h3>
                <p className="text-gray-600 leading-relaxed">
                  Avaliações reais de vizinhos e pessoas da sua cidade.
                  Transparência total sobre quem você está contratando.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-[#00b0b0]/10 rounded-2xl flex items-center justify-center text-[#00b0b0] mb-6">
                  <Smartphone size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Tudo pelo Celular</h3>
                <p className="text-gray-600 leading-relaxed">
                  Gerencie orçamentos, conversas e agendamentos na palma da sua
                  mão com nossa interface ultra-rápida.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-[#00b0b0] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-[#00b0b0]/40">
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-20 -mb-20 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Pronto para transformar seu lar?
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
                Crie sua conta agora e tenha acesso aos melhores profissionais
                da região em segundos. Programe seu primeiro serviço hoje.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-[#00b0b0] hover:bg-gray-50 py-7 px-10 rounded-2xl text-lg font-bold"
                >
                  <Link href="/auth?tab=register">Criar conta gratuita</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/40 text-white hover:bg-white/10 py-7 px-10 rounded-2xl text-lg font-bold"
                >
                  <Link href="/buscar">Apenas Explorar</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <Image
              src="/imagens/logo/Logo azul - sem fundo - horizontal.png"
              alt="ConfiLar"
              width={140}
              height={36}
              className="h-6 w-auto mb-4 mx-auto md:mx-0 opacity-50"
            />
            <p className="text-sm text-gray-500">
              © 2026 ConfiLar. Todos os direitos reservados.
            </p>
          </div>
          <div className="flex gap-8 text-sm font-bold text-gray-400">
            <Link
              href="/termos"
              className="hover:text-gray-900 transition-colors"
            >
              Termos
            </Link>
            <Link
              href="/privacidade"
              className="hover:text-gray-900 transition-colors"
            >
              Privacidade
            </Link>
            <Link
              href="/ajuda"
              className="hover:text-gray-900 transition-colors"
            >
              Ajuda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

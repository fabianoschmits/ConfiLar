"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  UserPlus,
  Menu,
  X,
  HelpCircle,
  FileText,
  Info,
  Mail,
  LogIn,
  Instagram,
} from "lucide-react";
import Link from "next/link";

export function MobileFloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão flutuante */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Menu expandido */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 md:hidden">
          <Card className="w-72 max-h-[80vh] overflow-y-auto shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4 space-y-2">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900">Menu</h3>
                <p className="text-sm text-gray-600">
                  Acesse as principais funcionalidades
                </p>
              </div>

              <Separator />

              {/* Acesso à Conta */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase px-2">
                  Acesso
                </h4>
                <Link href="/auth" onClick={handleClose}>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                    size="lg"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Fazer Login
                  </Button>
                </Link>

                <Link href="/auth?tab=register" onClick={handleClose}>
                  <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 justify-start"
                    size="lg"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Conta
                  </Button>
                </Link>
              </div>

              <Separator />

              {/* Informações */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase px-2">
                  Informações
                </h4>

                <Link href="/sobre" onClick={handleClose}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-100"
                    size="lg"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Sobre Nós
                  </Button>
                </Link>

                <Link href="/ajuda" onClick={handleClose}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-100"
                    size="lg"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Central de Ajuda
                  </Button>
                </Link>

                <Link href="/termos" onClick={handleClose}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-100"
                    size="lg"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Termos de Uso
                  </Button>
                </Link>

                {/* Contato - assumindo que existe uma página ou pode ser email */}
                <a
                  href="mailto:contato@appconfilar.com.br"
                  onClick={handleClose}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-100"
                    size="lg"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contato
                  </Button>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/appconfilar"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-100"
                    size="lg"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay para fechar o menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={handleClose}
        />
      )}
    </>
  );
}

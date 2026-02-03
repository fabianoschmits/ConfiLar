import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Zap, Coins, MessageCircle, Share2, Eye } from "lucide-react";
import { PremiumLikeButton } from "@/components/points/PremiumLikeButton";

// Componente de demonstração do layout integrado
export function PostActionsDemo() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Layout Integrado: Curtidas Normal + Premium
      </h2>

      {/* Exemplo de Post */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <h3 className="font-semibold">Usuário Exemplo</h3>
              <p className="text-sm text-gray-500">há 2 horas</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="mb-4">
            Este é um exemplo de post com o novo sistema integrado de curtidas.
            Agora você pode curtir normalmente (gratuito) ou usar curtidas
            premium (5 pontos).
          </p>

          {/* Layout Integrado */}
          <div className="pt-4 border-t">
            {/* Primeira linha: Curtidas (Normal + Premium) */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Sistema de Curtidas Antigo */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">12</span>
                </Button>

                {/* Separador visual */}
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                {/* Sistema de Curtidas Premium */}
                <PremiumLikeButton
                  postId="demo-post"
                  postCreatorId="demo-user"
                  size="sm"
                  showStats={false}
                />
              </div>

              {/* Contador de visualizações */}
              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                <Eye className="h-4 w-4" />
                <span className="text-sm">156</span>
              </button>
            </div>

            {/* Segunda linha: Comentários e Compartilhar */}
            <div className="flex items-center justify-between">
              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">8</span>
              </button>

              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                <Share2 className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">Compartilhar</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explicação */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Como Funciona:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>
                <strong>Curtida Normal:</strong> Gratuita, sem pontos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <Coins className="h-4 w-4 text-green-500" />
              <span>
                <strong>Curtida Premium:</strong> 5 pontos, transfere para o
                criador
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-px h-4 bg-gray-300"></div>
              <span>
                <strong>Separador:</strong> Distingue os dois sistemas
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

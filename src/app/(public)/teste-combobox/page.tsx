"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Combobox, 
  ComboboxCategorias, 
  ComboboxEstados, 
  ComboboxTipoUsuario 
} from "@/components/ui/Combobox"

export default function TesteComboboxPage() {
  const [frameworkValue, setFrameworkValue] = React.useState("")
  const [categoriaValue, setCategoriaValue] = React.useState("")
  const [estadoValue, setEstadoValue] = React.useState("")
  const [tipoUsuarioValue, setTipoUsuarioValue] = React.useState("")
  const [customValue, setCustomValue] = React.useState("")

  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
  ]

  const customOptions = [
    { value: "opcao1", label: "Opção Personalizada 1" },
    { value: "opcao2", label: "Opção Personalizada 2" },
    { value: "opcao3", label: "Opção Personalizada 3" },
    { value: "opcao4", label: "Opção Personalizada 4" },
  ]

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧪 Página de Teste - Combobox
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Combobox Customizado */}
          <Card>
            <CardHeader>
              <CardTitle>Combobox Customizado</CardTitle>
            </CardHeader>
            <CardContent>
              <Combobox
                options={frameworks}
                value={frameworkValue}
                onValueChange={setFrameworkValue}
                placeholder="Selecionar framework..."
                searchPlaceholder="Buscar framework..."
                emptyMessage="Nenhum framework encontrado."
              />
              <p className="text-sm text-gray-600 mt-2">
                Combobox genérico com opções customizadas
              </p>
              {frameworkValue && (
                <p className="text-sm text-green-600 mt-2">
                  Selecionado: {frameworkValue}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Combobox Categorias */}
          <Card>
            <CardHeader>
              <CardTitle>Combobox Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <ComboboxCategorias
                value={categoriaValue}
                onValueChange={setCategoriaValue}
              />
              <p className="text-sm text-gray-600 mt-2">
                Para seleção de categorias de profissionais
              </p>
              {categoriaValue && (
                <p className="text-sm text-green-600 mt-2">
                  Selecionado: {categoriaValue}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Combobox Estados */}
          <Card>
            <CardHeader>
              <CardTitle>Combobox Estados</CardTitle>
            </CardHeader>
            <CardContent>
              <ComboboxEstados
                value={estadoValue}
                onValueChange={setEstadoValue}
              />
              <p className="text-sm text-gray-600 mt-2">
                Para seleção de estados brasileiros
              </p>
              {estadoValue && (
                <p className="text-sm text-green-600 mt-2">
                  Selecionado: {estadoValue}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Combobox Tipo Usuário */}
          <Card>
            <CardHeader>
              <CardTitle>Combobox Tipo Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <ComboboxTipoUsuario
                value={tipoUsuarioValue}
                onValueChange={setTipoUsuarioValue}
              />
              <p className="text-sm text-gray-600 mt-2">
                Para seleção de tipo de usuário
              </p>
              {tipoUsuarioValue && (
                <p className="text-sm text-green-600 mt-2">
                  Selecionado: {tipoUsuarioValue}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Combobox com Opções Personalizadas */}
          <Card>
            <CardHeader>
              <CardTitle>Combobox Personalizado</CardTitle>
            </CardHeader>
            <CardContent>
              <Combobox
                options={customOptions}
                value={customValue}
                onValueChange={setCustomValue}
                placeholder="Selecionar opção..."
                searchPlaceholder="Buscar opção..."
                emptyMessage="Nenhuma opção encontrada."
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">
                Combobox com opções personalizadas
              </p>
              {customValue && (
                <p className="text-sm text-green-600 mt-2">
                  Selecionado: {customValue}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Combobox Desabilitado */}
          <Card>
            <CardHeader>
              <CardTitle>Combobox Desabilitado</CardTitle>
            </CardHeader>
            <CardContent>
              <ComboboxCategorias
                value=""
                onValueChange={() => {}}
                disabled={true}
              />
              <p className="text-sm text-gray-600 mt-2">
                Combobox desabilitado para demonstração
              </p>
            </CardContent>
          </Card>

        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>📋 Como Usar o Combobox</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">✅ Vantagens:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                    <li>Busca em tempo real</li>
                    <li>Interface limpa e moderna</li>
                    <li>Acessível (ARIA labels)</li>
                    <li>Responsivo</li>
                    <li>Fácil de customizar</li>
                    <li>Componente reutilizável</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold">🎯 Onde Aplicar:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                    <li>Filtros de busca</li>
                    <li>Seleção de categorias</li>
                    <li>Seleção de localização</li>
                    <li>Filtros avançados</li>
                    <li>Formulários de cadastro</li>
                    <li>Configurações de perfil</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">🔧 Componentes Disponíveis:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                    <li><code>Combobox</code> - Genérico para qualquer lista</li>
                    <li><code>ComboboxCategorias</code> - Para categorias de profissionais</li>
                    <li><code>ComboboxEstados</code> - Para estados brasileiros</li>
                    <li><code>ComboboxTipoUsuario</code> - Para tipos de usuário</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

# Correção do Sistema de Filtros de Localização

## Problema Identificado

O sistema de filtros de localização não estava funcionando corretamente, principalmente o filtro custom onde o usuário pode selecionar estado e cidade manualmente.

## Análise do Problema

### 1. Formato dos Valores

Os componentes `EstadoCombobox` e `CidadeCombobox` retornam:
- **Estado**: Nome completo do estado (ex: "São Paulo", não "SP")
- **Cidade**: Nome completo da cidade (ex: "São Paulo")

### 2. Comparação no Banco

Inicialmente estávamos usando `.eq()` (equal) que é case-sensitive e exige match exato. Isso causava problemas se houvesse:
- Diferenças de capitalização
- Espaços extras
- Caracteres especiais

### 3. Filtro Custom vs Filtros Padrão

- **Filtros Padrão** (local, state): Usam valores do perfil do usuário
- **Filtro Custom**: Usa valores selecionados pelos comboboxes

Ambos devem funcionar da mesma forma!

## Solução Implementada

### 1. Uso de `.ilike()` para Case-Insensitive Match

Mudamos de `.eq()` para `.ilike()` em todos os filtros:

```typescript
// ANTES (case-sensitive)
postsQuery = postsQuery.eq('location_city', locationFilter.city)

// DEPOIS (case-insensitive)
postsQuery = postsQuery.ilike('location_city', locationFilter.city)
```

### 2. Suporte para Filtro apenas de Estado

Adicionamos suporte para quando o usuário seleciona apenas o estado (sem cidade) no filtro custom:

```typescript
case 'custom':
  if (locationFilter.city && locationFilter.state) {
    // Filtrar por cidade E estado
    postsQuery = postsQuery
      .ilike('location_city', locationFilter.city)
      .ilike('location_state', locationFilter.state)
  } else if (locationFilter.state && !locationFilter.city) {
    // Filtrar apenas por estado
    postsQuery = postsQuery.ilike('location_state', locationFilter.state)
  }
  break
```

### 3. Logs Detalhados para Debug

Adicionamos logs em todo o processo de filtro:
- 🔍 Quando um filtro é aplicado
- 🏠 Tipo de filtro e valores
- 📊 Quantidade de posts retornados
- 🎯 Dados dos primeiros posts (cidade e estado)

## Como Testar

### 1. Teste de Filtro Local (Sua Cidade)
1. Acesse o feed social
2. Abra o console do navegador (F12)
3. Selecione "🏠 Sua Cidade" no filtro
4. Verifique os logs mostrando posts da sua cidade

### 2. Teste de Filtro de Estado
1. Selecione "🏙️ Seu Estado" no filtro
2. Verifique que aparecem posts de todo o estado

### 3. Teste de Filtro Custom
1. Selecione "🎯 Escolher localização" no filtro
2. Selecione um estado
3. Selecione uma cidade
4. Clique em "Aplicar Filtro"
5. Verifique que aparecem posts apenas daquela cidade

### 4. Teste de Filtro Custom (Apenas Estado)
1. Selecione "🎯 Escolher localização" no filtro
2. Selecione um estado
3. NÃO selecione cidade
4. Clique em "Aplicar Filtro"
5. Verifique que aparecem posts de todo o estado

### 5. Teste de Todos os Locais
1. Selecione "🌍 Todos os locais" no filtro
2. Verifique que aparecem posts de todas as localizações

## Arquivos Modificados

- `src/hooks/useUnifiedTimeline.ts` - Lógica de filtros
- `docs/CORRECAO_FILTROS_LOCALIZACAO.md` - Esta documentação

## Logs para Acompanhar

No console do navegador, você verá:

```
🔍 Aplicando filtro de localização: {
  type: 'custom',
  city: 'São Paulo',
  state: 'São Paulo'
}
🎯 Aplicando filtro custom: {
  city: 'São Paulo',
  state: 'São Paulo'
}
📊 Posts retornados: {
  total: 15,
  filter: 'custom',
  city: 'São Paulo',
  state: 'São Paulo',
  primeiros3Posts: [...]
}
```

## Observações

- O `.ilike()` do Supabase/PostgreSQL faz match case-insensitive
- Não precisa adicionar wildcards (`%`) para match exato
- Os valores devem ser strings completas (ex: "São Paulo", não "SP")
- Se houver problemas, verificar se os dados no banco estão no formato correto

## Próximos Passos

Se ainda houver problemas:
1. Executar `scripts/check-location-data.sql` no Supabase para verificar formato dos dados
2. Verificar se os valores no perfil do usuário estão corretos
3. Verificar se os posts estão sendo salvos com location_city e location_state corretos


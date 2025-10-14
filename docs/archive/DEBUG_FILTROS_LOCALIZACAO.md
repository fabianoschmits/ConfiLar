# Debug de Filtros de Localização

## Sistema de Logs Implementado

Adicionei logs detalhados em TODOS os pontos do sistema de filtros para identificar exatamente onde está o problema.

## Como Usar os Logs

### 1. Abra o Console do Navegador
- Pressione `F12` no navegador
- Vá para a aba "Console"
- Limpe o console (botão 🚫 ou Ctrl+L)

### 2. Carregue a Página do Feed
Você verá:

```
👤 Perfil do usuário: {
  location_city: "Sua Cidade",
  location_state: "Seu Estado",
  city length: 10,
  state length: 9,
  city type: "string",
  state type: "string"
}
📍 Filtro inicial: {
  type: "local",
  city: "Sua Cidade",
  state: "Seu Estado"
}
```

**Anote estes valores!** Eles são a base para comparação.

### 3. Teste o Filtro Padrão (Sua Cidade)
Clique no filtro e selecione "🏠 Sua Cidade"

Você verá:
```
🎯 Filtro selecionado: { type: "local", city: "...", state: "..." }
📤 Aplicando filtro padrão: { ... }
🔄 Feed recebeu filtro: { ... }
```

### 4. Teste o Filtro Custom
Clique em "🎯 Escolher localização" e selecione estado e cidade

Você verá:
```
🎯 Selecionando localização custom: {
  customState: "Estado Selecionado",
  customCity: "Cidade Selecionada",
  customState length: 10,
  customCity length: 12
}
✅ Filtro custom criado: { ... }
📤 Enviando filtro custom para hook
🔄 Feed recebeu filtro: { ... }
```

### 5. Veja os Posts Retornados
Após aplicar qualquer filtro, você verá:

```
🔍 Aplicando filtro de localização: {
  type: "custom",
  city: "Cidade Selecionada",
  state: "Estado Selecionado"
}
📊 Posts retornados: {
  total: 0,
  todosOsPosts: [
    {
      id: "...",
      title: "...",
      location_city: "Cidade Real no Post",
      location_state: "Estado Real no Post",
      cityMatch: false,    // ← IMPORTANTE!
      stateMatch: false,   // ← IMPORTANTE!
      cityMatchLower: false,
      stateMatchLower: false
    }
  ]
}
```

## O Que Procurar

### ✅ Se Funcionar
- `cityMatch: true` e `stateMatch: true`
- `total: > 0` (algum número maior que zero)
- Posts sendo exibidos na tela

### ❌ Se NÃO Funcionar
Procure por estas diferenças:

1. **Maiúsculas/Minúsculas diferentes**
   ```
   Filtro: city: "São Paulo"
   Post:   location_city: "são paulo"
   ```

2. **Espaços extras**
   ```
   Filtro: city: "São Paulo"
   Post:   location_city: "São Paulo " (espaço no final)
   ```

3. **Acentuação diferente**
   ```
   Filtro: city: "Sao Paulo" (sem acento)
   Post:   location_city: "São Paulo" (com acento)
   ```

4. **Caracteres especiais ou invisíveis**
   ```
   city length: 10
   Mas deveria ser: 9
   (indica espaço ou caractere invisível)
   ```

## Comparação de Filtros

### Filtro Padrão (Local)
- Usa dados do seu perfil (`profile.location_city`, `profile.location_state`)
- Aplicado automaticamente ao carregar a página

### Filtro Custom
- Usa dados dos comboboxes (EstadoCombobox, CidadeCombobox)
- Retorna nomes completos (ex: "São Paulo", não "SP")

**Ambos devem funcionar da mesma forma!**

## Scripts SQL para Debug

Execute `scripts/debug-location-filters.sql` no Supabase SQL Editor para ver:
- Todos os posts e suas localizações
- Valores únicos de estados e cidades
- Tamanho das strings (detecta espaços extras)
- Diferentes tipos de match (exato, ilike, lower+trim)

## Próximos Passos

1. **Colete os logs** seguindo as instruções acima
2. **Compare os valores**:
   - Valor do filtro vs valor no post
   - cityMatch e stateMatch (devem ser true)
3. **Identifique a diferença**:
   - Maiúsculas?
   - Espaços?
   - Acentos?
   - Tamanho diferente?
4. **Compartilhe os logs** para que eu possa ver exatamente o problema

## Exemplo de Log Completo

Quando você aplicar um filtro, verá algo assim:

```
🎯 Filtro selecionado: {type: 'local', city: 'Campinas', state: 'São Paulo'}
📤 Aplicando filtro padrão: {type: 'local', city: 'Campinas', state: 'São Paulo'}
🔄 Feed recebeu filtro: {type: 'local', city: 'Campinas', state: 'São Paulo', city length: 8, state length: 10}
📍 Filtro atual antes da mudança: {type: 'local', city: 'Campinas', state: 'São Paulo'}
✅ setFilter foi chamado
🔍 Aplicando filtro de localização: {type: 'local', city: 'Campinas', state: 'São Paulo', country: 'Brasil'}
🏠 Filtro local: {city: 'Campinas', state: 'São Paulo'}
📊 Posts retornados: {
  total: 5,
  filter: 'local',
  city: 'Campinas',
  state: 'São Paulo',
  todosOsPosts: [
    {
      id: '123',
      title: 'Meu trabalho de elétrica',
      location_city: 'Campinas',
      location_state: 'São Paulo',
      cityMatch: true,    // ✅ Match!
      stateMatch: true,   // ✅ Match!
      cityMatchLower: true,
      stateMatchLower: true
    },
    // ... mais posts
  ]
}
```

Copie e envie estes logs para análise!


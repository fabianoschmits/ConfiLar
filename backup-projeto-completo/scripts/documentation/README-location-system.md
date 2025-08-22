# 🗺️ Sistema Centralizado de Localizações

## 📁 **Arquivo Principal:**
`src/data/brazilianLocations.ts`

## 🎯 **Como Usar em Qualquer Componente:**

### **1. Importar os Comboboxes:**
```tsx
import { 
  CategoriaCombobox, 
  EstadoCombobox, 
  CidadeCombobox 
} from '@/components/ui/LocationComboboxes'
```

### **2. Estados no Componente:**
```tsx
const [selectedState, setSelectedState] = useState('')
const [selectedCity, setSelectedCity] = useState('')
const [selectedCategory, setSelectedCategory] = useState('')
```

### **3. Uso dos Comboboxes:**
```tsx
{/* Estado - Sempre habilitado */}
<EstadoCombobox
  value={selectedState}
  onValueChange={setSelectedState}
  placeholder="Selecione o estado"
/>

{/* Cidade - Habilitada apenas quando estado é selecionado */}
<CidadeCombobox
  value={selectedCity}
  onValueChange={setSelectedCity}
  estadoSigla={selectedState}
  placeholder="Selecione a cidade"
  disabled={!selectedState}
/>

{/* Categoria */}
<CategoriaCombobox
  value={selectedCategory}
  onValueChange={setSelectedCategory}
  placeholder="Selecione a categoria"
/>
```

## 🔄 **Funcionalidades Automáticas:**

### **✅ Seleção de Estado:**
- Mostra nome completo e sigla
- Busca por nome ou sigla
- Ícone de localização

### **✅ Seleção de Cidade:**
- **Desabilitada** até selecionar estado
- **Filtra cidades** apenas do estado selecionado
- **Reset automático** quando estado muda
- **Busca inteligente** dentro das cidades do estado

### **✅ Seleção de Categoria:**
- Ícones para cada categoria
- Busca por nome
- Opção "Todas as Categorias"

## 🎨 **Layout Responsivo Recomendado:**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  <CategoriaCombobox ... />
  <EstadoCombobox ... />
  <CidadeCombobox ... />
  <Select ... /> {/* Outros filtros */}
</div>
```

## 🚀 **Vantagens do Sistema:**

1. **🔄 Consistência:** Mesmo comportamento em todo o site
2. **🎯 UX Melhorada:** Cidade só aparece após selecionar estado
3. **🔍 Busca Inteligente:** Filtros contextuais
4. **📱 Responsivo:** Layout adaptável
5. **🎨 Visual Uniforme:** Mesmo estilo em todos os lugares
6. **🛠️ Manutenção:** Um arquivo para atualizar todos os lugares

## 📝 **Para Adicionar Mais Estados/Cidades:**

1. **Edite** `src/data/brazilianLocations.ts`
2. **Adicione** novos estados e cidades
3. **Todos os componentes** serão atualizados automaticamente

## 🔧 **Funções Utilitárias Disponíveis:**

```tsx
import { 
  getEstados,
  getEstadoBySigla,
  getCidadesByEstado,
  searchEstados,
  searchCidades
} from '@/data/brazilianLocations'

// Exemplos de uso
const estados = getEstados()
const estadoSP = getEstadoBySigla('SP')
const cidadesSP = getCidadesByEstado('SP')
const estadosFiltrados = searchEstados('São')
const cidadesFiltradas = searchCidades('Paulo', 'SP')
```

## 🎉 **Resultado Final:**

- ✅ **Sistema unificado** para todo o site
- ✅ **UX consistente** e intuitiva
- ✅ **Filtros inteligentes** e contextuais
- ✅ **Layout responsivo** e organizado
- ✅ **Manutenção centralizada** e simples

// Serviço para integração com a API do IBGE
// Documentação: https://servicodados.ibge.gov.br/api/docs

export interface IBGEEstado {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

export interface IBGECidade {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
        regiao: {
          id: number;
          sigla: string;
          nome: string;
        };
      };
    };
  };
}

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
  regiao: string;
}

export interface Cidade {
  id: number;
  nome: string;
  estado: string;
  estadoSigla: string;
}

// Estados brasileiros como fallback
const estadosFallback: Estado[] = [
  { id: 12, sigla: "AC", nome: "Acre", regiao: "Norte" },
  { id: 27, sigla: "AL", nome: "Alagoas", regiao: "Nordeste" },
  { id: 16, sigla: "AP", nome: "Amapá", regiao: "Norte" },
  { id: 13, sigla: "AM", nome: "Amazonas", regiao: "Norte" },
  { id: 29, sigla: "BA", nome: "Bahia", regiao: "Nordeste" },
  { id: 23, sigla: "CE", nome: "Ceará", regiao: "Nordeste" },
  { id: 53, sigla: "DF", nome: "Distrito Federal", regiao: "Centro-Oeste" },
  { id: 32, sigla: "ES", nome: "Espírito Santo", regiao: "Sudeste" },
  { id: 52, sigla: "GO", nome: "Goiás", regiao: "Centro-Oeste" },
  { id: 21, sigla: "MA", nome: "Maranhão", regiao: "Nordeste" },
  { id: 51, sigla: "MT", nome: "Mato Grosso", regiao: "Centro-Oeste" },
  { id: 50, sigla: "MS", nome: "Mato Grosso do Sul", regiao: "Centro-Oeste" },
  { id: 31, sigla: "MG", nome: "Minas Gerais", regiao: "Sudeste" },
  { id: 15, sigla: "PA", nome: "Pará", regiao: "Norte" },
  { id: 25, sigla: "PB", nome: "Paraíba", regiao: "Nordeste" },
  { id: 41, sigla: "PR", nome: "Paraná", regiao: "Sul" },
  { id: 26, sigla: "PE", nome: "Pernambuco", regiao: "Nordeste" },
  { id: 22, sigla: "PI", nome: "Piauí", regiao: "Nordeste" },
  { id: 33, sigla: "RJ", nome: "Rio de Janeiro", regiao: "Sudeste" },
  { id: 24, sigla: "RN", nome: "Rio Grande do Norte", regiao: "Nordeste" },
  { id: 43, sigla: "RS", nome: "Rio Grande do Sul", regiao: "Sul" },
  { id: 11, sigla: "RO", nome: "Rondônia", regiao: "Norte" },
  { id: 14, sigla: "RR", nome: "Roraima", regiao: "Norte" },
  { id: 42, sigla: "SC", nome: "Santa Catarina", regiao: "Sul" },
  { id: 35, sigla: "SP", nome: "São Paulo", regiao: "Sudeste" },
  { id: 28, sigla: "SE", nome: "Sergipe", regiao: "Nordeste" },
  { id: 17, sigla: "TO", nome: "Tocantins", regiao: "Norte" },
];

class IBGEService {
  private baseURL = "https://servicodados.ibge.gov.br/api/v1";
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas
  private useCache = true;

  private async fetchWithCache<T>(url: string): Promise<T> {
    const cacheKey = url;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data as T;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache dos dados
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error("Erro ao buscar dados do IBGE:", error);
      throw error;
    }
  }

  // Buscar todos os estados
  async getEstados(): Promise<Estado[]> {
    try {
      const estados = await this.fetchWithCache<IBGEEstado[]>(
        `${this.baseURL}/localidades/estados?orderBy=nome`,
      );

      return estados.map((estado) => ({
        id: estado.id,
        sigla: estado.sigla,
        nome: estado.nome,
        regiao: estado.regiao.nome,
      }));
    } catch (error) {
      console.warn(
        "Erro ao buscar estados da API IBGE, usando dados de fallback:",
        error,
      );
      // Retornar dados estáticos como fallback
      return estadosFallback.sort((a, b) => a.nome.localeCompare(b.nome));
    }
  }

  // Buscar cidades de um estado específico
  async getCidadesByEstado(siglaEstado: string): Promise<Cidade[]> {
    try {
      // Primeiro, buscar o estado para obter o ID
      const estados = await this.getEstados();
      const estado = estados.find((e) => e.sigla === siglaEstado);

      if (!estado) {
        throw new Error(`Estado não encontrado: ${siglaEstado}`);
      }

      const cidades = await this.fetchWithCache<IBGECidade[]>(
        `${this.baseURL}/localidades/estados/${estado.id}/municipios?orderBy=nome`,
      );

      return cidades.map((cidade) => ({
        id: cidade.id,
        nome: cidade.nome,
        estado: cidade.microrregiao.mesorregiao.UF.nome,
        estadoSigla: cidade.microrregiao.mesorregiao.UF.sigla,
      }));
    } catch (error) {
      console.warn(
        "Erro ao buscar cidades da API IBGE, usando dados de fallback:",
        error,
      );
      // Retornar cidades principais como fallback
      return this.getCidadesFallback(siglaEstado);
    }
  }

  // Cidades principais de fallback para cada estado
  private getCidadesFallback(siglaEstado: string): Cidade[] {
    const cidadesPorEstado: { [key: string]: string[] } = {
      AC: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira"],
      AL: ["Maceió", "Arapiraca", "Palmeira dos Índios"],
      AP: ["Macapá", "Santana", "Laranjal do Jari"],
      AM: ["Manaus", "Parintins", "Itacoatiara"],
      BA: [
        "Salvador",
        "Feira de Santana",
        "Vitória da Conquista",
        "Camaçari",
        "Juazeiro",
      ],
      CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral"],
      DF: ["Brasília", "Ceilândia", "Taguatinga", "Águas Claras"],
      ES: ["Vitória", "Vila Velha", "Cariacica", "Serra", "Linhares"],
      GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde"],
      MA: ["São Luís", "Imperatriz", "Timon", "Caxias"],
      MT: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop"],
      MS: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá"],
      MG: [
        "Belo Horizonte",
        "Uberlândia",
        "Contagem",
        "Juiz de Fora",
        "Betim",
        "Montes Claros",
      ],
      PA: ["Belém", "Ananindeua", "Santarém", "Marabá"],
      PB: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos"],
      PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"],
      PE: [
        "Recife",
        "Jaboatão dos Guararapes",
        "Olinda",
        "Caruaru",
        "Petrolina",
      ],
      PI: ["Teresina", "Parnaíba", "Picos", "Piripiri"],
      RJ: [
        "Rio de Janeiro",
        "São Gonçalo",
        "Duque de Caxias",
        "Nova Iguaçu",
        "Niterói",
        "Campos dos Goytacazes",
      ],
      RN: ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante"],
      RS: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"],
      RO: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Cacoal"],
      RR: ["Boa Vista", "Rorainópolis", "Caracaraí"],
      SC: ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma"],
      SP: [
        "São Paulo",
        "Guarulhos",
        "Campinas",
        "São Bernardo do Campo",
        "Santo André",
        "Osasco",
        "Ribeirão Preto",
      ],
      SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana"],
      TO: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional"],
    };

    const estado = estadosFallback.find((e) => e.sigla === siglaEstado);
    const cidades = cidadesPorEstado[siglaEstado] || [];

    return cidades
      .map((cidade, index) => ({
        id: index + 1,
        nome: cidade,
        estado: estado?.nome || "",
        estadoSigla: siglaEstado,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  // Buscar estado por sigla
  async getEstadoBySigla(sigla: string): Promise<Estado | undefined> {
    try {
      const estados = await this.getEstados();
      return estados.find((estado) => estado.sigla === sigla);
    } catch (error) {
      console.error("Erro ao buscar estado por sigla:", error);
      return undefined;
    }
  }

  // Buscar estado por nome
  async getEstadoByNome(nome: string): Promise<Estado | undefined> {
    try {
      const estados = await this.getEstados();
      return estados.find(
        (estado) =>
          estado.nome.toLowerCase().includes(nome.toLowerCase()) ||
          estado.sigla.toLowerCase().includes(nome.toLowerCase()),
      );
    } catch (error) {
      console.error("Erro ao buscar estado por nome:", error);
      return undefined;
    }
  }

  // Buscar cidades por termo (em um estado específico ou em todo o Brasil)
  async searchCidades(termo: string, siglaEstado?: string): Promise<Cidade[]> {
    try {
      let cidades: Cidade[] = [];

      if (siglaEstado) {
        cidades = await this.getCidadesByEstado(siglaEstado);
      } else {
        // Se não especificar estado, buscar em todos os estados
        const estados = await this.getEstados();
        const todasCidades: Cidade[] = [];

        for (const estado of estados) {
          try {
            const cidadesEstado = await this.getCidadesByEstado(estado.sigla);
            todasCidades.push(...cidadesEstado);
          } catch (error) {
            console.warn(
              `Erro ao buscar cidades do estado ${estado.sigla}:`,
              error,
            );
          }
        }

        cidades = todasCidades;
      }

      if (!termo) return cidades;

      return cidades.filter((cidade) =>
        cidade.nome.toLowerCase().includes(termo.toLowerCase()),
      );
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
      return [];
    }
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear();
  }

  // Verificar se o serviço está funcionando
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseURL}/localidades/estados?orderBy=nome&limit=1`,
      );
      return response.ok;
    } catch (error) {
      console.error("IBGE API health check failed:", error);
      return false;
    }
  }
}

// Instância singleton do serviço
export const ibgeService = new IBGEService();

// Funções de conveniência para compatibilidade com o código existente
export const getEstados = () => ibgeService.getEstados();
export const getEstadoBySigla = (sigla: string) =>
  ibgeService.getEstadoBySigla(sigla);
export const getCidadesByEstado = (siglaEstado: string) =>
  ibgeService.getCidadesByEstado(siglaEstado);
export const getEstadoByNome = (nome: string) =>
  ibgeService.getEstadoByNome(nome);
export const searchEstados = (termo: string) =>
  ibgeService
    .getEstados()
    .then((estados) =>
      termo
        ? estados.filter(
            (estado) =>
              estado.nome.toLowerCase().includes(termo.toLowerCase()) ||
              estado.sigla.toLowerCase().includes(termo.toLowerCase()),
          )
        : estados,
    );
export const searchCidades = (termo: string, siglaEstado?: string) =>
  ibgeService.searchCidades(termo, siglaEstado);

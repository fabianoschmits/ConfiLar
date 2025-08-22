// Arquivo centralizado com estados e cidades do Brasil
// Este arquivo será usado em todo o site para manter consistência

export interface Estado {
  sigla: string
  nome: string
  cidades: string[]
}

export const estadosBrasil: Estado[] = [
  {
    sigla: 'AC',
    nome: 'Acre',
    cidades: [
      'Acrelândia',
      'Assis Brasil',
      'Brasiléia',
      'Bujari',
      'Capixaba',
      'Cruzeiro do Sul',
      'Epitaciolândia',
      'Feijó',
      'Jordão',
      'Mâncio Lima',
      'Manoel Urbano',
      'Marechal Thaumaturgo',
      'Plácido de Castro',
      'Porto Acre',
      'Porto Walter',
      'Rio Branco',
      'Rodrigues Alves',
      'Santa Rosa do Purus',
      'Sena Madureira',
      'Senador Guiomard',
      'Tarauacá',
      'Xapuri'
    ]
  },
  {
    sigla: 'AL',
    nome: 'Alagoas',
    cidades: [
      'Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Penedo', 'São Miguel dos Campos',
      'Pilar', 'Coruripe', 'Rio Largo', 'Penedo', 'União dos Palmares'
    ]
  },
  {
    sigla: 'AP',
    nome: 'Amapá',
    cidades: [
      'Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão',
      'Pedra Branca do Amapari', 'Tartarugalzinho', 'Calçoene', 'Amapá', 'Ferreira Gomes'
    ]
  },
  {
    sigla: 'AM',
    nome: 'Amazonas',
    cidades: [
      'Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari',
      'Tefé', 'Tabatinga', 'Humaitá', 'São Gabriel da Cachoeira', 'Iranduba'
    ]
  },
  {
    sigla: 'BA',
    nome: 'Bahia',
    cidades: [
      'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna',
      'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Barreiras', 'Alagoinhas'
    ]
  },
  {
    sigla: 'CE',
    nome: 'Ceará',
    cidades: [
      'Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral',
      'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá'
    ]
  },
  {
    sigla: 'DF',
    nome: 'Distrito Federal',
    cidades: [
      'Brasília', 'Gama', 'Taguatinga', 'Brazlândia', 'Sobradinho', 'Planaltina', 'Paranoá', 'Núcleo Bandeirante', 'Ceilândia', 'Guará',
      'Cruzeiro', 'Samambaia', 'Santa Maria', 'São Sebastião', 'Recanto das Emas', 'Lago Sul', 'Riacho Fundo', 'Lago Norte', 'Candangolândia', 'Águas Claras',
      'Candangolândia', 'Riacho Fundo II', 'Sudoeste/Octogonal', 'Varjão', 'Park Way', 'SCIA', 'Sobradinho II', 'Jardim Botânico', 'Itapoã', 'SIA'
    ]
  },
  {
    sigla: 'ES',
    nome: 'Espírito Santo',
    cidades: [
      'Vitória', 'Vila Velha', 'Serra', 'Linhares', 'Cariacica',
      'Aracruz', 'Guarapari', 'Colatina', 'São Mateus', 'Viana'
    ]
  },
  {
    sigla: 'GO',
    nome: 'Goiás',
    cidades: [
      'Abadia de Goiás', 'Abadiânia', 'Acreúna', 'Adelândia', 'Água Fria de Goiás', 'Água Limpa', 'Águas Lindas de Goiás', 'Alexânia', 'Aloândia', 'Alto Horizonte',
      'Alto Paraíso de Goiás', 'Alvorada do Norte', 'Amaralina', 'Americano do Brasil', 'Amorinópolis', 'Anápolis', 'Anhanguera', 'Anicuns', 'Aparecida de Goiânia', 'Aparecida do Rio Doce',
      'Aporé', 'Araçu', 'Aragarças', 'Aragoiânia', 'Araguapaz', 'Arenópolis', 'Aruanã', 'Aurilândia', 'Avelinópolis', 'Baliza',
      'Barro Alto', 'Bela Vista de Goiás', 'Bom Jardim de Goiás', 'Bom Jesus de Goiás', 'Bonfinópolis', 'Bonópolis', 'Brazabrantes', 'Britânia', 'Buriti Alegre', 'Buriti de Goiás',
      'Buritinópolis', 'Cabeceiras', 'Cachoeira Alta', 'Cachoeira de Goiás', 'Cachoeira Dourada', 'Caçu', 'Caiapônia', 'Caldas Novas', 'Caldazinha', 'Campestre de Goiás',
      'Campinaçu', 'Campinorte', 'Campo Alegre de Goiás', 'Campo Limpo de Goiás', 'Campos Belos', 'Campos Verdes', 'Carmo do Rio Verde', 'Castelândia', 'Catalão', 'Caturaí',
      'Cavalcante', 'Ceres', 'Cezarina', 'Chapadão do Céu', 'Cidade Ocidental', 'Cocalzinho de Goiás', 'Colinas do Sul', 'Córrego do Ouro', 'Corumbá de Goiás', 'Corumbaíba',
      'Cristalina', 'Cristianópolis', 'Crixás', 'Cromínia', 'Cumari', 'Damianópolis', 'Damolândia', 'Davinópolis', 'Diorama', 'Divinópolis de Goiás',
      'Doverlândia', 'Edealina', 'Edéia', 'Estrela do Norte', 'Faina', 'Fazenda Nova', 'Firminópolis', 'Flores de Goiás', 'Formosa', 'Formoso',
      'Gameleira de Goiás', 'Goianápolis', 'Goiandira', 'Goianésia', 'Goiânia', 'Goianira', 'Goiás', 'Goiatuba', 'Gouvelândia', 'Guapó'

    ]
  },
  {
    sigla: 'MA',
    nome: 'Maranhão',
    cidades: [
      'Açailândia', 'Afonso Cunha', 'Água Doce do Maranhão', 'Alcântara', 'Aldeias Altas', 'Altamira do Maranhão', 'Alto Alegre do Maranhão', 'Alto Alegre do Pindaré', 'Alto Parnaíba', 'Amapá do Maranhão',
      'Amarante do Maranhão', 'Anajatuba', 'Anapurus', 'Apicum-Açu', 'Araguanã', 'Araioses', 'Arame', 'Arari', 'Axixá', 'Bacabal',
      'Bacabeira', 'Bacuri', 'Bacurituba', 'Balsas', 'Barão de Grajaú', 'Barra do Corda', 'Barreirinhas', 'Bela Vista do Maranhão', 'Belágua', 'Benedito Leite',
      'Bequimão', 'Bernardo do Mearim', 'Boa Vista do Gurupi', 'Bom Jardim', 'Bom Jesus das Selvas', 'Bom Lugar', 'Brejo', 'Brejo de Areia', 'Buriti', 'Buriti Bravo',
      'Buriticupu', 'Buritirana', 'Cachoeira Grande', 'Cajapió', 'Cajari', 'Campestre do Maranhão', 'Cândido Mendes', 'Cantanhede', 'Capinzal do Norte', 'Carolina',
      'Carutapera', 'Caxias', 'Cedral', 'Central do Maranhão', 'Centro do Guilherme', 'Centro Novo do Maranhão', 'Chapadinha', 'Cidelândia', 'Codó', 'Coelho Neto',
      'Colinas', 'Conceição do Lago-Açu', 'Coroatá', 'Cururupu', 'Davinópolis', 'Dom Pedro', 'Duque Bacelar', 'Esperantinópolis', 'Estreito', 'Feira Nova do Maranhão',
      'Fernando Falcão', 'Formosa da Serra Negra', 'Fortaleza dos Nogueiras', 'Fortuna', 'Godofredo Viana', 'Gonçalves Dias', 'Governador Archer', 'Governador Edison Lobão', 'Governador Eugênio Barros', 'Governador Luiz Rocha',
      'Governador Newton Bello', 'Governador Nunes Freire', 'Graça Aranha', 'Grajaú', 'Guimarães', 'Humberto de Campos', 'Icatu', 'Igarapé do Meio', 'Igarapé Grande', 'Imperatriz',

    ]
  },
  {
    sigla: 'MT',
    nome: 'Mato Grosso',
    cidades: [
      'Acorizal', 'Água Boa', 'Alta Floresta', 'Alto Araguaia', 'Alto Boa Vista', 'Alto Garças', 'Alto Paraguai', 'Alto Taquari', 'Apiacás', 'Araguaiana',
      'Araguainha', 'Araputanga', 'Arenápolis', 'Aripuanã', 'Barão de Melgaço', 'Barra do Bugres', 'Barra do Garças', 'Bom Jesus do Araguaia', 'Brasnorte', 'Cáceres',
      'Campinápolis', 'Campo Novo do Parecis', 'Campo Verde', 'Campos de Júlio', 'Canabrava do Norte', 'Canarana', 'Carlinda', 'Castanheira', 'Chapada dos Guimarães', 'Cláudia',
      'Cocalinho', 'Colíder', 'Colniza', 'Comodoro', 'Confresa', 'Conquista d’Oeste', 'Cotriguaçu', 'Cuiabá', 'Curvelândia', 'Curvelândia',
      'Denise', 'Diamantino', 'Dom Aquino', 'Feliz Natal', 'Figueirópolis D’Oeste', 'Gaúcha do Norte', 'General Carneiro', 'Glória d’Oeste', 'Guarantã do Norte', 'Guiratinga',
      'Indiavaí', 'Ipiranga do Norte', 'Itanhangá', 'Itaúba', 'Itiquira', 'Jaciara', 'Jangada', 'Jauru', 'Juara', 'Juína',
      'Juruena', 'Juscimeira', 'Lambari d’Oeste', 'Lucas do Rio Verde', 'Luciára', 'Vila Bela da Santíssima Trindade', 'Marcelândia', 'Matupá', 'Mirassol d’Oeste', 'Nobres',
      'Nortelândia', 'Nossa Senhora do Livramento', 'Nova Bandeirantes', 'Nova Brasilândia', 'Nova Canaã do Norte', 'Nova Guarita', 'Nova Lacerda', 'Nova Marilândia', 'Nova Maringá', 'Nova Monte Verde',
      'Nova Mutum', 'Nova Nazaré', 'Nova Olímpia', 'Nova Santa Helena', 'Nova Ubiratã', 'Nova Xavantina', 'Novo Horizonte do Norte', 'Novo Mundo', 'Novo Santo Antônio', 'Novo São Joaquim',
      'Paranaíta', 'Paranatinga', 'Pedra Preta', 'Peixoto de Azevedo', 'Planalto da Serra', 'Poconé', 'Pontal do Araguaia', 'Ponte Branca', 'Pontes e Lacerda', 'Porto Alegre do Norte',
      'Porto dos Gaúchos', 'Porto Esperidião', 'Porto Estrela', 'Poxoréo', 'Primavera do Leste', 'Querência', 'Rancho Alegre', 'Ribeirão Cascalheira', 'Ribeirãozinho', 'Rio Branco',
      'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro',
      'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro',
    ]
  },
  {
    sigla: 'MS',
    nome: 'Mato Grosso do Sul',
    cidades: [
      'Água Clara', 'Alcinópolis', 'Amambai', 'Anastácio', 'Anaurilândia', 'Angélica', 'Antônio João', 'Aparecida do Taboado', 'Aquidauana', 'Aral Moreira',
      'Bandeirantes', 'Bataguassu', 'Batayporã', 'Bela Vista', 'Bodoquena', 'Bonito', 'Brasilândia', 'Caarapó', 'Camapuã', 'Campo Grande',
      'Caracol', 'Cassilândia', 'Chapadão do Sul', 'Corguinho', 'Coronel Sapucaia', 'Corumbá', 'Costa Rica', 'Coxim', 'Deodápolis', 'Dois Irmãos do Buriti',
      'Douradina', 'Dourados', 'Eldorado', 'Fátima do Sul', 'Figueirão', 'Glória de Dourados', 'Guia Lopes da Laguna', 'Iguatemi', 'Inocência', 'Itaporã',
      'Itaquiraí', 'Ivinhema', 'Japorã', 'Jaraguari', 'Jardim', 'Jateí', 'Juti', 'Ladário', 'Laguna Carapã', 'Maracaju',
      'Miranda', 'Mundo Novo', 'Naviraí', 'Nioaque', 'Nova Alvorada do Sul', 'Nova Andradina', 'Novo Horizonte do Sul', 'Paranaíba', 'Paranhos', 'Pedro Gomes',
      'Ponta Porã', 'Porto Murtinho', 'Ribas do Rio Pardo', 'Rio Brilhante', 'Rio Negro', 'Rio Verde de Mato Grosso', 'Rochedo', 'Santa Rita do Pardo', 'São Gabriel do Oeste', 'Selvíria',
      'Sete Quedas', 'Sidrolândia', 'Sonora', 'Tacuru', 'Taquarussu', 'Terenos', 'Três Lagoas', 'Vicentina'


    ]
  },
  {
    sigla: 'MG',
    nome: 'Minas Gerais',
    cidades: [
      'Abadia dos Dourados', 'Abaeté', 'Abre Campo', 'Acaiaca', 'Açucena', 'Água Boa', 'Água Comprida', 'Aguanil', 'Águas Formosas', 'Águas Vermelhas',
      'Aimorés', 'Aiuruoca', 'Alagoa', 'Albertina', 'Além Paraíba', 'Alfenas', 'Alfredo Vasconcelos', 'Almenara', 'Alpercata', 'Alpinópolis',
      'Alterosa', 'Alto Caparaó', 'Alto Jequitibá', 'Alto Rio Doce', 'Alvarenga', 'Alvinópolis', 'Alvorada de Minas', 'Amparo do Serra', 'Andradas', 'Andrelândia',
      'Angelândia', 'Antônio Carlos', 'Antônio Dias', 'Antônio Prado de Minas', 'Araçaí', 'Aracitaba', 'Araçuaí', 'Araguari', 'Arantina', 'Araponga',
      'Araporã', 'Arapuá', 'Araújos', 'Araxá', 'Arceburgo', 'Arcos', 'Areado', 'Argirita', 'Aricanduva', 'Arinos',
      'Astolfo Dutra', 'Ataléia', 'Augusto de Lima', 'Baependi', 'Baldim', 'Bambuí', 'Bandeira', 'Bandeira do Sul', 'Barão de Cocais', 'Barão de Monte Alto',
      'Barbacena', 'Barra Longa', 'Barroso', 'Bela Vista de Minas', 'Belmiro Braga', 'Belo Horizonte', 'Belo Oriente', 'Belo Vale', 'Berilo', 'Berizal',

    ]
  },
  {
    sigla: 'PA',
    nome: 'Pará',
    cidades: [
      'Belém', 'Ananindeua', 'Santarém', 'Castanhal', 'Marabá',
      'Parauapebas', 'Abaetetuba', 'Cametá', 'Bragança', 'Marituba'
    ]
  },
  {
    sigla: 'PB',
    nome: 'Paraíba',
    cidades: [
      'João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux',
      'Sousa', 'Cajazeiras', 'Guarabira', 'Pombal', 'Mamanguape'
    ]
  },
  {
    sigla: 'PR',
    nome: 'Paraná',
    cidades: [
      'Abatiá', 'Adrianópolis', 'Agudos do Sul', 'Almirante Tamandaré', 'Altamira do Paraná', 'Alto Paraíso', 'Alto Paraná', 'Alto Piquiri', 'Altônia', 'Alvorada do Sul',
      'Amaporã', 'Ampére', 'Anahy', 'Andirá', 'Ângulo', 'Antonina', 'Antônio Olinto', 'Apucarana', 'Arapongas', 'Arapoti',
      'Arapuã', 'Araruna', 'Araucária', 'Ariranha do Ivaí', 'Assaí', 'Assis Chateaubriand', 'Astorga', 'Atalaia', 'Balsa Nova', 'Bandeirantes',
      'Barbosa Ferraz', 'Barra do Jacaré', 'Barracão', 'Bela Vista da Caroba', 'Bela Vista do Paraíso', 'Bituruna', 'Boa Esperança', 'Boa Esperança do Iguaçu', 'Boa Ventura de São Roque', 'Boa Vista da Aparecida',
      'Boa Vista do Iguaçu', 'Boqueirão', 'Borrazópolis', 'Braganey', 'Brasilândia do Sul', 'Cafeara', 'Cafelândia', 'Cafezal do Sul', 'Califórnia', 'Cambará',
      'Cambé', 'Cambira', 'Campina da Lagoa', 'Campina do Simão', 'Campina Grande do Sul', 'Campo Bonito', 'Campo do Tenente', 'Campo Largo', 'Campo Magro', 'Campo Mourão',
      'Cândido de Abreu', 'Candói', 'Cantagalo', 'Capanema', 'Capitão Leônidas Marques', 'Carambeí', 'Carlópolis', 'Cascavel', 'Castro', 'Catanduvas',
      'Centenário do Sul', 'Cerro Azul', 'Céu Azul', 'Chopinzinho', 'Cianorte', 'Cidade Gaúcha', 'Clevelândia', 'Colombo', 'Colorado', 'Congonhinhas',
      'Conselheiro Mairinck', 'Contenda', 'Corbélia', 'Cornélio Procópio', 'Coronel Domingos Soares', 'Coronel Vivida', 'Corumbataí do Sul', 'Cruz Machado', 'Cruzeiro do Iguaçu', 'Cruzeiro do Oeste',
      'Cruzeiro do Sul', 'Cruzmaltina', 'Curitiba', 'Curiúva', 'Diamante do Norte', 'Diamante do Sul', 'Diamante D’Oeste', 'Dois Vizinhos', 'Douradina', 'Doutor Camargo',
      'Enéas Marques', 'Engenheiro Beltrão', 'Entre Rios do Oeste', 'Esperança Nova', 'Espigão Alto do Iguaçu', 'Farol', 'Faxinal', 'Fazenda Rio Grande', 'Fênix', 'Fernandes Pinheiro',
      'Figueira', 'Floraí', 'Floresta', 'Florestópolis', 'Flórida', 'Formosa do Oeste', 'Foz do Iguaçu', 'Foz do Jordão', 'Francisco Alves', 'Francisco Beltrão',

    ]
  },
  {
    sigla: 'PE',
    nome: 'Pernambuco',
    cidades: [
      'Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina',
      'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'
    ]
  },
  {
    sigla: 'PI',
    nome: 'Piauí',
    cidades: [
      'Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano',
      'Barras', 'União', 'Altos', 'Esperantina', 'Pedro II'
    ]
  },
  {
    sigla: 'RJ',
    nome: 'Rio de Janeiro',
    cidades: [
      'Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói',
      'Belford Roxo', 'São João de Meriti', 'Petrópolis', 'Campos dos Goytacazes', 'Volta Redonda'
    ]
  },
  {
    sigla: 'RN',
    nome: 'Rio Grande do Norte',
    cidades: [
      'Natal', 'Mossoró', 'Parnamirim', 'Ceará-Mirim', 'Caicó',
      'São Gonçalo do Amarante', 'Canguaretama', 'Currais Novos', 'Santa Cruz', 'Apodi'
    ]
  },
  {
    sigla: 'RS',
    nome: 'Rio Grande do Sul',
    cidades: [
      'Aceguá', 'Água Santa', 'Agudo', 'Ajuricaba', 'Alecrim', 'Alegrete', 'Alegria', 'Almirante Tamandaré do Sul', 'Alpestre', 'Alto Alegre',
      'Alto Feliz', 'Alvorada', 'Amaral Ferrador', 'Ametista do Sul', 'André da Rocha', 'Anta Gorda', 'Antônio Prado', 'Arambaré', 'Araricá', 'Aratiba',
      'Arroio do Meio', 'Arroio do Padre', 'Arroio do Sal', 'Arroio do Tigre', 'Arroio dos Ratos', 'Arroio Grande', 'Arvorezinha', 'Augusto Pestana', 'Áurea', 'Bagé',
      'Balneário Pinhal', 'Barão', 'Barão de Cotegipe', 'Barão do Triunfo', 'Barracão', 'Barra do Guarita', 'Barra do Quaraí', 'Barra do Ribeiro', 'Barra do Rio Azul', 'Barra Funda',
      'Benjamin Constant do Sul', 'Bento Gonçalves', 'Boa Vista das Missões', 'Boa Vista do Buricá', 'Boa Vista do Cadeado', 'Boa Vista do Incra', 'Boa Vista do Sul', 'Bom Jesus', 'Bom Princípio',
      'Bom Progresso', 'Bom Retiro do Sul', 'Boqueirão do Leão', 'Bossoroca', 'Bozano', 'Braga', 'Brochier', 'Butiá', 'Caçapava do Sul', 'Cacequi',
      'Cachoeira do Sul', 'Cachoeirinha', 'Cacique Doble', 'Caibaté', 'Caiçara', 'Camaquã', 'Camargo', 'Cambará do Sul', 'Campestre da Serra', 'Campina das Missões',
      'Campinas do Sul', 'Campo Bom', 'Campo Novo', 'Campos Borges', 'Candelária', 'Cândido Godói', 'Candiota', 'Canela', 'Canguçu', 'Canoas',
      'Canudos do Vale', 'Capão Bonito do Sul', 'Capão da Canoa', 'Capão do Cipó', 'Capão do Leão', 'Capela de Santana', 'Capitão', 'Carazinho', 'Caraá', 'Carlos Barbosa',
      'Carlos Gomes', 'Casca', 'Caseiros', 'Catuípe', 'Caxias do Sul', 'Centenário', 'Cerrito', 'Cerro Branco', 'Cerro Grande', 'Cerro Grande do Sul',
      'Cerro Largo', 'Chapada', 'Charqueadas', 'Charrua', 'Chiapetta', 'Chuí', 'Chuvisca', 'Cidreira', 'Ciríaco', 'Colinas',
      'Colorado', 'Condor', 'Constantina', 'Coqueiro Baixo', 'Coqueiros do Sul', 'Coronel Barros', 'Coronel Bicaco', 'Coronel Pilar', 'Cotiporã', 'Coxilha',
      'Crissiumal', 'Cristal', 'Cristal do Sul', 'Cruz Alta', 'Cruzaltense', 'Cruzeiro do Sul', 'David Canabarro', 'Derrubadas', 'Dezesseis de Novembro', 'Dilermando de Aguiar',
      'Dois Irmãos', 'Dois Irmãos das Missões', 'Dois Lajeados', 'Dom Feliciano', 'Dom Pedrito', 'Dom Pedro de Alcântara', 'Domingos Martins', 'Dona Francisca', 'Doutor Maurício Cardoso', 'Doutor Ricardo',
      'Eldorado do Sul', 'Encantado', 'Encruzilhada do Sul', 'Engenho Velho', 'Entre Rios do Sul', 'Entre-Ijuís', 'Erebango', 'Erechim', 'Ernestina', 'Erval Grande',
      'Erval Seco', 'Esmeralda', 'Esperança do Sul', 'Espumoso', 'Estação', 'Estância Velha', 'Esteio', 'Estrela', 'Estrela Velha', 'Eugênio de Castro',
      'Fagundes Varela', 'Farroupilha', 'Faxinal do Soturno', 'Faxinalzinho', 'Fazenda Vilanova', 'Feliz', 'Flores da Cunha', 'Floriano Peixoto', 'Fontoura Xavier', 'Formigueiro',
      'Forquetinha', 'Fortaleza dos Valos', 'Frederico Westphalen', 'Garibaldi', 'Garruchos', 'Gaurama', 'General Câmara', 'Gentil', 'Getúlio Vargas', 'Giruá',
      'Glorinha', 'Gramado', 'Gramado dos Loureiros', 'Gramado Xavier', 'Gravataí', 'Guabiju', 'Guaíba', 'Guaporé', 'Guarani das Missões', 'Harmonia',
      'Herval', 'Herveiras', 'Horizontina', 'Hulha Negra', 'Humaitá', 'Ibarama', 'Ibiaçá', 'Ibiraiaras', 'Ibirapuitã', 'Ibirubá',
      'Igrejinha', 'Ijuí', 'Ilópolis', 'Imbé', 'Imigrante', 'Independência', 'Inhacorá', 'Ipê', 'Ipiranga do Sul', 'Iraí',
      'Itaara', 'Itacurubi', 'Itapuca', 'Itaqui', 'Itati', 'Itatiba do Sul', 'Ivorá', 'Ivoti', 'Jaboticaba', 'Jacuizinho',
      'Jacutinga', 'Jaguarão', 'Jaguari', 'Jaquirana', 'Jari', 'Jóia', 'Júlio de Castilhos', 'Lagoa Bonita do Sul', 'Lagoa dos Três Cantos', 'Lagoa Vermelha',
      'Lagoão', 'Lajeado', 'Lajeado do Bugre', 'Lavras do Sul', 'Liberato Salzano', 'Lindolfo Collor', 'Linha Nova', 'Maçambara', 'Machadinho', 'Mampituba',
      'Manoel Viana', 'Maquiné', 'Maratá', 'Marau', 'Marcelino Ramos', 'Mariana Pimentel', 'Mariano Moro', 'Marques de Souza', 'Mata', 'Mato Castelhano',
      'Mato Leitão', 'Mato Queimado', 'Maximiliano de Almeida', 'Minas do Leão', 'Miraguaí', 'Montauri', 'Monte Alegre dos Campos', 'Monte Belo do Sul', 'Montenegro', 'Mormaço',
      'Morrinhos do Sul', 'Morro Redondo', 'Morro Reuter', 'Mostardas', 'Muçum', 'Muitos Capões', 'Muliterno', 'Não-Me-Toque', 'Nicolau Vergueiro', 'Nonoai',
      'Nova Alvorada', 'Nova Araçá', 'Nova Bassano', 'Nova Boa Vista', 'Nova Bréscia', 'Nova Candelária', 'Nova Esperança do Sul', 'Nova Hartz', 'Nova Pádua', 'Nova Palma',
      'Nova Petrópolis', 'Nova Prata', 'Nova Ramada', 'Nova Roma do Sul', 'Nova Santa Rita', 'Novo Barreiro', 'Novo Cabrais', 'Novo Hamburgo', 'Novo Machado', 'Novo Tiradentes',
      'Novo Xingu', 'Osório', 'Paim Filho', 'Palmares do Sul', 'Palmeira das Missões', 'Palmitinho', 'Panambi', 'Pantano Grande', 'Paraí', 'Paraíso do Sul',
      'Pareci Novo', 'Parobé', 'Passa Sete', 'Passo do Sobrado', 'Passo Fundo', 'Paulo Bento', 'Paverama', 'Pedras Altas', 'Pedro Osório', 'Pejuçara',
      'Pelotas', 'Picada Café', 'Pinhal', 'Pinhal da Serra', 'Pinhal Grande', 'Pinheirinho do Vale', 'Pinheiro Machado', 'Pirapó', 'Piratini', 'Planalto',
      'Poço das Antas', 'Pontão', 'Ponte Preta', 'Portão', 'Porto Alegre', 'Porto Lucena', 'Porto Mauá', 'Porto Vera Cruz', 'Porto Xavier', 'Pouso Novo',
      'Presidente Lucena', 'Progresso', 'Protásio Alves', 'Putinga', 'Quaraí', 'Quatro Irmãos', 'Quevedos', 'Quinze de Novembro', 'Redentora', 'Relvado',
      'Restinga Seca', 'Rio dos Índios', 'Rio Grande', 'Rio Pardo', 'Riozinho', 'Roca Sales', 'Rodeio Bonito', 'Rolador', 'Rolante', 'Ronda Alta',
      'Rondinha', 'Roque Gonzales', 'Rosário do Sul', 'Sagrada Família', 'Saldanha Marinho', 'Salto do Jacuí', 'Salvador das Missões', 'Salvador do Sul', 'Sananduva', 'Santa Bárbara do Sul',
      'Santa Cecília do Sul', 'Santa Clara do Sul', 'Santa Cruz do Sul', 'Santa Margarida do Sul', 'Santa Maria', 'Santa Maria do Herval', 'Santa Rosa', 'Santa Tereza', 'Santa Vitória do Palmar', 'Santana da Boa Vista',
      'Santana do Livramento', 'Santiago', 'Santo Ângelo', 'Santo Antônio da Patrulha', 'Santo Antônio das Missões', 'Santo Antônio do Palma', 'Santo Antônio do Planalto', 'Santo Augusto', 'Santo Cristo', 'Santo Expedito do Sul',
      'São Borja', 'São Domingos do Sul', 'São Francisco de Assis', 'São Francisco de Paula', 'São Gabriel', 'São Jerônimo', 'São João da Urtiga', 'São João do Polêsine', 'São Jorge', 'São José das Missões',
      'São José do Herval', 'São José do Hortêncio', 'São José do Inhacorá', 'São José do Norte', 'São José do Ouro', 'São José do Sul', 'São José dos Ausentes', 'São Leopoldo', 'São Lourenço do Sul', 'São Luiz Gonzaga',
      'São Marcos', 'São Martinho', 'São Martinho da Serra', 'São Miguel das Missões', 'São Nicolau', 'São Paulo das Missões', 'São Pedro da Serra', 'São Pedro das Missões', 'São Pedro do Butiá', 'São Pedro do Sul',
      'São Sebastião do Caí', 'São Sepé', 'São Valentim', 'São Valentim do Sul', 'São Valério do Sul', 'São Vendelino', 'São Vicente do Sul', 'Sapiranga', 'Sapucaia do Sul', 'Sarandi',
      'Seberi', 'Sede Nova', 'Segredo', 'Selbach', 'Senador Salgado Filho', 'Sentinela do Sul', 'Serafina Corrêa', 'Sério', 'Sertão', 'Sertão Santana',
      'Sete de Setembro', 'Severiano de Almeida', 'Silveira Martins', 'Sinimbu', 'Sobradinho', 'Soledade', 'Tabaí', 'Tapejara', 'Tapera', 'Tapes',
      'Taquara', 'Taquari', 'Taquaruçu do Sul', 'Tavares', 'Tenente Portela', 'Terra de Areia', 'Teutônia', 'Tio Hugo', 'Tiradentes do Sul', 'Toropi',
      'Torres', 'Tramandaí', 'Travesseiro', 'Três Arroios', 'Três Cachoeiras', 'Três Coroas', 'Três de Maio', 'Três Forquilhas', 'Três Palmeiras', 'Três Passos',
      'Trindade do Sul', 'Triunfo', 'Tucunduva', 'Tunas', 'Tupanci do Sul', 'Tupanciretã', 'Tupandi', 'Tuparendi', 'Turuçu', 'Ubiretama',
      'União da Serra', 'Unistalda', 'Uruguaiana', 'Vacaria', 'Vale do Sol', 'Vale Real', 'Vale Verde', 'Vanini', 'Venâncio Aires', 'Vera Cruz',
      'Veranópolis', 'Vespasiano Correa', 'Viadutos', 'Viamão', 'Vicente Dutra', 'Victor Graeff', 'Vila Flores', 'Vila Lângaro', 'Vila Maria', 'Vila Nova do Sul',
      'Vista Alegre', 'Vista Alegre do Prata', 'Vista Gaúcha', 'Vitória das Missões', 'Westfália', 'Xangri-lá'

    ]
  },
  {
    sigla: 'RO',
    nome: 'Rondônia',
    cidades: [
      'Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal',
      'Pimenta Bueno', 'Jaru', 'Guajará-Mirim', 'Ouro Preto do Oeste', 'Rolim de Moura'
    ]
  },
  {
    sigla: 'RR',
    nome: 'Roraima',
    cidades: [
      'Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí',
      'Cantá', 'Normandia', 'Uiramutã', 'Iracema', 'São João da Baliza'
    ]
  },
  {
    sigla: 'SC',
    nome: 'Santa Catarina',
    cidades: [
      'Abdon Batista', 'Abelardo Luz', 'Agrolândia', 'Agronômica', 'Água Doce', 'Águas de Chapecó', 'Águas Frias', 'Águas Mornas', 'Alfredo Wagner', 'Alto Bela Vista',
      'Anchieta', 'Angelina', 'Anita Garibaldi', 'Anitápolis', 'Antônio Carlos', 'Apiúna', 'Arabutã', 'Araquari', 'Araranguá', 'Armazém',
      'Arroio Trinta', 'Arvoredo', 'Ascurra', 'Atalanta', 'Aurora', 'Balneário Arroio do Silva', 'Balneário Barra do Sul', 'Balneário Camboriú', 'Balneário Gaivota', 'Bandeirante',
      'Barra Bonita', 'Barra Velha', 'Bela Vista do Toldo', 'Belmonte', 'Benedito Novo', 'Biguaçu', 'Blumenau', 'Bocaina do Sul', 'Bom Jardim da Serra', 'Bom Jesus',
      'Bom Jesus do Oeste', 'Bom Retiro', 'Botuverá', 'Braço do Norte', 'Braço do Trombudo', 'Brunópolis', 'Brusque', 'Caçador', 'Caibi', 'Calmon',
      'Camboriú', 'Campo Alegre', 'Campo Belo do Sul', 'Campo Erê', 'Campos Novos', 'Canelinha', 'Canoinhas', 'Capão Alto', 'Capinzal', 'Capivari de Baixo',
      'Catanduvas', 'Caxambu do Sul', 'Celso Ramos', 'Cerro Negro', 'Chapadão do Lageado', 'Chapecó', 'Cocal do Sul', 'Concórdia', 'Cordilheira Alta', 'Coronel Freitas',
      'Coronel Martins', 'Correia Pinto', 'Corupá', 'Criciúma', 'Cunha Porã', 'Cunhataí', 'Curitibanos', 'Descanso', 'Dionísio Cerqueira', 'Dona Emma',
      'Doutor Pedrinho', 'Entre Rios', 'Ermo', 'Erval Velho', 'Faxinal dos Guedes', 'Flor do Sertão', 'Florianópolis', 'Formosa do Sul', 'Forquilhinha', 'Fraiburgo',
      'Frei Rogério', 'Galvão', 'Garopaba', 'Garuva', 'Gaspar', 'Governador Celso Ramos', 'Grão Pará', 'Gravatal', 'Guabiruba', 'Guaraciaba',
      'Guaramirim', 'Guarujá do Sul', 'Guatambú', 'Herval d´Oeste', 'Ibiam', 'Ibicaré', 'Ibirama', 'Içara', 'Ilhota', 'Imaruí',
      'Imbituba', 'Imbuia', 'Indaial', 'Iomerê', 'Ipira', 'Iporã do Oeste', 'Ipuaçu', 'Ipumirim', 'Iraceminha', 'Irani',
      'Iraí de Minas', 'Irati', 'Irineópolis', 'Itá', 'Itaiópolis', 'Itajaí', 'Itapema', 'Itapiranga', 'Itapoá', 'Ituporanga',
      'Jaborá', 'Jacinto Machado', 'Jaguaruna', 'Jaraguá do Sul', 'Jardinópolis', 'Joaçaba', 'Joinville', 'José Boiteux', 'Jupiá', 'Lacerdópolis',
      'Lages', 'Laguna', 'Lajeado Grande', 'Laurentino', 'Lauro Müller', 'Lebon Régis', 'Leoberto Leal', 'Lindóia do Sul', 'Lontras', 'Luiz Alves',
      'Luzerna', 'Macieira', 'Mafra', 'Major Gercino', 'Major Vieira', 'Maracajá', 'Maravilha', 'Marema', 'Massaranduba', 'Matos Costa',
      'Meleiro', 'Mirim Doce', 'Modelo', 'Mondaí', 'Monte Carlo', 'Monte Castelo', 'Morro da Fumaça', 'Morro Grande', 'Navegantes', 'Nova Erechim',
      'Nova Itaberaba', 'Nova Trento', 'Nova Veneza', 'Novo Horizonte', 'Orleans', 'Otacílio Costa', 'Ouro', 'Ouro Verde', 'Paial', 'Painel',
      'Palhoça', 'Palma Sola', 'Palmeira', 'Palmitos', 'Papanduva', 'Paraíso', 'Passo de Torres', 'Passos Maia', 'Paulo Lopes', 'Pedras Grandes',
      'Penha', 'Peritiba', 'Petrolândia', 'Piçarras', 'Pinhalzinho', 'Pinheiro Preto', 'Piratuba', 'Planalto Alegre', 'Pomerode', 'Ponte Alta',
      'Ponte Alta do Norte', 'Ponte Serrada', 'Porto Belo', 'Porto União', 'Pouso Redondo', 'Praia Grande', 'Presidente Castelo Branco', 'Presidente Getúlio', 'Presidente Nereu', 'Princesa',
      'Quilombo', 'Rancho Queimado', 'Rio das Antas', 'Rio do Campo', 'Rio do Oeste', 'Rio do Sul', 'Rio dos Cedros', 'Rio Fortuna', 'Rio Negrinho', 'Rio Rufino',
      'Riqueza', 'Rodeio', 'Romelândia', 'Salete', 'Saltinho', 'Salto Veloso', 'Sangão', 'Santa Cecília', 'Santa Helena', 'Santa Rosa de Lima',
      'Santa Rosa do Sul', 'Santa Terezinha', 'Santa Terezinha do Progresso', 'Santiago do Sul', 'Santo Amaro da Imperatriz', 'São Bento do Sul', 'São Bernardino', 'São Bonifácio', 'São Carlos', 'São Cristovão do Sul',
      'São Domingos', 'São Francisco do Sul', 'São João Batista', 'São João do Itaperiú', 'São João do Oeste', 'São João do Sul', 'São Joaquim', 'São José', 'São José do Cedro', 'São José do Cerrito',
      'São Lourenço do Oeste', 'São Ludgero', 'São Martinho', 'São Miguel da Boa Vista', 'São Miguel do Oeste', 'São Pedro de Alcântara', 'Saudades', 'Schroeder', 'Seara', 'Serra Alta',
      'Siderópolis', 'Sombrio', 'Sul Brasil', 'Taió', 'Tangará', 'Tigrinhos', 'Tijucas', 'Timbé do Sul', 'Timbó', 'Timbó Grande',
      'Tres Barras', 'Treviso', 'Treze de Maio', 'Treze Tílias', 'Trombudo Central', 'Tubarão', 'Tunápolis', 'Turvo', 'União do Oeste', 'Urubici',
      'Urupema', 'Urussanga', 'Vargeão', 'Vargem', 'Vargem Bonita', 'Vidal Ramos', 'Videira', 'Vitor Meireles', 'Witmarsum', 'Xanxerê',
      'Xavantina', 'Xaxim', 'Zortéa'

    ]
  },
  {
    sigla: 'SP',
    nome: 'São Paulo',
    cidades: [
      'Adamantina', 'Adolfo', 'Aguaí', 'Águas da Prata', 'Águas de Lindóia', 'Águas de Santa Bárbara', 'Águas de São Pedro', 'Agudos', 'Alambari', 'Alfredo Marcondes',
      'Altair', 'Altinópolis', 'Alto Alegre', 'Alumínio', 'Álvares Florence', 'Álvares Machado', 'Álvaro de Carvalho', 'Alvinlândia', 'Americana', 'Américo Brasiliense',
      'Américo de Campos', 'Amparo', 'Analândia', 'Andradina', 'Angatuba', 'Anhembi', 'Anhumas', 'Aparecida', 'Aparecida d’Oeste', 'Apiaí',
      'Araçariguama', 'Araçatuba', 'Araçoiaba da Serra', 'Aramina', 'Arandu', 'Arapeí', 'Araraquara', 'Araras', 'Arco-Íris', 'Arealva',
      'Areias', 'Areiópolis', 'Ariranha', 'Artur Nogueira', 'Arujá', 'Aspásia', 'Assis', 'Atibaia', 'Auriflama', 'Avaí',
      'Avanhandava', 'Avaré', 'Bady Bassitt', 'Balbinos', 'Bálsamo', 'Bananal', 'Barão de Antonina', 'Barbosa', 'Bariri', 'Barra Bonita',
      'Barra do Chapéu', 'Barra do Turvo', 'Barretos', 'Barrinha', 'Barueri', 'Bastos', 'Batatais', 'Bauru', 'Bebedouro', 'Bento de Abreu',
      'Bernardino de Campos', 'Bertioga', 'Bilac', 'Birigui', 'Biritiba-Mirim', 'Boa Esperança do Sul', 'Bocaina', 'Bofete', 'Boituva', 'Bom Jesus dos Perdões',
      'Bom Sucesso de Itararé', 'Borá', 'Boracéia', 'Borborema', 'Borebi', 'Botucatu', 'Bragança Paulista', 'Braúna', 'Brejo Alegre', 'Brodowski',
      'Brotas', 'Buri', 'Buritama', 'Buritizal', 'Cabrália Paulista', 'Cabreúva', 'Caçapava', 'Cachoeira Paulista', 'Caconde', 'Cafelândia',
      'Caiabu', 'Caieiras', 'Caiuá', 'Cajamar', 'Cajati', 'Cajobi', 'Cajuru', 'Campina do Monte Alegre', 'Campinas', 'Campo Limpo Paulista', 'Campos do Jordão',
      'Campos Novos Paulista', 'Cananéia', 'Canas', 'Cândido Mota', 'Cândido Rodrigues', 'Canitar', 'Capão Bonito', 'Capela do Alto', 'Capivari', 'Caraguatatuba',
      'Carapicuíba', 'Cardoso', 'Casa Branca', 'Cássia dos Coqueiros', 'Castilho', 'Catanduva', 'Catiguá', 'Cedral', 'Cerqueira César', 'Cerquilho',
      'Cesário Lange', 'Charqueada', 'Chavantes', 'Clementina', 'Colina', 'Colômbia', 'Conchal', 'Conchas', 'Cordeirópolis', 'Coroados',
      'Coronel Macedo', 'Corumbataí', 'Cosmópolis', 'Cosmorama', 'Cotia', 'Cravinhos', 'Cristais Paulista', 'Cruzália', 'Cruzeiro', 'Cubatão',
      'Cunha', 'Descalvado', 'Diadema', 'Dirce Reis', 'Divinolândia', 'Dobrada', 'Dois Córregos', 'Dolcinópolis', 'Dourado', 'Dracena',

    ]
  },
  {
    sigla: 'SE',
    nome: 'Sergipe',
    cidades: [
      'Amparo de São Francisco', 'Aquidabã', 'Aracaju', 'Arauá', 'Areia Branca', 'Barra dos Coqueiros', 'Boquim', 'Brejo Grande', 'Campo do Brito', 'Canhoba',
      'Canindé de São Francisco', 'Capela', 'Carira', 'Carmópolis', 'Cedro de São João', 'Cristinápolis', 'Cumbe', 'Divina Pastora', 'Estância', 'Feira Nova',
      'Frei Paulo', 'Gararu', 'General Maynard', 'Graccho Cardoso', 'Ilha das Flores', 'Indiaroba', 'Itabaiana', 'Itabaianinha', 'Itabi', 'Itaporanga d’Ajuda',
      'Japaratuba', 'Japoatã', 'Lagarto', 'Laranjeiras', 'Macambira', 'Malhada dos Bois', 'Malhador', 'Maruim', 'Moita Bonita', 'Monte Alegre de Sergipe',
      'Muribeca', 'Neópolis', 'Nossa Senhora Aparecida', 'Nossa Senhora da Glória', 'Nossa Senhora das Dores', 'Nossa Senhora de Lourdes', 'Nossa Senhora do Socorro', 'Pacatuba', 'Pedra Mole', 'Pedrinhas',
      'Pirambu', 'Poço Redondo', 'Poço Verde', 'Porto da Folha', 'Propriá', 'Riachão do Dantas', 'Riachuelo', 'Ribeirópolis', 'Rosário do Catete', 'Salgado',
      'Santa Luzia do Itanhy', 'Santa Rosa de Lima', 'Santana do São Francisco', 'Santo Amaro das Brotas', 'São Cristóvão', 'São Domingos', 'São Francisco', 'São Miguel do Aleixo', 'Simão Dias', 'Siriri',
      'Telha', 'Tobias Barreto', 'Tomar do Geru', 'Umbaúba'

    ]
  },
  {
    sigla: 'TO',
    nome: 'Tocantins',
    cidades: [
      'Abreulândia', 'Aguiarnópolis', 'Aliança do Tocantins', 'Almas', 'Alvorada', 'Ananás', 'Angico', 'Aparecida do Rio Negro', 'Aragominas', 'Araguacema',
      'Araguaçu', 'Araguaína', 'Araguanã', 'Araguatins', 'Arapoema', 'Arraias', 'Augustinópolis', 'Aurora do Tocantins', 'Axixá do Tocantins', 'Babaçulândia',
      'Bandeirantes do Tocantins', 'Barra do Ouro', 'Barrolândia', 'Bernardo Sayão', 'Bom Jesus do Tocantins', 'Brasilândia do Tocantins', 'Brejinho de Nazaré', 'Buriti do Tocantins', 'Cachoeirinha', 'Campos Lindos',
      'Cariri do Tocantins', 'Carmolândia', 'Carrasco Bonito', 'Caseara', 'Centenário', 'Chapada de Areia', 'Chapada da Natividade', 'Colinas do Tocantins', 'Combinado', 'Conceição do Tocantins',
      'Couto de Magalhães', 'Cristalândia', 'Crixás do Tocantins', 'Darcinópolis', 'Dianópolis', 'Divinópolis do Tocantins', 'Dois Irmãos do Tocantins', 'Dueré', 'Esperantina', 'Fátima',
      'Figueirópolis', 'Filadélfia', 'Formoso do Araguaia', 'Fortaleza do Tabocão', 'Goianorte', 'Goiatins', 'Guaraí', 'Gurupi', 'Ipueiras', 'Itacajá',
      'Itaguatins', 'Itapiratins', 'Itaporã do Tocantins', 'Jaú do Tocantins', 'Juarina', 'Lagoa da Confusão', 'Lagoa do Tocantins', 'Lajeado', 'Lavandeira', 'Lizarda',
      'Luzinópolis', 'Marianópolis do Tocantins', 'Mateiros', 'Maurilândia do Tocantins', 'Miracema do Tocantins', 'Miranorte', 'Monte do Carmo', 'Monte Santo do Tocantins', 'Palmas', 'Palmeirante',
      'Palmeiras do Tocantins', 'Palmeirópolis', 'Paraíso do Tocantins', 'Paranã', 'Pau d’Arco', 'Pedro Afonso', 'Peixe', 'Pequizeiro', 'Pindorama do Tocantins', 'Piraquê',
      'Pium', 'Ponte Alta do Bom Jesus', 'Ponte Alta do Tocantins', 'Porto Alegre do Tocantins', 'Porto Nacional', 'Praia Norte', 'Presidente Kennedy', 'Pugmil', 'Recursolândia', 'Riachinho',
      'Rio da Conceição', 'Rio dos Bois', 'Rio Sono', 'Sampaio', 'Sandolândia', 'Santa Fé do Araguaia', 'Santa Maria do Tocantins', 'Santa Rita do Tocantins', 'Santa Rosa do Tocantins', 'Santa Tereza do Tocantins',
      'Santa Terezinha do Tocantins', 'São Bento do Tocantins', 'São Félix do Tocantins', 'São Miguel do Tocantins', 'São Salvador do Tocantins', 'São Sebastião do Tocantins', 'São Valério', 'Silvanópolis', 'Sítio Novo do Tocantins', 'Sucupira',
      'Taguatinga', 'Taipas do Tocantins', 'Talismã', 'Palmeirópolis', 'Tocantínia', 'Tocantinópolis', 'Tupirama', 'Tupiratins', 'Wanderlândia', 'Xambioá'

    ]
  }
]

// Funções utilitárias
export const getEstados = () => estadosBrasil

export const getEstadoBySigla = (sigla: string): Estado | undefined => {
  return estadosBrasil.find(estado => estado.sigla === sigla)
}

export const getCidadesByEstado = (siglaEstado: string): string[] => {
  const estado = getEstadoBySigla(siglaEstado)
  return estado ? estado.cidades : []
}

export const getEstadoByNome = (nome: string): Estado | undefined => {
  return estadosBrasil.find(estado => 
    estado.nome.toLowerCase().includes(nome.toLowerCase()) ||
    estado.sigla.toLowerCase().includes(nome.toLowerCase())
  )
}

export const searchEstados = (termo: string): Estado[] => {
  if (!termo) return estadosBrasil
  
  return estadosBrasil.filter(estado =>
    estado.nome.toLowerCase().includes(termo.toLowerCase()) ||
    estado.sigla.toLowerCase().includes(termo.toLowerCase())
  )
}

export const searchCidades = (termo: string, siglaEstado?: string): string[] => {
  let cidades: string[] = []
  
  if (siglaEstado) {
    cidades = getCidadesByEstado(siglaEstado)
  } else {
    // Se não especificar estado, busca em todas as cidades
    cidades = estadosBrasil.flatMap(estado => estado.cidades)
  }
  
  if (!termo) return cidades
  
  return cidades.filter(cidade =>
    cidade.toLowerCase().includes(termo.toLowerCase())
  )
}

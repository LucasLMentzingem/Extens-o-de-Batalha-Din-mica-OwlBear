// Fonte declarativa da loja. O gerador materializa cada variante no catálogo central.
const arma=(id,baseRef,nome,preco,bonusMagico,{elemento,danoExtra}={})=>({id,baseRef,ajustes:{nome,raridade:bonusMagico===1?'incomum':'raro',preco:{valor:preco,moeda:'po'},bonusMagico,bonusDano:bonusMagico===1?1:0,...(danoExtra?{danoExtraAoAcertar:{formula:danoExtra,elemento,critico:false}}:{}),descricao:(bonusMagico===1?'+1 ao acerto e ao dano.':'+2 ao acerto e '+danoExtra+' de dano '+elemento+' por acerto.')}});
const item=(id,baseRef,nome,raridade,preco,descricao,extra={})=>({id,baseRef,ajustes:{nome,raridade,preco:{valor:preco,moeda:'po'},descricao,...extra}});
const recurso=(id,nome,evento='descanso_longo')=>({id,nome,maximo:1,saldoInicial:1,recuperacao:[{evento,modo:'completar'}]});
const alvoUnico=(alcanceM=1.5)=>({tipo:'alvos',min:1,max:1,repetirAlvo:false,alcanceM});
const incomuns=[
  arma('azagaia-mais-1','item.azagaia','Azagaia +1',415,1),arma('foice-mais-1','item.foice','Foice +1',420,1),arma('lanca-mais-1','item.lanca','Lança +1',450,1),arma('adaga-mais-1','item.adaga','Adaga +1',440,1),arma('espada-curta-mais-1','item.espada-curta','Espada curta +1',465,1),arma('mangual-mais-1','item.mangual','Mangual +1',455,1),arma('cimitarra-mais-1','item.cimitarra','Cimitarra +1',490,1),arma('arco-longo-mais-1','item.arco-longo','Arco longo +1',540,1),arma('espada-grande-mais-1','item.espada-grande','Espada grande +1',535,1),
  item('veste-bolsos-oficina','item.veste-simples','Veste dos Bolsos de Oficina','incomum',430,'Guarda até 15 kg em um bolso extradimensional; o conteúdo pesa 1 kg para o portador.',{modificadores:{capacidadeCargaKg:14}}),
  item('veste-ultimo-folego','item.veste-simples','Veste do Último Fôlego','incomum',440,'Reação ao sofrer dano, 1 uso por descanso longo: reduza o dano em 1d6.',{
    recursosConcedidos:[recurso('ultimo-folego','Último Fôlego')],
    opcoesConcedidas:[{id:'ultimo-folego',nome:'Último Fôlego',categoria:'item',origem:'Veste do Último Fôlego',gatilho:'ser_atingido',descricao:'Reação ao sofrer dano: reduza o dano em 1d6.',custo:[{tipo:'reacao',quantidade:1},{tipo:'recurso',id:'ultimo-folego',quantidade:1}],automacao:{tipo:'reduzir_dano',formula:'1d6'}}]
  }),
  item('couro-passo-macio','item.couro-batido','Couro do Passo Macio','incomum',485,'Armadura leve, CA 12 + DES e +1 em testes de Furtividade.',{modificadores:{furtividade:1}}),
  item('camisao-malha-mais-1','item.camisao-de-malha','Camisão de malha +1','incomum',530,'Armadura média, CA 14 + DES (máximo +2).',{classeArmadura:{tipo:'base',valor:14,classe:'media',atributo:'des',limiteAtributo:2}}),
  item('cota-malha-mais-1','item.cota-de-malha','Cota de malha +1','incomum',560,'Armadura pesada, CA 17; FOR 13; desvantagem em Furtividade.',{classeArmadura:{tipo:'base',valor:17,classe:'pesada'}}),
  item('placas-mais-1','item.armadura-de-placas','Armadura de placas +1','incomum',2000,'Armadura pesada, CA 19; FOR 15; desvantagem em Furtividade.',{classeArmadura:{tipo:'base',valor:19,classe:'pesada'}}),
  item('escudo-mais-1','item.escudo','Escudo +1','incomum',510,'Empunhado na mão fraca. Concede +3 à CA.',{classeArmadura:{tipo:'bonus',valor:3,classe:'escudo'}}),
  item('anel-mao-firme','item.anel-simples-de-oficina','Anel da Mão Firme','incomum',425,'+1 em testes para abrir fechaduras com ferramentas de ladrão.',{
    modificadores:{abrirFechaduras:1},
    opcoesConcedidas:[{id:'abrir-fechadura',nome:'Abrir fechadura',categoria:'item',origem:'Anel da Mão Firme',descricao:'Use ferramentas de ladrão para abrir uma fechadura. O anel concede +1 a este teste.',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'teste',atributo:'des',pericia:'Prestidigitação',ferramenta:'ferramentas_de_ladrao',contexto:'abrirFechaduras',cd:15}}]
  }),
  item('colar-folego-docas','item.colar-simples-de-oficina','Colar do Fôlego das Docas','incomum',430,'Ação bônus, 1 uso por descanso longo: respire debaixo d’água por 10 minutos.',{
    recursosConcedidos:[recurso('folego-docas','Fôlego das Docas')],
    opcoesConcedidas:[{id:'respirar-agua',nome:'Fôlego das Docas',categoria:'item',origem:'Colar do Fôlego das Docas',descricao:'Respire debaixo d’água por 10 minutos.',custo:[{tipo:'bonus',quantidade:1},{tipo:'recurso',id:'folego-docas',quantidade:1}],selecao:alvoUnico(),requisitosUso:{alvoIgualConjurador:true},automacao:{tipo:'efeito',alcanceM:1.5,efeito:{nome:'Respiração Aquática',tipo:'buff',descricao:'Pode respirar debaixo d’água por 10 minutos.',duracao:{turnos:100,expira:'inicio_origem'}}}}]
  }),
  item('colar-vigia','item.colar-simples-de-oficina','Colar do Vigia','incomum',470,'Concede +1 à iniciativa.',{modificadores:{iniciativa:1}}),
  item('capa-mensageiro','item.capa-de-viagem','Capa do Mensageiro','incomum',420,'Ao usar Disparada, 1 uso por descanso curto ou longo: percorra mais 3 m no turno.',{
    recursosConcedidos:[recurso('passo-mensageiro','Passo do Mensageiro','descanso_curto')],
    opcoesConcedidas:[{id:'disparada-mensageiro',nome:'Disparada do Mensageiro',categoria:'item',origem:'Capa do Mensageiro',descricao:'Use Disparada e percorra mais 3 m neste turno.',custo:[{tipo:'acao',quantidade:1},{tipo:'recurso',id:'passo-mensageiro',quantidade:1}],automacao:{tipo:'economia',disparada:true,adicionarDeslocamentoM:3}}]
  }),
  item('luvas-guarda-mais-1','item.luvas-de-treino-par','Luvas da Guarda +1','incomum',500,'Sem armadura, concede +1 à CA.',{modificadoresCondicionais:{semArmadura:{ca:1}}}),
  item('botas-passo-livre-mais-1','item.botas-de-marcha-par','Botas do Passo Livre +1','incomum',445,'Ignore o custo extra de terreno difícil não mágico.',{ignoraTerrenoDificilNaoMagico:true})
];
const raros=[
  arma('azagaia-para-raios-mais-2','item.azagaia','Azagaia do Para-raios +2',1120,2,{elemento:'raio',danoExtra:'1d4'}),arma('foice-geada-mais-2','item.foice','Foice da Geada +2',1110,2,{elemento:'frio',danoExtra:'1d4'}),arma('lanca-abalo-mais-2','item.lanca','Lança do Abalo +2',1190,2,{elemento:'contundente',danoExtra:'1d4'}),arma('adaga-brasa-mais-2','item.adaga','Adaga da Brasa +2',1170,2,{elemento:'fogo',danoExtra:'1d4'}),arma('espada-curta-escarcha-mais-2','item.espada-curta','Espada Curta da Escarcha +2',1230,2,{elemento:'frio',danoExtra:'1d4'}),arma('mangual-basalto-mais-2','item.mangual','Mangual de Basalto +2',1200,2,{elemento:'contundente',danoExtra:'1d4'}),arma('cimitarra-fornalha-mais-2','item.cimitarra','Cimitarra da Fornalha +2',1300,2,{elemento:'fogo',danoExtra:'1d4'}),arma('arco-longo-tempestade-mais-2','item.arco-longo','Arco Longo da Tempestade +2',1410,2,{elemento:'raio',danoExtra:'1d4'}),arma('espada-grande-falha-mais-2','item.espada-grande','Espada Grande da Falha +2',1390,2,{elemento:'contundente',danoExtra:'1d4'}),
  item('veste-passo-nebuloso','item.veste-simples','Veste do Passo Nebuloso','raro',1250,'Ação bônus, 1 uso por descanso longo: teleporte-se até 9 m para um espaço visível desocupado.',{
    recursosConcedidos:[recurso('passo-nebuloso','Passo Nebuloso da Veste')],
    opcoesConcedidas:[{id:'passo-nebuloso',nome:'Passo Nebuloso da Veste',categoria:'item',origem:'Veste do Passo Nebuloso',descricao:'Teleporte-se até 9 m para um espaço visível desocupado.',custo:[{tipo:'bonus',quantidade:1},{tipo:'recurso',id:'passo-nebuloso',quantidade:1}],automacao:{tipo:'teleporte',alcanceM:9}}]
  }),
  item('veste-trama-serena','item.veste-simples','Veste da Trama Serena','raro',1270,'Ao falhar numa salvaguarda de CON para concentração, 1 uso por descanso longo: rerrole e use o novo resultado.',{
    recursosConcedidos:[recurso('trama-serena','Trama Serena')],
    opcoesConcedidas:[{id:'trama-serena',nome:'Trama Serena',categoria:'item',origem:'Veste da Trama Serena',descricao:'Após falhar na salvaguarda de concentração, rerrole e use o novo resultado.',gatilho:'apos_rolagem_d20',custo:[{tipo:'recurso',id:'trama-serena',quantidade:1}],rerrolagem:{tipo:'d20',modo:'todos',tipos:['salvaguarda'],somenteConcentracao:true,somenteFalha:true}}]
  }),
  item('couro-sombra-curta','item.couro-batido','Couro da Sombra Curta','raro',1350,'Armadura leve, CA 12 + DES. Ação bônus, 1 uso por descanso longo: invisível até o início do próximo turno.',{
    recursosConcedidos:[recurso('sombra-curta','Sombra Curta')],
    opcoesConcedidas:[{id:'sombra-curta',nome:'Sombra Curta',categoria:'item',origem:'Couro da Sombra Curta',descricao:'Fique invisível até o início do próximo turno.',custo:[{tipo:'bonus',quantidade:1},{tipo:'recurso',id:'sombra-curta',quantidade:1}],selecao:alvoUnico(),requisitosUso:{alvoIgualConjurador:true},automacao:{tipo:'efeito',alcanceM:1.5,efeito:{nome:'Sombra Curta',tipo:'condicao',condicao:'invisivel',descricao:'Invisível até o início do próximo turno.',duracao:{turnos:1,expira:'inicio_origem'}}}}]
  }),
  item('camisao-malha-mais-2','item.camisao-de-malha','Camisão de malha +2','raro',1390,'Armadura média, CA 15 + DES (máximo +2).',{classeArmadura:{tipo:'base',valor:15,classe:'media',atributo:'des',limiteAtributo:2}}),
  item('cota-malha-mais-2','item.cota-de-malha','Cota de malha +2','raro',1460,'Armadura pesada, CA 18; FOR 13; desvantagem em Furtividade.',{classeArmadura:{tipo:'base',valor:18,classe:'pesada'}}),
  item('placas-mais-2','item.armadura-de-placas','Armadura de placas +2','raro',5050,'Armadura pesada, CA 20; FOR 15; desvantagem em Furtividade.',{classeArmadura:{tipo:'base',valor:20,classe:'pesada'}}),
  item('escudo-mais-2','item.escudo','Escudo +2','raro',1325,'Empunhado na mão fraca. Concede +4 à CA.',{classeArmadura:{tipo:'bonus',valor:4,classe:'escudo'}}),
  item('anel-segunda-chance','item.anel-simples-de-oficina','Anel da Segunda Chance','raro',1300,'Ao falhar numa salvaguarda, 1 uso por descanso longo: rerrole e use o novo resultado.',{
    recursosConcedidos:[recurso('segunda-chance','Segunda Chance')],
    opcoesConcedidas:[{id:'segunda-chance',nome:'Segunda Chance',categoria:'item',origem:'Anel da Segunda Chance',descricao:'Após falhar numa salvaguarda, rerrole e use o novo resultado.',gatilho:'apos_rolagem_d20',custo:[{tipo:'recurso',id:'segunda-chance',quantidade:1}],rerrolagem:{tipo:'d20',modo:'todos',tipos:['salvaguarda'],somenteFalha:true}}]
  }),
  item('colar-socorrista','item.colar-simples-de-oficina','Colar do Socorrista','raro',1275,'Ação e toque numa criatura viva com 0 PV, 1 uso por descanso longo: ela recupera 2d8+2 PV.',{
    recursosConcedidos:[recurso('socorrista','Socorrista')],
    opcoesConcedidas:[{id:'socorrista',nome:'Socorrista',categoria:'item',origem:'Colar do Socorrista',descricao:'Toque uma criatura viva com 0 PV para recuperar 2d8+2 PV.',custo:[{tipo:'acao',quantidade:1},{tipo:'recurso',id:'socorrista',quantidade:1}],selecao:alvoUnico(),requisitosUso:{alvoComZeroPv:true,alvoVivo:true},automacao:{tipo:'cura',alcanceM:1.5,formula:'2d8+2'}}]
  }),
  item('luvas-dragao-ascendente-mais-2','item.luvas-de-treino-par','Luvas do Dragão Ascendente +2','raro',1400,'Golpes desarmados causam +1d4 de fogo por acerto. Sem armadura, concede também +1 à CA.',{danoExtraDesarmado:{formula:'1d4',elemento:'fogo',critico:false},modificadoresCondicionais:{semArmadura:{ca:1}}}),
  item('botas-escapistas-mais-2','item.botas-de-marcha-par','Botas Escapistas +2','raro',1250,'Ação bônus, 1 uso por descanso longo: use Desengajar e Disparada juntos e não provoque ataques de oportunidade nesse turno.',{
    recursosConcedidos:[recurso('passo-escapista','Passo Escapista')],
    opcoesConcedidas:[{id:'passo-escapista',nome:'Passo Escapista',categoria:'item',origem:'Botas Escapistas +2',descricao:'Use Desengajar e Disparada juntos; não provoque ataques de oportunidade neste turno.',custo:[{tipo:'bonus',quantidade:1},{tipo:'recurso',id:'passo-escapista',quantidade:1}],automacao:{tipo:'economia',disparada:true,desengajar:true}}]
  })
];
export const variantesLaArte=[...incomuns,...raros];
export default {versaoFormato:2,id:'loja.la-arte',nome:'La Arte',descricao:'Itens mágicos incomuns e raros criados por Laerte.',descontoMinimoPct:1,descontoMaximoPct:30,itens:variantesLaArte.map(x=>({id:'la-arte-'+x.id,ref:'item.la-arte.'+x.id}))};

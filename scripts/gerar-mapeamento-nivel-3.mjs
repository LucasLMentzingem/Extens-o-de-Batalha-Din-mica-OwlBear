import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const fonte=resolve(process.argv[2]??resolve(raiz,'../../outputs/aventura DnD/Extensao-Owlbear/Mapeamento-SRD-Nivel-10/catalogo-interacoes-nivel-10.json'));
const destino=resolve(raiz,'docs/mapeamento-nivel-3');
const catalogo=JSON.parse(await readFile(fonte,'utf8'));
const normal=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const contem=(s,...termos)=>termos.some(t=>normal(s).includes(normal(t)));
const versao='0.8.11';

const MODULOS_PLANEJADOS=Object.freeze({
  'M01-ciclo-efeitos':{prioridade:1,estado:'PARCIAL',nome:'Ciclo de vida declarativo de efeitos',escopo:'Aplicar, atualizar, repetir e remover efeitos por evento, duração, concentração e condição de término.',entregue:'Durações por início/fim de turno, concentração, descanso, condições e salvaguardas repetidas.',falta:'Empilhamento declarativo, eventos arbitrários e remoções compostas persistidas.'},
  'M02-gatilhos-interceptacoes':{prioridade:1,estado:'PARCIAL',nome:'Barramento de gatilhos e interceptações',escopo:'Antes/depois de ataque, dano, cura, movimento, teste ou conjuração; permite cancelar, redirecionar ou substituir etapas.',entregue:'Reações de oportunidade, sofrer dano, ser atingido, pós-acerto e pós-rolagem com retomada da ação.',falta:'Barramento genérico ordenado para todo evento, prioridade e redirecionamento declarativos.'},
  'M03-escolhas-declarativas':{prioridade:1,estado:'PARCIAL',nome:'Escolhas e variantes durante a resolução',escopo:'Prompt tipado para escolher dano, atributo, modo, alvo, benefício ou variante sem criar uma habilidade duplicada.',entregue:'Escolha de alvos, tipos elementais e modos da Gaveta de Composição.',falta:'Escolhas genéricas de atributo, benefício, condição, área e persistência entre descansos.'},
  'M04-compositor-acoes':{prioridade:1,estado:'PARCIAL',nome:'Compositor e modificador de ações',escopo:'Acoplar uma regra a uma arma/magia, gerar ataques adicionais e alterar custo, alcance, dano ou efeito da próxima ação.',entregue:'Aprimoramentos pós-acerto, dano adicional, ataques em sequência e M04.1 Gaveta de Composição.',falta:'Composição declarativa completa para metamagias, smites, maestrias e substituição de etapas.',implementado:['M04.1-gaveta-composicao'],documentacao:'../MODULO-GAVETA-COMPOSICAO.md'},
  'M05-zonas-persistentes':{prioridade:1,estado:'AUSENTE',nome:'Templates e zonas persistentes',escopo:'Cubo, cilindro, parede, emanação e áreas móveis, com entrada/saída/início/fim de turno e visual público.',entregue:'Áreas instantâneas em círculo, quadrado, cone e linha.',falta:'Entidade de zona persistente, formas restantes e gatilhos espaciais.'},
  'M06-entidades-vinculadas':{prioridade:1,estado:'AUSENTE',nome:'Entidades, familiares e objetos vinculados',escopo:'Criar token e ficha derivada, definir dono, iniciativa, comandos, duração, PV e encerramento junto da origem.',entregue:'Vínculo comum entre ficha e token.',falta:'Criação e ciclo de vida de familiar, servo, montaria e objeto controlável derivados.'},
  'M07-sobreposicao-ficha':{prioridade:1,estado:'AUSENTE',nome:'Transformações e sobreposição de ficha',escopo:'Substituir temporariamente estatísticas, tamanho, deslocamentos, sentidos, ações e token, preservando o estado original.',entregue:'Buffs numéricos sem troca de forma.',falta:'Camadas reversíveis de ficha, PV, ações, tamanho, sentidos, equipamento e token.'},
  'M08-movimento-avancado':{prioridade:2,estado:'PARCIAL',nome:'Movimento e trajetórias avançadas',escopo:'Puxar, fugir, direção escolhida, voo, escalada, salto, terreno difícil, deslocamento por zona e colisões.',entregue:'Distância euclidiana, teleporte, empurrão vetorial, terreno difícil e ataques de oportunidade ao longo do caminho.',falta:'Puxar, direção livre, voo, escalada, salto, colisão e movimento associado a zonas.'},
  'M09-modificadores-rolagem':{prioridade:2,estado:'PARCIAL',nome:'Modificadores condicionais de rolagem',escopo:'Vantagem, desvantagem, rerrolagem, dados explosivos, mínimo/máximo e substituição de resultados por gatilho.',entregue:'Vantagem/desvantagem, dados adicionais, rerrolagens de d20/dano e rolar duas vezes escolhendo o maior.',falta:'Mínimo/máximo, substituição genérica, filtros compostos e integração com dados explosivos.'},
  'M10-tags-restricoes':{prioridade:2,estado:'PARCIAL',nome:'Tags de criatura e restrições sistêmicas',escopo:'Tipo de criatura, imunidades funcionais, bloqueio de cura, requisitos de alvo e exceções por condição.',entregue:'Tags de ataque/dano e requisitos como alvo vivo, 0 PV, diferente ou já atingido.',falta:'Tipo de criatura, tamanho, imunidades funcionais e predicados declarativos combináveis.'},
  'M11-vinculo-equipamento':{prioridade:2,estado:'AUSENTE',nome:'Vínculo persistente com equipamento',escopo:'Encantar uma arma/armadura escolhida e recalcular dinamicamente ações e bônus enquanto o vínculo existir.',entregue:'Equipamento recalcula ataque, dano, proficiência e concessões enquanto equipado.',falta:'Efeito temporário que escolhe e acompanha uma instância específica de item.'},
  'M12-agendador':{prioridade:2,estado:'PARCIAL',nome:'Agendador de efeitos e dano',escopo:'Executar dano, cura, teste ou efeito em um evento futuro específico, inclusive no fim do próximo turno.',entregue:'Dano no início do turno, duração, salvaguardas repetidas e eventos do próximo turno.',falta:'Fila genérica persistida para dano, cura, teste ou efeito futuro com cancelamento.'},
  'M13-dados-estendidos':{prioridade:3,estado:'AUSENTE',nome:'Expressões de dados estendidas',escopo:'Dados explosivos e outras transformações que não cabem hoje nas fórmulas Dice+ simples.',entregue:'Lotes, manter maior/menor e dados críticos.',falta:'Explosão recursiva segura e demais transformações declarativas.'},
  'M14-adjudicacao-estruturada':{prioridade:3,estado:'AUSENTE',nome:'Pedido estruturado de adjudicação ao mestre',escopo:'Para efeitos narrativos: coleta escolhas, alvo, CD e contexto, cobra custo e envia uma decisão auditável ao mestre.',entregue:'Execução assistida simples e histórico textual.',falta:'Formulário público, decisão aprovar/alterar/negar, consequência e auditoria estruturadas.'},
  'M15-escalonamento-variantes':{prioridade:3,estado:'PARCIAL',nome:'Escalonamento e variantes por nível/círculo',escopo:'Resolver tabelas, quantidade de alvos, área, dados e opções conforme nível total, classe ou círculo gasto.',entregue:'Escala de truques, Mísseis Mágicos por círculo e algumas variantes geradas.',falta:'Tabela declarativa única para nível, nível de classe, círculo, alvos, área e recursos.'},
  'M16-limites-cura-recursos':{prioridade:3,estado:'PARCIAL',nome:'Limites de cura, PV temporários e recursos',escopo:'Distribuição de reserva, tetos por alvo, consumo parcial e recuperação condicionada.',entregue:'Cura, PV temporários, 0 PV, recursos, custos e descansos.',falta:'Distribuição interativa de reservas, teto por alvo e consumo parcial confirmado.'}
});

const origemSistema=item=>item.categoria==='traço_espécie'?'raca':
  ['habilidade_classe','habilidade_subclasse','invocação','metamagia','maestria_arma'].includes(item.categoria)?'classe':
  item.categoria==='magia'?'magia':item.categoria==='talento'?'talento':'comum';

const portaveis=new Set([
  'Attack','Dash','Disengage','Dodge','Grapple','Shove: Topple','Shove: Push','Opportunity Attack','Bless','Magic Missile','Mage Armor','Misty Step',
  'Cure Wounds','Healing Word','Prayer of Healing','Second Wind','Lay On Hands','Dark One’s Blessing','False Life','Heroism','Action Surge','Martial Arts',
  'Unarmored Defense','Unarmored Movement','Jack of All Trades','Expertise','Cunning Action','Font of Magic','Magical Cunning','Draconic Resilience',
  'Breath Weapon','Damage Resistance','Dwarven Toughness','Fey Ancestry','Luck','Resourceful','Adrenaline Rush','Relentless Endurance',
  'Empowered Spell','Armor of Shadows','Fiendish Vigor','Repelling Blast','Savage Attacker','Archery','Defense','Two-Weapon Fighting','Slow','Graze','Nick',
  'Dwarven Resilience','Gnomish Cunning','Brave','Giant Ancestry','Elven Lineage','Fiendish Legacy','Versatile','Favored Enemy','Deft Explorer','Paladin’s Smite','Fighting Style',
  'Burning Hands','Color Spray','Dragon’s Breath','Faerie Fire','Thunderwave','Ice Knife','Searing Smite','Feather Fall','Hellish Rebuke','Shield','Deflect Attacks',
  'Guidance','Resistance','Longstrider','Ray of Frost','Shocking Grasp','Vicious Mockery','Hold Person','Hideous Laughter','Entangle','Invisibility','Hunter’s Mark','Hex','True Strike'
]);
const novos=new Set([
  'Find Familiar','Find Steed','Wild Companion','Unseen Servant','Floating Disk','Rope Trick','Alter Self','Mirror Image','Spiritual Weapon','Web','Moonbeam'
]);
const assistidos=new Set([
  'Ready','Help','Hide','Influence','Magic','Search','Study','Utilize','Arcane Lock','Arcanist’s Magic Aura','Augury','Comprehend Languages','Continual Flame',
  'Identify','Illusory Script','Knock','Locate Animals or Plants','Mage Hand','Magic Mouth','Mending','Prestidigitation','Purify Food and Drink','Stonecunning','Trance',
  'Thieves’ Cant','Druidic','Otherworldly Presence','Speak with Animals','Message','Locate Object','Enthrall'
]);
const parciais=new Set([
  'Sorcerous Burst','Produce Flame','Sanctuary','Weapon Mastery','Metamagic','Eldritch Invocations','Sneak Attack','Frenzy','Hunter’s Prey','Open Hand Technique',
  'Tactical Mind','Primal Knowledge','Wild Shape','Channel Divinity','Preserve Life','Land’s Aid','Divine Smite','Shining Smite','Divine Favor','Magic Weapon',
  'Pass without Trace','Spike Growth','Fog Cloud','Silence','Darkness','Phantasmal Force','Silent Image','Minor Illusion','Gust of Wind','Levitate','Spider Climb',
  'Command','Suggestion','Detect Thoughts','Animal Messenger','Calm Emotions','Enhance Ability','Enlarge/Reduce','Flaming Sphere','Heat Metal','Sleep','Shillelagh','Thaumaturgy'
]);

function modulosExistentes(item){
  const m=item.modelo_extensao,mods=[];
  if(['ataque','gatilho_pos_acerto','etapas_compostas'].includes(m))mods.push('ataque_vs_ca','dano_tipado','aprimoramento_pos_acerto','critico');
  if(['salva','salva+deslocamento','geometria_area'].includes(m))mods.push('salvaguarda_por_alvo','dano_meia_ou_anula','efeito_na_falha');
  if(m==='geometria_area')mods.push('area_circulo_quadrado_cone_linha');
  if(['cura','pv_temporario'].includes(m))mods.push('cura_pv_temporarios','zero_pv');
  if(['reacao_generica','interceptacao_ataque','reacao_sair_alcance'].includes(m))mods.push('fila_reacoes','interrupcao_e_retomada');
  if(['efeito','efeito_movimento','equipamento_buff'].includes(m))mods.push('buff_debuff','duracao','concentracao');
  if(['recurso','recursos_magia'].includes(m))mods.push('recursos_custos_descansos','preparacao_magias');
  if(m==='projeteis')mods.push('multialvo_com_repeticao','rolagem_em_lote');
  if(m==='teleporte')mods.push('teleporte_destino');
  if(m==='modificador_de_acao')mods.push('requisitos_de_uso','acoplar_dano','economia_de_acao');
  if(m==='passiva_ficha')mods.push('atributos_pericias_sentidos');
  mods.push('limite_alcance_18m');return [...new Set(mods)];
}
function avaliar(item){
  const nome=item.nome,modelo=item.modelo_extensao,forma=normal(item.formas),texto=normal([item.especial,item.lacuna_principal].join(' '));
  let status='PARCIAL',lacuna='A interação principal cabe nos módulos atuais, mas requer configuração e teste específico.';
  if(portaveis.has(nome)){status='PORTAVEL';lacuna='Os módulos atuais cobrem o fluxo principal; falta apenas cadastrar e validar a definição.';}
  else if(novos.has(nome)||modelo==='transformacao'||(modelo==='invocacao'&&!assistidos.has(nome))){status='NOVO_MODULO';lacuna='Exige entidade/token derivado, transformação de ficha ou zona persistente ainda não generalizada.';}
  else if(assistidos.has(nome)||modelo==='assistido'){status='ASSISTIDO';lacuna='Pode constar na ficha e gastar recursos; a consequência permanece sob decisão do mestre.';}
  else if(parciais.has(nome)||['modificador_de_acao','etapas_compostas','escolha','interceptacao_ataque'].includes(modelo)){status='PARCIAL';lacuna='Há suporte para parte do fluxo, mas ao menos uma escolha, gatilho ou efeito secundário ainda é manual.';}
  else if(modelo==='passiva_ficha'){status='PORTAVEL';lacuna='Representável diretamente nos dados e modificadores da ficha.';}
  else if(modelo==='passiva_ou_carta'){
    if(contem(nome,'Subclass')){status='PORTAVEL';lacuna='A escolha de subclasse e suas concessões podem ser guardadas por referência no catálogo.';}
    else if(contem(nome,'Darkvision','Toughness','Skillful','Expertise','Bonus Proficiencies','Unarmored','Jack of All Trades')){status='PORTAVEL';lacuna='Representável por sentidos, proficiências ou modificadores declarativos da ficha.';}
    else{status='ASSISTIDO';lacuna='A ficha registra a passiva, mas o efeito precisa de definição específica ou arbitragem.';}
  }
  else if(['cura','pv_temporario','reacao_generica','teleporte','recurso','recursos_magia','projeteis','bencao','desengajar','disparada'].includes(modelo)){status='PORTAVEL';lacuna='O módulo reutilizável correspondente já existe no motor atual.';}
  else if(modelo==='geometria_area'){
    if(contem(forma,'cylinder','wall','emanation')||contem(texto,'parede','emanação móvel','zona persistente')){status='NOVO_MODULO';lacuna='Falta template persistente de cilindro, parede ou emanação móvel.';}
    else{status='PARCIAL';lacuna='Cone, linha, círculo e quadrado existem; efeitos narrativos ou persistentes ainda precisam de definição.';}
  }
  else if(['ataque','salva','efeito','efeito_movimento','salva+deslocamento'].includes(modelo)){
    status='PARCIAL';lacuna='Ataque/salva/efeito básico é portável; regras secundárias do item ainda precisam ser modeladas.';
  }
  return {status_portabilidade:status,modulos_existentes:modulosExistentes(item),lacuna_atual:lacuna};
}

function modulosNecessarios(item,status){
  if(status==='PORTAVEL')return [];
  const texto=normal([item.nome,item.modelo_extensao,item.lacuna_principal,item.especial,item.formas].join(' ')),mods=new Set();
  const add=id=>mods.add(id);
  if(contem(texto,'concentracao','concentração','termino do efeito','término do efeito','condicao oficial','condição oficial','remocao','remoção','duracao'))add('M01-ciclo-efeitos');
  if(contem(texto,'gatilho','antes de cada ataque','interceptacao','interceptação','reacao','reação','bloqueio de cura'))add('M02-gatilhos-interceptacoes');
  if(contem(texto,'escolha','escolher','prompt declarativo','tipo de dano','modos'))add('M03-escolhas-declarativas');
  if(contem(texto,'compor','alterar outra acao','alterar outra ação','ataques adicionais','vincular o buff a uma arma','modificador_de_acao','etapas compostas'))add('M04-compositor-acoes');
  if(contem(texto,'templates espaciais','zona persistente','cilindro','parede','emanacao','emanação','web','moonbeam'))add('M05-zonas-persistentes');
  if(contem(texto,'criar/controlar tokens','ficha derivada','familiar','servo','montaria','find familiar','find steed','unseen servant','wild companion','spiritual weapon'))add('M06-entidades-vinculadas');
  if(contem(texto,'substituicao temporaria','substituição temporária','transformacao','transformação','alter self','wild shape'))add('M07-sobreposicao-ficha');
  if(contem(texto,'puxar','direcao escolhida','direção escolhida','fuga','trajeto','voo','escalada','salto','terreno dificil','terreno difícil','movimento','floating disk','rope trick','spider climb','levitate','gust of wind'))add('M08-movimento-avancado');
  if(contem(texto,'vantagem','desvantagem','rerrolagem','dados explosivos'))add('M09-modificadores-rolagem');
  if(contem(texto,'mortos-vivos','morto-vivo','bloqueio de cura','tipo de criatura','imunidade funcional'))add('M10-tags-restricoes');
  if(contem(texto,'vincular o buff a uma arma','magic weapon','shillelagh','flame blade'))add('M11-vinculo-equipamento');
  if(contem(texto,'agendar','fim do proximo turno','fim do próximo turno','dano acido','dano ácido','inicio do turno','início do turno'))add('M12-agendador');
  if(contem(texto,'dados explosivos'))add('M13-dados-estendidos');
  if(contem(texto,'conferido pela mesa','resolucao narrativa','resolução narrativa','consequencia nao numerica','consequência não numérica')||item.modelo_extensao==='assistido')add('M14-adjudicacao-estruturada');
  if(contem(texto,'escalonamento','revisar area','revisar área','por nivel','por nível','por circulo','por círculo'))add('M15-escalonamento-variantes');
  if(contem(texto,'cura/pv temporario','cura/pv temporário','controlar o limite','saldo e recuperacao','saldo e recuperação','preserve life','lay on hands'))add('M16-limites-cura-recursos');
  if(item.modelo_extensao==='invocacao'&&!mods.has('M06-entidades-vinculadas'))add('M06-entidades-vinculadas');
  if(item.modelo_extensao==='transformacao')add('M07-sobreposicao-ficha');
  if(item.modelo_extensao==='interceptacao_ataque')add('M02-gatilhos-interceptacoes');
  if(item.modelo_extensao==='escolha')add('M03-escolhas-declarativas');
  if(['modificador_de_acao','etapas_compostas'].includes(item.modelo_extensao))add('M04-compositor-acoes');
  // A Gaveta de Composição já resolve a escolha do tipo da Explosão Elemental.
  // Os dados explosivos do truque ainda dependem dos módulos M09 e M13.
  if(item.nome==='Sorcerous Burst')mods.delete('M03-escolhas-declarativas');
  if(!mods.size)add(status==='ASSISTIDO'?'M14-adjudicacao-estruturada':'M01-ciclo-efeitos');
  return [...mods].sort((a,b)=>MODULOS_PLANEJADOS[a].prioridade-MODULOS_PLANEJADOS[b].prioridade||a.localeCompare(b));
}

const nivelCorrigido=item=>item.nome==='Large Form'&&item.origem==='Goliath'?5:Number(item.nivel_minimo);
const itens=catalogo.itens.filter(item=>item.categoria==='magia'?Number(item.circulo)<=2:nivelCorrigido(item)<=3).map(item=>{const avaliacao=avaliar(item);return {...item,origem_sistema:origemSistema(item),nivel_minimo:nivelCorrigido(item),...avaliacao,modulos_necessarios:modulosNecessarios(item,avaliacao.status_portabilidade),avaliado_na_versao:versao};});
const contagem=campo=>Object.fromEntries([...new Set(itens.map(x=>x[campo]))].sort().map(valor=>[valor,itens.filter(x=>x[campo]===valor).length]));
const porModulo=Object.fromEntries(Object.keys(MODULOS_PLANEJADOS).map(id=>[id,itens.filter(x=>x.modulos_necessarios.includes(id)).length]));
const porEstadoModulo=Object.fromEntries(['PARCIAL','AUSENTE'].map(estado=>[estado,Object.values(MODULOS_PLANEJADOS).filter(x=>x.estado===estado).length]));
const saida={versao,escopo:'SRD 5.2.1 — todas as classes, subclasses SRD, espécies, talentos, invocações, metamagias, maestrias e magias disponíveis até o nível 3',fonte:'https://www.dndbeyond.com/srd',geradoEm:'2026-11-15',criterios:{PORTAVEL:'O motor atual possui os módulos fundamentais; requer cadastro/teste da definição.',PARCIAL:'O fluxo principal existe, mas uma regra secundária ainda é manual ou específica.',ASSISTIDO:'Pode ser registrado e ter custo, mas a consequência é decidida pelo mestre.',NOVO_MODULO:'Falta uma capacidade reutilizável essencial.'},modulosPlanejados:MODULOS_PLANEJADOS,resumo:{total:itens.length,porOrigemSistema:contagem('origem_sistema'),porCategoria:contagem('categoria'),porPortabilidade:contagem('status_portabilidade'),porEstadoModulo,porModulo},itens};
await mkdir(destino,{recursive:true});await writeFile(resolve(destino,'catalogo-nivel-3.json'),JSON.stringify(saida,null,2)+'\n');
const campos=['id','nome','origem_sistema','categoria','origem','nivel_minimo','circulo','ativacao','custo','recurso','alcance','alvo','formas','rolagem','dano_cura','tipos_dano','buff_debuff','duracao','concentracao','gatilho','status_portabilidade','modelo_extensao','modulos_existentes','modulos_necessarios','lacuna_atual','fonte_secao'];
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
await writeFile(resolve(destino,'catalogo-nivel-3.csv'),[campos.join(','),...itens.map(item=>campos.map(c=>csv(Array.isArray(item[c])?item[c].join('|'):item[c])).join(','))].join('\n')+'\n');
await writeFile(resolve(destino,'resumo.json'),JSON.stringify(saida.resumo,null,2)+'\n');
await writeFile(resolve(destino,'modulos-nivel-3.json'),JSON.stringify({versao,modulos:MODULOS_PLANEJADOS,porEstado:porEstadoModulo,porModulo},null,2)+'\n');
const tituloGrupo=x=>x==='raca'?'Raças':'Classes';
const linhasHabilidades=['# Habilidades de classe e raça até o nível 3','',`Catálogo SRD 5.2.1 reavaliado para a extensão ${versao}. Os nomes oficiais permanecem em inglês para manter correspondência inequívoca com a fonte.`,''];
for(const tipo of ['raca','classe']){
  const listaTipo=itens.filter(x=>x.origem_sistema===tipo);
  const grupos=Object.entries(Object.groupBy(listaTipo,x=>x.origem)).sort(([a],[b])=>a.localeCompare(b));
  linhasHabilidades.push('## '+tituloGrupo(tipo),'',`Total: **${listaTipo.length}**.`,'');
  for(const [origem,lista] of grupos){
    linhasHabilidades.push('### '+origem,'','| Habilidade | Tipo | Nível | Estado | Módulos ainda necessários |','|---|---|---:|---|---|');
    for(const x of lista.sort((a,b)=>a.nivel_minimo-b.nivel_minimo||a.nome.localeCompare(b.nome)))linhasHabilidades.push(`| ${x.nome} | ${x.categoria} | ${x.nivel_minimo} | ${x.status_portabilidade} | ${x.modulos_necessarios.join(', ')||'—'} |`);
    linhasHabilidades.push('');
  }
}
await writeFile(resolve(destino,'HABILIDADES-CLASSE-E-RACA.md'),linhasHabilidades.join('\n').replace(/\n+$/,'')+'\n');
console.log(JSON.stringify(saida.resumo,null,2));

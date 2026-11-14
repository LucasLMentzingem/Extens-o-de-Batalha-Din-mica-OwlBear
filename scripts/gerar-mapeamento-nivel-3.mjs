import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const fonte=resolve(process.argv[2]??resolve(raiz,'../../outputs/aventura DnD/Extensao-Owlbear/Mapeamento-SRD-Nivel-10/catalogo-interacoes-nivel-10.json'));
const destino=resolve(raiz,'docs/mapeamento-nivel-3');
const catalogo=JSON.parse(await readFile(fonte,'utf8'));
const normal=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const contem=(s,...termos)=>termos.some(t=>normal(s).includes(normal(t)));
const versao='0.8.7';

const MODULOS_PLANEJADOS=Object.freeze({
  'M01-ciclo-efeitos':{prioridade:1,nome:'Ciclo de vida declarativo de efeitos',escopo:'Aplicar, atualizar, repetir e remover efeitos por evento, duração, concentração e condição de término.'},
  'M02-gatilhos-interceptacoes':{prioridade:1,nome:'Barramento de gatilhos e interceptações',escopo:'Antes/depois de ataque, dano, cura, movimento, teste ou conjuração; permite cancelar, redirecionar ou substituir etapas.'},
  'M03-escolhas-declarativas':{prioridade:1,nome:'Escolhas e variantes durante a resolução',escopo:'Prompt tipado para escolher dano, atributo, modo, alvo, benefício ou variante sem criar uma habilidade duplicada.'},
  'M04-compositor-acoes':{prioridade:1,nome:'Compositor e modificador de ações',escopo:'Acoplar uma regra a uma arma/magia, gerar ataques adicionais e alterar custo, alcance, dano ou efeito da próxima ação.'},
  'M05-zonas-persistentes':{prioridade:1,nome:'Templates e zonas persistentes',escopo:'Cubo, cilindro, parede, emanação e áreas móveis, com entrada/saída/início/fim de turno e visual público.'},
  'M06-entidades-vinculadas':{prioridade:1,nome:'Entidades, familiares e objetos vinculados',escopo:'Criar token e ficha derivada, definir dono, iniciativa, comandos, duração, PV e encerramento junto da origem.'},
  'M07-sobreposicao-ficha':{prioridade:1,nome:'Transformações e sobreposição de ficha',escopo:'Substituir temporariamente estatísticas, tamanho, deslocamentos, sentidos, ações e token, preservando o estado original.'},
  'M08-movimento-avancado':{prioridade:2,nome:'Movimento e trajetórias avançadas',escopo:'Puxar, fugir, direção escolhida, voo, escalada, salto, terreno difícil, deslocamento por zona e colisões.'},
  'M09-modificadores-rolagem':{prioridade:2,nome:'Modificadores condicionais de rolagem',escopo:'Vantagem, desvantagem, rerrolagem, dados explosivos, mínimo/máximo e substituição de resultados por gatilho.'},
  'M10-tags-restricoes':{prioridade:2,nome:'Tags de criatura e restrições sistêmicas',escopo:'Tipo de criatura, imunidades funcionais, bloqueio de cura, requisitos de alvo e exceções por condição.'},
  'M11-vinculo-equipamento':{prioridade:2,nome:'Vínculo persistente com equipamento',escopo:'Encantar uma arma/armadura escolhida e recalcular dinamicamente ações e bônus enquanto o vínculo existir.'},
  'M12-agendador':{prioridade:2,nome:'Agendador de efeitos e dano',escopo:'Executar dano, cura, teste ou efeito em um evento futuro específico, inclusive no fim do próximo turno.'},
  'M13-dados-estendidos':{prioridade:3,nome:'Expressões de dados estendidas',escopo:'Dados explosivos e outras transformações que não cabem hoje nas fórmulas Dice+ simples.'},
  'M14-adjudicacao-estruturada':{prioridade:3,nome:'Pedido estruturado de adjudicação ao mestre',escopo:'Para efeitos narrativos: coleta escolhas, alvo, CD e contexto, cobra custo e envia uma decisão auditável ao mestre.'},
  'M15-escalonamento-variantes':{prioridade:3,nome:'Escalonamento e variantes por nível/círculo',escopo:'Resolver tabelas, quantidade de alvos, área, dados e opções conforme nível total, classe ou círculo gasto.'},
  'M16-limites-cura-recursos':{prioridade:3,nome:'Limites de cura, PV temporários e recursos',escopo:'Distribuição de reserva, tetos por alvo, consumo parcial e recuperação condicionada.'}
});

const portaveis=new Set([
  'Attack','Dash','Disengage','Dodge','Grapple','Shove: Topple','Shove: Push','Opportunity Attack','Bless','Magic Missile','Mage Armor','Misty Step',
  'Cure Wounds','Healing Word','Prayer of Healing','Second Wind','Lay On Hands','Dark One’s Blessing','False Life','Heroism','Action Surge','Martial Arts',
  'Unarmored Defense','Unarmored Movement','Jack of All Trades','Expertise','Cunning Action','Font of Magic','Magical Cunning','Draconic Resilience',
  'Breath Weapon','Damage Resistance','Dwarven Toughness','Fey Ancestry','Luck','Resourceful','Adrenaline Rush','Relentless Endurance',
  'Empowered Spell','Armor of Shadows','Fiendish Vigor','Repelling Blast','Savage Attacker','Archery','Defense','Two-Weapon Fighting','Slow','Graze','Nick',
  'Dwarven Resilience','Gnomish Cunning','Brave','Giant Ancestry','Elven Lineage','Fiendish Legacy','Versatile','Favored Enemy','Deft Explorer','Paladin’s Smite','Fighting Style',
  'Burning Hands','Color Spray','Dragon’s Breath','Faerie Fire','Thunderwave','Ice Knife','Searing Smite','Feather Fall','Hellish Rebuke','Shield','Deflect Attacks',
  'Guidance','Resistance','Longstrider','Ray of Frost','Shocking Grasp','Vicious Mockery','Hold Person','Hideous Laughter','Entangle','Invisibility','Hunter’s Mark','Hex'
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
  'Command','Suggestion','Detect Thoughts','Animal Messenger','Calm Emotions','Enhance Ability','Enlarge/Reduce','Flaming Sphere','Heat Metal','Sleep','Shillelagh','Thaumaturgy','True Strike'
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
  if(!mods.size)add(status==='ASSISTIDO'?'M14-adjudicacao-estruturada':'M01-ciclo-efeitos');
  return [...mods].sort((a,b)=>MODULOS_PLANEJADOS[a].prioridade-MODULOS_PLANEJADOS[b].prioridade||a.localeCompare(b));
}

const nivelCorrigido=item=>item.nome==='Large Form'&&item.origem==='Goliath'?5:Number(item.nivel_minimo);
const itens=catalogo.itens.filter(item=>item.categoria==='magia'?Number(item.circulo)<=2:nivelCorrigido(item)<=3).map(item=>{const avaliacao=avaliar(item);return {...item,nivel_minimo:nivelCorrigido(item),...avaliacao,modulos_necessarios:modulosNecessarios(item,avaliacao.status_portabilidade),avaliado_na_versao:versao};});
const contagem=campo=>Object.fromEntries([...new Set(itens.map(x=>x[campo]))].sort().map(valor=>[valor,itens.filter(x=>x[campo]===valor).length]));
const porModulo=Object.fromEntries(Object.keys(MODULOS_PLANEJADOS).map(id=>[id,itens.filter(x=>x.modulos_necessarios.includes(id)).length]));
const saida={versao,escopo:'SRD 5.2.1 — todas as classes, subclasses SRD, espécies, talentos, invocações, metamagias, maestrias e magias disponíveis até o nível 3',fonte:'https://www.dndbeyond.com/srd',geradoEm:'2026-11-14',criterios:{PORTAVEL:'O motor atual possui os módulos fundamentais; requer cadastro/teste da definição.',PARCIAL:'O fluxo principal existe, mas uma regra secundária ainda é manual ou específica.',ASSISTIDO:'Pode ser registrado e ter custo, mas a consequência é decidida pelo mestre.',NOVO_MODULO:'Falta uma capacidade reutilizável essencial.'},modulosPlanejados:MODULOS_PLANEJADOS,resumo:{total:itens.length,porCategoria:contagem('categoria'),porPortabilidade:contagem('status_portabilidade'),porModulo},itens};
await mkdir(destino,{recursive:true});await writeFile(resolve(destino,'catalogo-nivel-3.json'),JSON.stringify(saida,null,2)+'\n');
const campos=['id','nome','categoria','origem','nivel_minimo','circulo','ativacao','custo','recurso','alcance','alvo','formas','rolagem','dano_cura','tipos_dano','buff_debuff','duracao','concentracao','gatilho','status_portabilidade','modelo_extensao','modulos_existentes','modulos_necessarios','lacuna_atual','fonte_secao'];
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
await writeFile(resolve(destino,'catalogo-nivel-3.csv'),[campos.join(','),...itens.map(item=>campos.map(c=>csv(Array.isArray(item[c])?item[c].join('|'):item[c])).join(','))].join('\n')+'\n');
await writeFile(resolve(destino,'resumo.json'),JSON.stringify(saida.resumo,null,2)+'\n');
await writeFile(resolve(destino,'modulos-nivel-3.json'),JSON.stringify({versao,modulos:MODULOS_PLANEJADOS,porModulo},null,2)+'\n');
console.log(JSON.stringify(saida.resumo,null,2));

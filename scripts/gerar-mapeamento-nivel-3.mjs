import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const fonte=resolve(process.argv[2]??resolve(raiz,'../../outputs/aventura DnD/Extensao-Owlbear/Mapeamento-SRD-Nivel-10/catalogo-interacoes-nivel-10.json'));
const destino=resolve(raiz,'docs/mapeamento-nivel-3');
const catalogo=JSON.parse(await readFile(fonte,'utf8'));
const normal=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const contem=(s,...termos)=>termos.some(t=>normal(s).includes(normal(t)));

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

const nivelCorrigido=item=>item.nome==='Large Form'&&item.origem==='Goliath'?5:Number(item.nivel_minimo);
const itens=catalogo.itens.filter(item=>item.categoria==='magia'?Number(item.circulo)<=2:nivelCorrigido(item)<=3).map(item=>({...item,nivel_minimo:nivelCorrigido(item),...avaliar(item),avaliado_na_versao:'0.8.6'}));
const contagem=campo=>Object.fromEntries([...new Set(itens.map(x=>x[campo]))].sort().map(valor=>[valor,itens.filter(x=>x[campo]===valor).length]));
const saida={versao:'0.8.6',escopo:'SRD 5.2.1 — todas as classes, subclasses SRD, espécies, talentos, invocações, metamagias, maestrias e magias disponíveis até o nível 3',fonte:'https://www.dndbeyond.com/srd',geradoEm:'2026-11-14',criterios:{PORTAVEL:'O motor atual possui os módulos fundamentais; requer cadastro/teste da definição.',PARCIAL:'O fluxo principal existe, mas uma regra secundária ainda é manual ou específica.',ASSISTIDO:'Pode ser registrado e ter custo, mas a consequência é decidida pelo mestre.',NOVO_MODULO:'Falta uma capacidade reutilizável essencial.'},resumo:{total:itens.length,porCategoria:contagem('categoria'),porPortabilidade:contagem('status_portabilidade')},itens};
await mkdir(destino,{recursive:true});await writeFile(resolve(destino,'catalogo-nivel-3.json'),JSON.stringify(saida,null,2)+'\n');
const campos=['id','nome','categoria','origem','nivel_minimo','circulo','ativacao','custo','recurso','alcance','alvo','formas','rolagem','dano_cura','tipos_dano','buff_debuff','duracao','concentracao','gatilho','status_portabilidade','modelo_extensao','modulos_existentes','lacuna_atual','fonte_secao'];
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
await writeFile(resolve(destino,'catalogo-nivel-3.csv'),[campos.join(','),...itens.map(item=>campos.map(c=>csv(Array.isArray(item[c])?item[c].join('|'):item[c])).join(','))].join('\n')+'\n');
await writeFile(resolve(destino,'resumo.json'),JSON.stringify(saida.resumo,null,2)+'\n');
console.log(JSON.stringify(saida.resumo,null,2));

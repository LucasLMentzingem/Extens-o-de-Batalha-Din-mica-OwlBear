import {readFile,writeFile} from 'node:fs/promises';
import {validar} from './site/engine.mjs';

const ids=['dragoberto','draven-thorne','hannah-montana','loteria','nikki','skimi','zurich'];
const fichas=await Promise.all(ids.map(async id=>validar(JSON.parse(await readFile('./site/fichas/'+id+'.json','utf8')))));
const soldado=validar(JSON.parse(await readFile('./site/fichas/soldado.json','utf8')));
const catalogoVictor=JSON.parse(await readFile('./site/catalogo-victor.json','utf8'));
const semAcento=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const nomesComuns=['agarrar','derrubar','empurrar','desengajar','disparada','esquivar','ajudar','esconder-se','preparar','procurar','estudar','influenciar','utilizar','usar magia','golpe desarmado','ataque de oportunidade'];
const comum=o=>nomesComuns.some(n=>semAcento(o.nome).startsWith(n));
const configurada=o=>Boolean(o.automacao||o.gatilho);
const habilidade=o=>({nome:o.nome,status:configurada(o)?'Automatizada':'Assistida pelo mestre'});
const unicos=xs=>[...new Map(xs.map(x=>[semAcento(x.nome),x])).values()].sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));

const classes=new Map();
for(const f of fichas)for(const c of f.classes){
  const atual=classes.get(c.id)??{id:c.id,nome:c.nome??c.id.replace(/(^|-)(\w)/g,(_,s,l)=>(s?' ':'')+l.toUpperCase()),nivelMax:0,habilidades:[]};
  atual.nivelMax=Math.max(atual.nivelMax,c.nivel);
  atual.habilidades.push(...f.opcoes.filter(o=>!comum(o)).map(habilidade));classes.set(c.id,atual);
}
for(const c of classes.values())c.habilidades=unicos(c.habilidades);

const racas=new Map();
for(const f of fichas){
  const nome=f.especie||'Não informada',chave=semAcento(nome),tokens=chave.split(/\W+/).filter(x=>x.length>3),atual=racas.get(chave)??{nome,habilidades:[]};
  atual.habilidades.push(...f.opcoes.filter(o=>tokens.some(t=>semAcento(o.nome+' '+(o.descricao??'')).includes(t))).map(habilidade));
  atual.habilidades.push(...(f.passivas??[]).filter(p=>tokens.some(t=>semAcento(p.nome+' '+(p.descricao??'')).includes(t))).map(p=>({nome:p.nome,status:'Passiva registrada'})));
  atual.habilidades=unicos(atual.habilidades);racas.set(chave,atual);
}

const comuns=unicos(fichas.flatMap(f=>f.opcoes.filter(comum).map(habilidade)));
const statusItem=i=>i.tipo==='equipamento'&&i.arma?'Ataque e equipamento configurados':i.tipo==='equipamento'?'CA, classe, slot e modificadores configurados':i.tipo==='consumivel'?'Consumível e custo configurados':'Item, peso e carga configurados';
const itens=unicos([
  ...catalogoVictor.itens.map(i=>({nome:i.nome,status:i.categoria==='arma'?'Ataque e equipamento configurados':i.categoria==='armadura'||i.categoria==='escudo'||i.categoria==='veste'?'CA, classe e slot configurados':'Item, preço e slot configurados'})),
  ...[...fichas,soldado].flatMap(f=>(f.inventario?.itens??[]).map(i=>({nome:i.nome,status:statusItem(i)}))),
  ...[...fichas,soldado].flatMap(f=>(f.equipamentos??[]).map(e=>({nome:e.nome??e.name,status:'Registro legado vinculado ao inventário'})))]
 .filter(x=>x.nome));
const modulos=[
  'Ataques, críticos, vantagem e desvantagem','Salvaguardas e perícias','Dano, cura e PV temporários','Ações, bônus, reações e deslocamento',
  'Áreas circulares, quadradas, cones e linhas','Concentração, duração, buffs e condições','Reações preventivas e após dano','Recursos, descansos e economia adicional',
  'Rajadas, múltiplos alvos e alvos repetidos','Dano adicional, rerrolagens e dados concedidos','Empurrão e deslocamento forçado','Alcance máximo de 18 m'
].map(nome=>({nome,status:'Configurado'}));
const sistemaEquipamentos={status:'Configurado',alcanceMaximoM:18,
  calculoArmas:'Atributo da propriedade e do modo + bônus de proficiência do portador quando proficiente + bônus do item e estilo aplicável.',
  danoArmas:'Dado, tipo de dano e propriedades pertencem ao item; o modificador pertence ao portador e é recalculado em cada troca.',
  ataquesVisiveis:'Somente armas equipadas geram ataques. Golpes desarmados permanecem livres.',
  classesArmadura:['sem_armadura (veste)','leve','media','pesada','escudo'],
  propriedadesArmas:['corpo_a_corpo','distancia','acuidade','leve','pesada','versatil','duas_maos','arremessavel','municao'],
  portabilidade:'O item guarda suas próprias classificações, peso, dados, dano, alcance e efeitos; proficiência, atributo, maestria, ataque e dano final são derivados da ficha que o equipa.'};
const catalogo={versaoFormato:1,resumo:{classes:classes.size,racas:racas.size,comuns:comuns.length,itens:itens.length},sistemaEquipamentos,classes:[...classes.values()].sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')),racas:[...racas.values()].sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')),comuns,itens,modulos};
await writeFile('./site/conteudo-configurado.json',JSON.stringify(catalogo,null,2)+'\n');
console.log('Catálogo:',catalogo.resumo);

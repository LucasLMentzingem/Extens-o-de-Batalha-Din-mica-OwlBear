// Derivados leves e camadas compartilhadas. Originais fora de site/.
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let sharp;try{sharp=require('sharp');}catch{sharp=require('C:/Users/Lucas Mentzingem/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');}
const origem='conteudo/arte-originais/efeitos',destino='site/assets/efeitos',manifesto=JSON.parse(await fs.readFile(origem+'/manifesto.json','utf8'));
await fs.mkdir(destino,{recursive:true});const artes={},temas={},medidas=[],pendentes=[];
async function publicar(id,bytes,ext){const hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12),nome=id+'-'+hash+'.'+ext;await fs.writeFile(path.join(destino,nome),bytes);return 'assets/efeitos/'+nome;}
for(const {id} of manifesto.icones){
  let bytes;try{bytes=await fs.readFile(origem+'/'+id+'.png');}catch(e){if(e.code!=='ENOENT')throw e;pendentes.push(id);continue;}
  const meta=await sharp(bytes).metadata();
  const leve=await sharp(bytes).trim({background:'#00000000',threshold:6}).resize(88,88,{fit:'inside'}).extend({top:6,bottom:6,left:6,right:6,background:{r:0,g:0,b:0,alpha:0}}).resize(100,100,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:80,alphaQuality:92,effort:6}).toBuffer();
  artes[id]=await publicar(id,leve,'webp');medidas.push({id,originalBytes:bytes.length,webpBytes:leve.length,originalAlpha:meta.hasAlpha});
}
const paletas={buff:['#17382a','#0a1211','#88b382','#f1d99b'],debuff:['#49202a','#140e14','#9e4f58','#e9ad91'],condicao:['#432c1b','#181114','#ba813f','#f3ce8b'],concentracao:['#123643','#0b111e','#4e9daf','#d3e5db'],neutro:['#302637','#101119','#88728e','#d7c6dd']};
for(const [tipo,[claro,escuro,borda,metal]] of Object.entries(paletas)){
 const shape=tipo==='buff'?'<path d="M9 5h82v58c0 16-22 28-41 33C31 91 9 79 9 63Z"':tipo==='debuff'?'<path d="m5 14 9-9h72l9 9v72l-9 9H14l-9-9Z"':tipo==='concentracao'?'<rect x="5" y="5" width="90" height="90" rx="19"':tipo==='condicao'?'<path d="M15 5h70l10 10v70L85 95H15L5 85V15Z"':'<rect x="5" y="5" width="90" height="90" rx="9"';
 const ornamento=tipo==='buff'?'<path d="M12 20q11-2 13-12m63 12Q77 18 75 8M20 78l10 7m50-7-10 7"/>':tipo==='debuff'?'<path d="m8 24 10-4-4-12m78 16-10-4 4-12M8 76l10 4-4 12m78-16-10 4 4 12"/>':tipo==='concentracao'?'<path d="M20 9q30 15 60 0M9 20q15 30 0 60m11 11q30-15 60 0m11-71q-15 30 0 60"/>':tipo==='condicao'?'<path d="m7 22 7-8 8-7m56 0 8 7 7 8M7 78l7 8 8 7m56 0 8-7 7-8"/>':'<path d="M10 25V10h15m50 0h15v15M10 75v15h15m50 0h15V75"/>';
 const prefix='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">';
 const fundo=prefix+'<defs><radialGradient id="g" cx="45%" cy="30%" r="80%"><stop stop-color="'+claro+'"/><stop offset="1" stop-color="'+escuro+'"/></radialGradient></defs>'+shape+' fill="url(#g)"/><circle cx="50" cy="50" r="32" fill="none" stroke="'+metal+'" opacity=".08"/><path d="M50 20v60M20 50h60" stroke="'+metal+'" opacity=".06"/></svg>';
 const moldura=prefix+'<g fill="none">'+shape+' stroke="#07090e" stroke-width="5"/>'+shape+' stroke="'+borda+'" stroke-width="2"/><g stroke="'+metal+'" stroke-width="1.7" stroke-linejoin="round">'+ornamento+'</g></g><path d="m50 4 3 4-3 4-3-4Z" fill="'+metal+'"/></svg>';
 temas[tipo]={fundo:await publicar('fundo-'+tipo,Buffer.from(fundo),'svg'),moldura:await publicar('moldura-'+tipo,Buffer.from(moldura),'svg')};
}
// Referências incompletas ficam explícitas durante a produção e falham em --check.
for(const id of pendentes)artes[id]='assets/efeitos/PENDENTE-'+id+'.webp';
await fs.writeFile('site/catalogos/artes-efeitos.mjs','// Gerado por gerar-artes-efeitos.mjs. Sem imagens nas fichas ou estado da sala.\nexport const artesEfeitos=Object.freeze('+JSON.stringify(artes,null,2)+');\nexport const artesEfeitosPorNome=Object.freeze('+JSON.stringify(manifesto.porNome,null,2)+');\nexport const temasEfeitos=Object.freeze('+JSON.stringify(temas,null,2)+');\n');
await fs.writeFile(origem+'/derivados.json',JSON.stringify({formato:1,tamanho:100,icones:medidas,pendentes,temas},null,2));
console.log(JSON.stringify({icones:medidas.length,pendentes,originalBytes:medidas.reduce((n,x)=>n+x.originalBytes,0),webpBytes:medidas.reduce((n,x)=>n+x.webpBytes,0)}));
if(process.argv.includes('--check')&&pendentes.length)throw Error('Artes pendentes: '+pendentes.join(', '));

// Reproduz derivados; originais são preservados fora da pasta publicada.
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);let sharp;try{sharp=require('sharp');}catch{sharp=require(process.env.SHARP_MODULE??'C:/Users/Lucas Mentzingem/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');}
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url))),site=path.join(root,'site/assets/habilidades'),archive=path.join(root,'conteudo/arte-originais/habilidades');
for(const dir of [archive,path.join(site,'mini'),path.join(site,'detalhe')])await fs.mkdir(dir,{recursive:true});
const registro={},numeros=[];
for(const nome of (await fs.readdir(site)).filter(x=>x.endsWith('.png')).sort()){
 const original=path.join(archive,nome),publicado=path.join(site,nome);
 if(!original.startsWith(root+path.sep)||!publicado.startsWith(site+path.sep))throw Error('Caminho fora do projeto.');
 let bytes;try{bytes=await fs.readFile(original);}catch(e){if(e.code!=='ENOENT')throw e;bytes=await fs.readFile(publicado);await fs.writeFile(original,bytes,{flag:'wx'});}
 const hash=crypto.createHash('sha256').update(bytes).digest('hex'),stem=nome.slice(0,-4)+'-'+hash.slice(0,12);
 const mini=await sharp(bytes).resize(128,128,{fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer(),detalhe=await sharp(bytes).resize(256,256,{fit:'inside',withoutEnlargement:true}).webp({quality:86}).toBuffer(),compat=await sharp(bytes).resize(128,128,{fit:'inside',withoutEnlargement:true}).png({compressionLevel:9,palette:true,quality:95}).toBuffer();
 await fs.writeFile(path.join(site,'mini',stem+'.webp'),mini);await fs.writeFile(path.join(site,'detalhe',stem+'.webp'),detalhe);await fs.writeFile(publicado,compat);
 registro['assets/habilidades/'+nome]={mini:'assets/habilidades/mini/'+stem+'.webp',detalhe:'assets/habilidades/detalhe/'+stem+'.webp'};
 numeros.push({arquivo:nome,sha256Original:hash,originalBytes:bytes.length,compatBytes:compat.length,miniBytes:mini.length,detalheBytes:detalhe.length});
}
await fs.writeFile(path.join(root,'site/catalogos/miniaturas-habilidades.mjs'),'// Gerado por scripts/otimizar-artes-habilidades.mjs. Originais em conteudo/arte-originais.\nexport const miniaturasHabilidades=Object.freeze(Object.fromEntries('+JSON.stringify(numeros.map(x=>[x.arquivo.slice(0,-4),x.sha256Original.slice(0,12)]))+'\n.map(([nome,hash])=>["assets/habilidades/"+nome+".png",{mini:"assets/habilidades/mini/"+nome+"-"+hash+".webp",detalhe:"assets/habilidades/detalhe/"+nome+"-"+hash+".webp"}])));\n');
await fs.writeFile(path.join(archive,'derivados.json'),JSON.stringify({formato:1,larguras:{mini:128,detalhe:256,compat:128},arquivos:numeros},null,2)+'\n');
console.log(JSON.stringify({arquivos:numeros.length,originalBytes:numeros.reduce((n,x)=>n+x.originalBytes,0),publicadosBytes:numeros.reduce((n,x)=>n+x.compatBytes+x.miniBytes+x.detalheBytes,0)},null,2));

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE||'sharp');
const origem='conteudo/arte-originais/recursos',destino='site/assets/recursos',mapa={};
await fs.mkdir(destino,{recursive:true});
let antes=0,depois=0;
for(const nome of (await fs.readdir(origem)).filter(x=>/\.(png|webp)$/.test(x)).sort()){
 const original=await fs.readFile(path.join(origem,nome));
 const bytes=await sharp(original).resize(100,100,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:78,alphaQuality:90,effort:6}).toBuffer();
 const id=path.parse(nome).name,hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12),arquivo=id+'-'+hash+'.webp';
 await fs.writeFile(path.join(destino,arquivo),bytes);mapa[id]='assets/recursos/'+arquivo;antes+=original.length;depois+=bytes.length;
}
await fs.writeFile('site/catalogos/artes-recursos.mjs','// Gerado por gerar-artes-recursos.mjs. WebP 100 × 100, com hash de conteúdo.\nexport const artesRecursos=Object.freeze('+JSON.stringify(mapa,null,2)+');\n');
console.log(JSON.stringify({arquivos:Object.keys(mapa).length,originaisBytes:antes,producaoBytes:depois,reducaoPercentual:Math.round((1-depois/antes)*10000)/100}));

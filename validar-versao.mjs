import {readFile,readdir} from 'node:fs/promises';

const manifest=JSON.parse(await readFile(new URL('./site/manifest.json',import.meta.url),'utf8')),m=/^0\.8\.(\d{1,2})$/.exec(manifest.version);
if(!m||Number(m[1])>99)throw Error('A versão deve permanecer entre 0.8.0 e 0.8.99 salvo decisão explícita do responsável pelo projeto.');
const divergentes=[];
for(const nome of await readdir(new URL('./site/',import.meta.url))){
  if(!/\.(?:mjs|html|css)$/.test(nome))continue;
  const texto=await readFile(new URL('./site/'+nome,import.meta.url),'utf8');
  for(const achado of texto.matchAll(/\?v=(\d+\.\d+\.\d+)/g))if(achado[1]!==manifest.version)divergentes.push(nome+': '+achado[1]);
}
if(divergentes.length)throw Error('Parâmetros de cache divergentes de '+manifest.version+':\n'+divergentes.join('\n'));
console.log('Versão válida e sincronizada:',manifest.version);

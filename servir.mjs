import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const dir=fileURLToPath(new URL('./site/',import.meta.url));
const porta=Number(process.argv[2]??4178);
const mime={'.html':'text/html','.json':'application/json','.css':'text/css','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    const filename=path.resolve(dir,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!filename.startsWith(dir))throw Error();
    const body=await readFile(filename);
    res.writeHead(200,{'Content-Type':(mime[path.extname(filename)]??'application/octet-stream'),'Cache-Control':'no-cache','Access-Control-Allow-Origin':'*'});res.end(body);
  }catch{res.writeHead(404);res.end();}
});
server.listen(porta,'127.0.0.1',()=>console.log('Simulador: http://127.0.0.1:'+porta+'/'));


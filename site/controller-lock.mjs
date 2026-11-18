// Um background por sala e origem. O navegador libera o lock se a página cair.
export async function adquirirControleLocal(nome,{locks=globalThis.navigator?.locks,alvo=globalThis}={}){
 if(!locks)return ()=>{};
 return new Promise((resolve,reject)=>{
  locks.request(nome,{ifAvailable:true},async lock=>{
   if(!lock){resolve(null);return;}
   let liberar;const espera=new Promise(r=>liberar=r);
   alvo.addEventListener?.('pagehide',liberar,{once:true});
   resolve(()=>{alvo.removeEventListener?.('pagehide',liberar);liberar();});
   await espera;
  }).catch(reject);
 });
}

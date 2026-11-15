import {ns,emSala} from './bridge.mjs?v=0.8.19';
import OBR from './vendor/sdk.mjs';

export const chaveCatalogo=ns+'/catalogo-aberto/'+(emSala?OBR.room.id:'ensaio');

export function catalogoAberto(atorId){
  try{
    const estado=JSON.parse(localStorage.getItem(chaveCatalogo));
    return estado?.atorId===atorId&&estado.expiraEm>Date.now()?estado:null;
  }catch{return null;}
}

export function publicarCatalogo(sessao,atorId,lojaId){
  localStorage.setItem(chaveCatalogo,JSON.stringify({sessao,atorId,lojaId,expiraEm:Date.now()+3500}));
}

export function limparCatalogo(sessao){
  try{
    const atual=JSON.parse(localStorage.getItem(chaveCatalogo));
    if(!sessao||atual?.sessao===sessao)localStorage.removeItem(chaveCatalogo);
  }catch{localStorage.removeItem(chaveCatalogo);}
}

import OBR from './vendor/sdk.mjs';
import {ns,pronto,sala} from './bridge.mjs?v=0.8.71';
const root=document.querySelector('#painel'),aviso=document.querySelector('#aviso');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let s,info,api,tokenId,ocupado=false;
const recipiente=()=>s?.recipientes?.find(r=>r.tokenId===tokenId||r.tokenId+'-selecao'===tokenId);
function render(){
  if(!s)return;if(info.role!=='GM'){root.innerHTML='<p>Use a habilidade Saquear para recolher itens.</p>';return;}
  const r=recipiente();if(r?.tipo==='chao'){root.innerHTML='<h1>'+esc(r.nome)+'</h1><p>Item no chão · seleção circular de 1 m.</p><p>Recolha pela habilidade Saquear.</p>';return;}
  root.innerHTML='<h1>La Arte · '+(r?'recipiente':'configurar recipiente')+'</h1><label>Nome<input id="nome" maxlength="80" value="'+esc(r?.nome??'Baú')+'"></label><div class="linha"><label>Espaços<input id="slots" type="number" min="'+Math.max(1,r?.itens?.length??r?.ocupados??0)+'" max="200" value="'+(r?.capacidadeSlots??12)+'"></label><label><span>Trancado</span><input id="trancado" type="checkbox" '+(r?.trancado?'checked':'')+'></label></div><button id="salvar" class="primario">Salvar</button><p>O conteúdo fica no Inventário do baú. Para recolher itens, use a habilidade Saquear.</p>';
}
root.onclick=async e=>{
  if(e.target.id!=='salvar'||ocupado||info.role!=='GM')return;ocupado=true;
  try{const r=recipiente(),dados={nome:document.querySelector('#nome').value,capacidadeSlots:Number(document.querySelector('#slots').value),trancado:document.querySelector('#trancado').checked};
    await api.enviar({tipo:r?'configurarRecipiente':'criarRecipiente',tipoRecipiente:'caixa',tokenId:r?.tokenId??tokenId,recipienteId:r?.id,rev:s.rev,...dados});aviso.textContent='Configuração salva.';
  }catch(e){aviso.textContent=e.message;}finally{ocupado=false;}
};
await pronto();tokenId=(await OBR.player.getSelection())?.[0];api=await sala((estado,dados)=>{s=estado;info=dados;render();});
OBR.player.onChange(p=>{tokenId=p.selection?.[0];render();});await api.notify();

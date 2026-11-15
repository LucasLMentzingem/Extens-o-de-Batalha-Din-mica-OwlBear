// As regras usam metros contínuos. Somente a fronteira com o mapa usa pixels.
export const METROS_POR_CELULA=1.5;

export function pixelsPorMetro(dpi){
  if(!Number.isFinite(dpi)||dpi<=0)throw Error('Resolução da cena inválida.');
  return dpi/METROS_POR_CELULA;
}

// A régua nativa deve mostrar a mesma escala usada pela extensão.
export async function configurarEscalaCena(grid){
  const [escala,medicao]=await Promise.all([grid.getScale(),grid.getMeasurement()]);
  if(escala.parsed?.multiplier!==METROS_POR_CELULA||escala.parsed?.unit!=='m')await grid.setScale('1.5m');
  if(medicao!=='EUCLIDEAN')await grid.setMeasurement('EUCLIDEAN');
}

// Estados anteriores tratavam uma célula como 1 m. Preservar as posições no
// desenho exige converter os pontos salvos, sem alterar raios ou recursos.
export function migrarEscalaCena(estado){
  const anterior=estado.escalaMetrosPorCelula??1;
  if(anterior===METROS_POR_CELULA)return false;
  if(!Number.isFinite(anterior)||anterior<=0)throw Error('Escala salva inválida.');
  const fator=METROS_POR_CELULA/anterior,vistos=new WeakSet();
  const converter=p=>{
    if(!p||vistos.has(p))return;
    vistos.add(p);
    if(Number.isFinite(p.x))p.x*=fator;
    if(Number.isFinite(p.y))p.y*=fator;
  };
  for(const a of estado.atores??[])converter(a);
  for(const z of estado.zonas??[]){converter(z.centro);converter(z.geometria?.origem);}
  for(const p of estado.pecas??[])converter(p.posicao);
  for(const e of estado.eventosZona??[]){converter(e.origem);converter(e.destino);}
  // Uma trajetória aprovada na escala anterior precisa ser selecionada outra
  // vez para recalcular os pontos de oportunidade e o custo de movimento.
  if(estado.movimentoPendente){
    delete estado.movimentoPendente;
    if(estado.reacaoPendente?.gatilho==='sair_alcance')delete estado.reacaoPendente;
    (estado.historico??=[]).unshift('Escala atualizada para 1,5 m por célula. Selecione novamente o movimento pendente.');
  }
  estado.escalaMetrosPorCelula=METROS_POR_CELULA;
  estado.rev=(estado.rev??0)+1;
  return true;
}

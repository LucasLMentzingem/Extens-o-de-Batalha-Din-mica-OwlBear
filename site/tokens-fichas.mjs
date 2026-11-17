// Artes locais para Criar token desta ficha; nenhuma URL fornecida pela ficha é executada.
const padrao={arquivo:'./icone.svg',mime:'image/svg+xml',largura:64,altura:64};
const artes={
  soldado:{arquivo:'./fichas/soldado.png',mime:'image/png',largura:1254,altura:1254},
  'saco-de-pancadas':{arquivo:'./assets/tokens/treino/saco-de-pancadas.png',mime:'image/png',largura:1254,altura:1254}
};
export const visualTokenFicha=ficha=>({...artes[ficha?.id]??padrao});

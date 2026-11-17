// Registro central de artes 500 × 500. Não copiar imagens para as fichas.
const pasta='assets/habilidades/';
export const artesHabilidades=Object.freeze({
  'comum.soco':{arquivo:pasta+'comum-soco.png',alt:'Punho pronto para um golpe desarmado'},
  'pericia.investigacao':{arquivo:pasta+'comum-pericia.png',alt:'Lupa, diário e pena representando Investigação'},
  'magia.saraivada-de-espinhos':{arquivo:pasta+'magia-saraivada-espinhos.png',alt:'Rajada de espinhos mágicos em leque'},
  'magia.misseis-magicos':{arquivo:pasta+'magia-misseis-magicos.png',alt:'Três dardos mágicos em trajetórias paralelas'},
  'magia.raio-de-fogo':{arquivo:pasta+'magia-raio-fogo.png',alt:'Projétil mágico de fogo'},
  'monge.torrente-de-golpes':{arquivo:pasta+'monge-torrente-golpes.png',alt:'Dois golpes desarmados em sequência'},
  'salvaguarda.for':{arquivo:pasta+'salvaguarda-for.png',alt:'Punho de pedra resistindo a uma força'},
  'salvaguarda.des':{arquivo:pasta+'salvaguarda-des.png',alt:'Adaga veloz e pena representando destreza'},
  'salvaguarda.con':{arquivo:pasta+'salvaguarda-con.png',alt:'Coração protegido por escudo representando constituição'},
  'salvaguarda.int':{arquivo:pasta+'salvaguarda-int.png',alt:'Livro arcano representando inteligência'},
  'salvaguarda.sab':{arquivo:pasta+'salvaguarda-sab.png',alt:'Olho atento representando sabedoria'},
  'salvaguarda.car':{arquivo:pasta+'salvaguarda-car.png',alt:'Máscara e voz representando carisma'},
  'variante.arremesso':{arquivo:pasta+'variante-arremesso.png',alt:'Arma voando em arco, símbolo de arremesso'}
});
export const temasHabilidades=Object.freeze({
  comum:{fundo:pasta+'temas/comum-fundo.svg',moldura:pasta+'temas/comum-moldura.svg'},
  raca:{fundo:pasta+'temas/raca-fundo.svg',moldura:pasta+'temas/raca-moldura.svg'},
  classe:{fundo:pasta+'temas/classe-fundo.svg',moldura:pasta+'temas/classe-moldura.svg'}
});

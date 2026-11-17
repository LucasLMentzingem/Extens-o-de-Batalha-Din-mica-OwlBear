# La Arte 0.8.54

Reanimar um corpo agora troca a imagem do mesmo token pela arte fornecida de Zumbi ou Zumbigoblin. As imagens originais da aventura foram copiadas sem edição para `site/assets/tokens/cemiterio/`. Ambos ocupam uma célula de 1,5 m; a definição de DPI da imagem mantém essa medida em diferentes resoluções de cena.

O ID e os vínculos do token permanecem, assim como posição, rotação, visibilidade, bloqueio, rótulo e anexos. A imagem, alinhamento e escala anteriores ficam resguardados na sobreposição e em um marcador da peça. Remover a sobreposição restaura o visual anterior, mantendo a posição atual. O processo também sincroniza camadas já salvas da 0.8.53 e se recupera de falhas visuais do SDK sem recriar tokens ou repetir custos mecânicos. A segunda morte conserva a arte de morto-vivo e o loot restante.

Testes: 340 aprovados. Inclui sete testes novos de sincronização/restauração e oito testes cruzados: ataques de cada um dos sete aventureiros contra as 11 fichas da aventura, ataques no sentido inverso (154 execuções), cura e Bênção do padre para os sete aventureiros. Também permanece a cobertura anterior de saque, sobreposição, adagas, custos, concentração e Sopro de Dragão. Os testes do SDK usam um adaptador simulado; não representam uma validação em sala real.

[Manifesto 0.8.54](https://lucaslmentzingem.github.io/Extens-o-de-Batalha-Din-mica-OwlBear/manifest-0.8.54.json) · [Grupo importável](https://lucaslmentzingem.github.io/Extens-o-de-Batalha-Din-mica-OwlBear/downloads/aventura-no-cemiterio.zip).

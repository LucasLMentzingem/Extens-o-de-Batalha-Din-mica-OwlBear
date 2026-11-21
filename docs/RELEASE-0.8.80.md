# Versão 0.8.80 — B: barra flutuante de buffs e debuffs

Após validar A e a correção de estabilidade, o responsável autorizou a etapa B. A barra deixa a lateral do retrato e ocupa a faixa inferior esquerda marcada na referência, entre Extras e as ferramentas centrais do Owlbear.

## Comportamento

- **Dez efeitos em uma linha**. Acima de dez, scroll horizontal no mesmo padrão da grade; roda do mouse e arraste do scrollbar também funcionam. Não há scroll vertical.
- A janela tem a largura do conteúdo até dez posições: um único efeito não deixa uma superfície invisível de dez espaços sobre o mapa.
- Ícones variam conforme a largura: 60 px na referência de 1920 px, 35 px em 1366 px. Em telas estreitas, a barra sobe acima das ferramentas e mantém dez slots proporcionais. A reserva central considerada é de 420 px; posições personalizadas de outras extensões devem ser conferidas na mesa real.
- O rodapé sobe o necessário para não cobrir a barra. Atividades continua acima dele. Compactar não desloca nem recria o documento dos efeitos.
- Aa alterna os nomes e mantém os contadores. Texto sobre a arte sem faixa opaca; dicas mostram descrição, modificadores e duração. A atualização usa nós e imagens existentes e conserva o scroll.

## Artes e estados

O levantamento cobre as **14 condições do motor**, efeitos declarados no catálogo/fichas e estados gerados durante o combate/protótipos. A habilidade ou item de origem tem prioridade: Emaranhar, Golpe Constritor, Invisibilidade, Escudo da Fé, Orientação e outros reutilizam seus próprios ícones. Efeitos de maestria reconhecem a arma de origem.

Foram produzidos **25 ícones inéditos** pelo subagente **GPT 6 Luna**, com geração de imagens built-in. Os originais transparentes ficam em `conteudo/arte-originais/efeitos/`; os WebP publicados têm **100×100 px** e somam **146.668 bytes** (aproximadamente 143 KiB), contra 29.875.800 bytes dos originais. Cinco fundos e cinco molduras SVG leves compartilham o modelo de camadas dos temas já existentes.

Buff: verde/dourado em formato de escudo; debuff: vinho/cobre com recortes; condição: âmbar chanfrado; concentração: azul/prata trançado; marcador neutro: violeta/prata. Sinais +/−/!/◉/• reforçam a distinção sem depender só de cor. Invisibilidade é benéfica; expulsão é prejudicial mesmo quando o protótipo guarda `tipo:buff`.

A projeção local inclui concentração, Bênção no alvo, Desengajado, PV temporários e estados Inconsciente/Estável/Morto, sem modificar as regras. Não duplica Inconsciente já explícito e não revela saldo de PV temporários de NPC ao jogador. Resoluções instantâneas e traços permanentes não ganham status fictícios.

[Lista completa de efeitos, artes reutilizadas e artes geradas](INVENTARIO-EFEITOS-B.md).

## Validação

- **508 testes automatizados aprovados**, incluindo geometria, projeção sem mutação, classificação, privacidade, origem dos ícones, HTML escapado e existência/peso dos assets.
- **21 verificações específicas de B**: 1/10/11/25 efeitos, mestre/jogador, linha única, scroll horizontal, imagens carregadas, posição, Aa e contador, dica, avanço de duração sem recriar imagens, viewports e rodapé compacto/expandido.
- **24 verificações gerais** da HUD e **7 de estabilidade** da 0.8.79 aprovadas.
- **8 regressões do A**, com **160 cliques chegando ao canvas local**, além dos arrastes.
- Versão/cache e catálogo válidos. Nenhuma ficha ou regra de combate alterada; nenhum navegador do responsável controlado.

Os ensaios de navegador usam SDK/host simulados localmente, com SDK verdadeiro nos medidores internos. A prévia é do ambiente de teste. A posição final entre ferramentas nativas e outras extensões deve ser validada na sala autenticada.

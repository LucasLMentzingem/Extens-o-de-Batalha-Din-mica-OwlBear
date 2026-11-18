# Alcance e áreas pela hitbox — 0.8.67, 18/11/2026

Pedido: ataques e habilidades devem alcançar o círculo do token do alvo; áreas devem afetar criaturas cujo círculo encoste nelas, sem exigir seu centro dentro da área.

## Regra aplicada

- A origem e o círculo de alcance desenhados permanecem iguais. A distância até a borda da hitbox do alvo passa a decidir a elegibilidade, incluindo tangência. O raio do atacante não é somado ao alcance.
- Hitbox circular inscrita nas dimensões do token, calculada em metros pelo DPI da imagem e sua escala. Espelhamento, rotação e pivô deslocado são considerados. Tokens sem geometria válida conservam o comportamento de ponto.
- Círculos, quadrados, cones e linhas usam interseção geométrica com o disco. Cantos são calculados pela distância real à borda, evitando a inclusão indevida de quem só toca a caixa retangular ampliada.
- HUD e autoridade do mestre usam o mesmo módulo. A autoridade lê as dimensões da cena, sem aceitar tamanho de hitbox pelo comando do jogador. Mudanças de tamanho atualizam a seleção e invalidam resultados pendentes que dependiam da geometria anterior.
- Aplicado a ataques simples/compostos, listas, curas/efeitos, áreas adicionais, protótipos de cemitério e alcance de reações. Oportunidades só surgem ao sair completamente do alcance; a prévia usa o mesmo cálculo do motor.
- Zonas persistentes consideram a hitbox nos gatilhos de turno e na entrada/travessia. A metragem do percurso e o custo do terreno continuam medidos pelo trajeto da peça.
- Pontos de lançamento no chão, teleporte e movimento mantêm seus limites de distância. O Sopro de Dragão mantém o cone triangular de 4,5 m ancorado no conjurador e sua exclusão da área.

## Verificação

- Suíte completa: 439 testes aprovados, sem falhas. Versão e catálogo verificados; `git diff --check` aprovado.
- Casos de geometria e motor em `target-geometry.test.mjs`: tangência, diagonal, redimensionamento, pivô, bordas/cantos, área persistente, oportunidade, composição real da Loteria, lista de cura e Animar Mortos com sobreposição preservada.
- Navegador com SDK simulado, mestre e jogador: sete cenários completos de seleção, rolagem e aplicação (corpo a corpo dentro/fora de combate, distância, círculo, cone, linha e quadrado). Alvo na borda sofre dano; vizinho logo fora permanece intacto. Redimensionamento invalida/reabilita a seleção sem F5.
- Evidências locais em `work/hitbox/`: script, JSON e capturas. Não houve alteração em uma sala real.

Incorporado à versão 0.8.67; publicação autorizada pelo responsável em 18/11/2026.

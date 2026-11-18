# Versão 0.8.67 — alcance e áreas pela hitbox

Ataques e habilidades passam a aceitar alvos quando o círculo da hitbox toca o alcance, incluindo tangência. Áreas circulares, quadradas, cones e linhas afetam criaturas pela interseção com esse círculo, sem exigir o centro do token dentro. O tamanho acompanha as dimensões e a escala da peça; pivô e rotação também são considerados.

A HUD e o motor do mestre usam o mesmo cálculo, com dimensões obtidas diretamente da cena. A regra cobre ataques compostos, listas de alvos, efeitos/curas, áreas adicionais, protótipos de cemitério e zonas persistentes. Mudanças de escala atualizam a seleção e invalidam resultados pendentes que dependiam da geometria anterior. Oportunidades só disparam ao sair completamente do alcance, com a mesma previsão na HUD.

Preservados o cone triangular de 4,5 m do Sopro de Dragão, sua ancoragem e exclusão do conjurador, os limites de pontos no chão, teleporte e movimento, e os ajustes anteriores de ficha, recursos e atividades.

Validação: 439 testes aprovados. Sete cenários completos no navegador com SDK simulado, mestre e jogador: corpo a corpo dentro/fora de combate, ataque à distância, círculo, cone, linha e quadrado. Em todos, o alvo tocando a borda foi atingido e o vizinho logo fora permaneceu intacto; redimensionamento atualizou a seleção sem F5. Catálogo, versão e diff verificados. Não houve homologação autenticada em sala real.

Publicação autorizada pelo responsável. Detalhes em [FIX-ALCANCE-HITBOX.md](FIX-ALCANCE-HITBOX.md).

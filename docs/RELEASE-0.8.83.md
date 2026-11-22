# Versão 0.8.83 — Dados de Vida paralelos e confirmação de habilidades

Descanso curto abre uma escolha por personagem jogador elegível. Cada dono escolhe a quantidade de Dados de Vida e rola; o mestre acompanha pendências, rola por ausentes, dispensa ou reabre escolhas sem restaurar recursos novamente. Constituição é somada em cada dado, com mínimo de 1 PV por dado, limite de PV máximos e gasto dos dados escolhidos. Multiclasse permite selecionar por tipo e exige conferir a distribuição de saldos legados quando ela não era conhecida.

Rolagens públicas podem ocorrer em paralelo. Cura, desconto e conclusão são persistidos juntos; F5 recupera a participação e os resultados registrados sem rerrolar. Resultado ainda não registrado após interrupção requer conferência manual do mestre. Atividades da mesa recebe participantes com token e filtro Descanso curto. Prece de Cura concede a mesma escolha aos PJs elegíveis depois de seus efeitos habituais.

A versão inclui a segunda verificação de habilidades já desenvolvida localmente: declarações narrativas e usos fora de contexto mostram consequências e custos antes do gasto. Adicionais pós-acerto, rerrolagens e reações automáticas são encaminhados à instância correspondente. O aceite fica vinculado à intenção e às condições relevantes, com recibo contra repetição. Astúcia Mágica utiliza seu minuto de recuperação persistente e pode ser cancelada sem consumo antecipado.

Nenhuma ficha precisa ser reimportada. Favoritos, ícones, geometria/transparência da HUD, sobreposição de zumbis e o fix de Sopro de Dragão são preservados.

## Verificação

- 558 testes Node, incluindo 21 casos novos de Dados de Vida e estresse com 12 PJs partindo da mesma revisão.
- 13 cenários de interface/retomada de descanso em Chromium headless com SDK/Dice+ simulados; verificações da segunda confirmação e regressões do problema A, incluindo 160 cliques no canvas.
- Versão/cache e catálogo runtime verificados. A sala autenticada do usuário não foi controlada.

Publicação autorizada em 22/11/2026. Manifesto normal: https://lucaslmentzingem.github.io/Extens-o-de-Batalha-Din-mica-OwlBear/manifest.json

[Descanso curto: implementação e limites](IMPLEMENTACAO-DESCANSO-CURTO-DADOS-DE-VIDA-2026-11-22.md) · [Segunda verificação: implementação e limites](IMPLEMENTACAO-SEGUNDA-VERIFICACAO-2026-11-21.md).

Original prompt: Implementar ajuste de rolagens antes de ataques, grade da HUD configurável de 1 a 5 linhas, reações automáticas com janela de 20 segundos, salvaguardas pelo atributo, lista completa de períícias, HUD compactável, foco de câmera pelo carrossel e ataques de oportunidade que interrompem o movimento no ponto do acerto.

## Estado

- Versão publicada antes desta etapa: 0.3.0.
- O motor já resolve ataques, magias, múltiplos alvos e custos de ação.
- A HUD já possui carrossel, barra de habilidades, seleção no mapa e confirmação de movimento.

## Trabalho desta etapa

- [x] Ajustes com dados extras e modificador antes de ataques.
- [x] Grade da HUD de 1 a 5 linhas.
- [x] Reação automática de ataque de oportunidade com tempo de 20 segundos.
- [x] Seta de ameaça no trajeto e interrupção do movimento no acerto.
- [x] Perícias em botões e salvaguardas por clique direito nos atributos.
- [x] HUD compactável pelo retrato e foco de câmera pelo carrossel.
- [x] Testes do motor, integração simulada e inspeção visual.

## Notas da implementação

- O deslocamento ameaçado fica pendente no estado da sala; recusar ou errar continua o trajeto, acertar move até o ponto exato de saída do alcance e encerra esse deslocamento.
- O ataque de oportunidade escolhe o melhor ataque corpo a corpo automatizado da ficha e sempre alveja quem iniciou o movimento.
- O formato aceita até quatro fórmulas de dados extras por rolagem, além do modificador estático entre -20 e +20.
- Testes unitários: 18 aprovados após a primeira implementação.
- O primeiro teste de navegador encontrou o cronômetro reconstruindo os botões a cada meio segundo; o contador passou a atualizar apenas o texto para não interromper cliques ou apagar ajustes digitados.
- Integração simulada aprovada para ajuste pré-ataque, seta de oportunidade, reação com dados extras, interrupção do movimento, grade de uma linha, HUD compacta, foco de câmera, 18 perícias e salvaguarda por clique direito.
- Inspeção visual concluída nas capturas `work/reacao-oportunidade-v04.png`, `work/pericias-v04.png` e `work/ficha-selecionada-v04.png`.

## Etapa seguinte: testes rápidos na HUD

- [x] Abas Perícias e Salva guarda ao lado de Linhas.
- [x] Dezoito perícias com os bônus da ficha ou o modificador do atributo quando não declaradas.
- [x] Seis salvaguardas com os bônus da ficha.
- [x] Rolagens disponíveis fora do turno e sem consumir ação, bônus ou reação.
- [x] Testar a revisão antes e durante o combate.
- [x] Publicar a revisão 0.4.1.

- Testes finais: 19 testes do motor, integração simulada da HUD e cliente de navegador sem erros novos.
- Capturas conferidas: `work/pericias-hud-v041.png` e `work/pericias-pre-combate-v041.png`.


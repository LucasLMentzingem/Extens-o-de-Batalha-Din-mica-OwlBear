# Versão 0.8.68 — movimento dinâmico

Botão **Movimento dinâmico** acima do Mover tradicional no rodapé. A escolha é local e funciona durante o turno do personagem em combate. Com o modo ligado, o cursor prevê trajeto/custo/perigos e clicar no mapa já ordena o movimento.

Ao selecionar uma habilidade fora do alcance, a extensão procura a posição mais próxima que permita executá-la, respeitando a hitbox dos alvos. A carta mostra **custo de movimento / deslocamento disponível**, em metros, junto aos outros recursos; **Mover e executar** confirma a sequência. Áreas mantêm o ponto escolhido, cones/linhas continuam ancorados no conjurador e seleções múltiplas precisam de uma posição comum válida.

O percurso é sempre reto, inclusive por áreas prejudiciais. Não há busca de desvios; para desviar, mova manualmente antes de selecionar a habilidade. Terreno difícil entra no custo e efeitos de entrada das zonas são resolvidos na ordem do percurso. Uma condição que impeça continuar interrompe a sequência.

Ataques de oportunidade são resolvidos antes da habilidade. Recusa/erro permitem continuar; acerto para no ponto da oportunidade e cancela a habilidade, sem cobrar ação, espaço ou outros recursos dela. Só o deslocamento efetivamente percorrido é descontado, incluindo o terreno atravessado. Dano e custos da reação são resolvidos normalmente; acerto que cause zero dano também interrompe.

Movimento e habilidade usam etapas persistentes da mesma execução. Cada trecho concluído é confirmado antes da etapa seguinte; recarregar jogador/mestre retoma a espera ou o resultado sem repetir movimento, rolagem ou cobrança. Reações vinculadas aparecem nas Atividades da mesa e podem ser atendidas mesmo enquanto a própria habilidade está pausada. Cancelamentos/erros limpam a continuação, conservando o que já foi percorrido e resolvido. Bases antigas das etapas são liberadas para não duplicar toda a mesa a cada trecho.

Validação: **451 testes** aprovados. Oito cenários completos em navegador com SDK simulado, GM e jogador: caminho livre e movimento por clique, oportunidade com acerto/erro, recuperação de ambas as sessões durante reação e durante resultado, cancelamento com retomada de novo movimento, área que prende e cone previsto a partir da posição futura. Conferidos custo, posição, PV e recursos da habilidade. Reação ao dano atendida pelo botão real do próprio jogador durante sua ação pausada. Regressão de perícias/salvaguardas em seis contextos e 12 layouts (1920×1080 a 480×380), conservando margem direita de 75 px e dados acima da carta. Cliente Playwright da skill executado e capturas revisadas. Sem homologação autenticada em sala real.

Sopro de Dragão, alcance pela hitbox, recursos, abas da ficha e demais correções publicadas preservados. Publicação autorizada pelo responsável.

# Versão 0.8.69 — trajetória somente após clicar

Removida a prévia contínua do movimento dinâmico ao passar o cursor pelo mapa. Mover o mouse não calcula/desenha trajetos nem atualiza o custo no rodapé. A trajetória é definida após o clique, e permanece estável enquanto o cursor se move.

Clique no chão continua ordenando movimento. Selecionar o alvo ou ponto de uma habilidade continua mostrando o caminho planejado e o custo de movimento na carta antes de **Mover e executar**. Preservados percurso reto, hitbox, áreas, oportunidades, cancelamento sem gasto da habilidade e recuperação após F5.

Verificação em navegador com SDK simulado: oito cenários de movimento dinâmico; em cada um, 25 movimentos de cursor antes da seleção não criam marcas e 25 depois do clique não alteram o plano. Conferidos os fluxos de clique para andar, habilidade, oportunidade com acerto/erro, área prejudicial, cone, cancelamento e recarga durante reação/resultado. Cliente Playwright da skill executado e capturas revisadas. Suíte completa, catálogo e versão verificados antes da publicação. Sem homologação autenticada em sala real.

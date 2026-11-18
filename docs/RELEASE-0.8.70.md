# Versão 0.8.70 — movimento confirmado pela instância

No movimento dinâmico, clique e duplo clique no mapa apenas selecionam o destino e abrem/atualizam a instância. A execução acontece exclusivamente pelo botão **Mover e executar** da instância; o envio automático após selecionar foi removido.

Ao ativar o modo, o círculo estático de deslocamento disponível aparece no mapa, como no Mover tradicional. Ele acompanha o saldo e a posição após executar, reaparece ao cancelar uma seleção e desaparece ao desligar o modo ou perder o turno. Não acompanha o cursor. A seleção de destino além do círculo é bloqueada antes de gravar o ponto; custo adicional de terreno e de levantar também é validado antes de aceitar a seleção. Habilidades continuam considerando alcance próprio mais a aproximação possível; seleções sem deslocamento suficiente são rejeitadas.

Verificação com SDK simulado, GM e jogador: área inicial de 9 m, clique e duplo clique sem alterar posição/revisão/saldo, rejeição fora da área, execução somente pela instância e uma única vez, atualização da área para 6 m após mover 3 m, aceitação da borda e remoção ao desligar. Oito cenários anteriores de movimento dinâmico revalidados com confirmação explícita, incluindo oportunidades, zonas, cone, cancelamento e F5. Cliente Playwright executado e captura da instância revisada. Suíte completa, versão e catálogo conferidos antes de publicar. Sem homologação autenticada em sala real.

Preservadas as etapas persistentes, a regra de hitbox, a interrupção por oportunidade sem consumir a habilidade, o custo do percurso e o Sopro de Dragão.

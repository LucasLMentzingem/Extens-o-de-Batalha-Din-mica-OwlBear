# Versão 0.8.76 — restauração da largura máxima da HUD

Restaura o teto antigo de **1120 px** para o rodapé. O cálculo automático continua respeitando a grade, a linha completa de recursos e os controles, mas nunca amplia a janela além desse máximo. A região disponível na viewport ou ao lado da carta pode limitar a largura ainda mais.

Quando os recursos ou habilidades excedem a largura permitida, usam a rolagem horizontal existente. O teto também vale para a estimativa inicial, antes da primeira medição do conteúdo.

Por esclarecimento do responsável, esta revisão trata somente da largura máxima. O plano B de popovers separados e o tema dos carrosséis de turnos/ferramentas GM não fazem parte desta entrega. O comportamento dos espaços transparentes internos da 0.8.75 permanece, para uma tarefa específica posterior se desejada.

Validação: **489 testes** aprovados, versão e catálogo conferidos; ensaio de HUD com SDK simulado, duas sessões, incluindo linhas, recursos, cartas e larguras de viewport até 3840 px. Nenhuma ficha, arte ou regra de combate alterada.

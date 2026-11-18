# Versão 0.8.64 — custo disponível e carta durante rolagens

Os recursos nas instâncias de habilidades exibem **custo / recursos atuais**. Uma ação que custa 1 Foco quando restam 2 mostra 1/2. A barra do personagem conserva atual/máximo, por exemplo 2/3. A dica acessível distingue custo, saldo e capacidade. O padrão vale para todos os custos da instância, no cabeçalho e junto à execução; Aa conserva os números.

Corrigido o desaparecimento da carta ao abrir uma rolagem: ela permanece durante ajuste, dados em trânsito e resultado. Quando a atividade atual é uma salvaguarda filha, a carta de origem continua visível. A altura deixa de ser forçada a 338 px durante a execução; controles de executar/alterar ficam bloqueados para preservar a jogada aceita. O painel de dados usa espaço lateral quando disponível, sem sobrepor a carta em telas com espaço suficiente. Em telas estreitas todos os painéis podem não caber lado a lado.

Conteúdo, regras mecânicas e artes otimizadas anteriores preservados, incluindo Sopro de Dragão, sobreposição/loot e posição de Atividades acima do rodapé. Não há novo pacote de imagens.

Validação com SDK/Dice+ simulados: caso de Torrente com 1/2 na instância e 2/3 na barra, Aa e 32 combinações de custo/saldo; ataque e salvaguarda com jogador, GM e observador, em ajuste, rolagem e resultado, seguidos de conclusão única. Sete regressões anteriores de salvaguardas, recargas, paralelo, prioridade e fila passaram (F03/F04/F05/F09/F14/F15/F16). Suíte completa, versão e catálogo verificados antes da publicação. Capturas revisadas e cliente da skill executado durante a implementação. Sem homologação autenticada em sala real.

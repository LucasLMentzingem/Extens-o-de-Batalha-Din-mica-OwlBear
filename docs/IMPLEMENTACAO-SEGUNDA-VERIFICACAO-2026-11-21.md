# Segunda verificação de habilidades — implementação local

Implementada em 21/11/2026 sobre a versão publicada 0.8.82. Ainda sem publicar ou alterar o número da versão. A [arquitetura estudada](ARQUITETURA-CONFIRMACAO-USO-HABILIDADES-2026-11-21.md) foi autorizada pelo responsável para desenvolvimento.

## Comportamento

- Executar na HUD abre uma segunda verificação quando houver resolução assistida/híbrida, reação manual ou contexto específico. Mostra condições, custo efetivo/saldo, parte manual, componentes consumidos e consequências de concentração/proteções quando aplicáveis.
- Cancelar/Escape volta à carta preparada, sem gastar. O foco começa em Cancelar. Não há confirmação para usar uma habilidade objetivamente inválida. O popup tem retângulo visível delimitado, até 440×520 px, com conteúdo rolável; não há janela transparente ocupando o mapa todo.
- Adicionais pós-acerto, rerrolagens, metamagia e iniciativa avulsos são encaminhados ao fluxo certo, sem debitar. Não se permite transformar um adicional automatizado numa declaração genérica que só gastaria o recurso.
- Para adicionais/rerrolagens, Ir para Atividades procura um pedido ainda aberto que contenha o ID da opção; caso não encontre, abre a gaveta. Reações preventivas e iniciativa continuam com as próprias janelas.
- Reações manuais avisam que o gatilho/efeito serão conferidos pela mesa, registram e gastam somente o plano aprovado. Não disparam ataque, dano ou salvaguarda fictícios. Uma reação automática pendente tem prioridade. Reagir fora do turno é válido; falta de saldo ou condição impeditiva permanece bloqueio.
- A ficha usa a mesma consulta da autoridade e o mesmo aceite. Controle Reanimar Corpo também passa pela revisão e preserva a transformação imediata publicada, os componentes previstos, a sobreposição, token e loot.
- Favoritos conserva as mesmas opções e regras. Gerir favoritos não executa nem abre aviso de gasto. Ataques automáticos comuns, movimento, iniciativa e testes não recebem popup indiscriminado; habilidades comuns sem dependência não fazem uma consulta remota adicional só para abrir a verificação.

## Autoridade, persistência e concorrência

`skill-use-review.mjs` classifica o uso por campos mecânicos, metadados explícitos e limites de 24 definições híbridas em `catalogos/cobertura-uso.mjs`. Definição sem automação tem fallback assistido; `aprimoramento`, `rerrolagem`, metamagia e modificadores são reconhecidos antes desse fallback. O schema e o validador aceitam cobertura explícita para conteúdo autoral, sem alegar automação inexistente.

`avaliarUsoHabilidade` consulta cópia do estado e não marca limites nem consome recursos. A revisão remota (`revisarUso`) é somente leitura, autorizada por usuário/ator; checa visibilidade dos alvos e usa a geometria atual dos tokens. Respostas não enviam os PV/recursos secretos de NPCs. A impressão opaca é calculada pela autoridade e evita exigir que o player possua esses dados para confirmar.

O motor exige um campo próprio `confirmacaoUso`, independente de `assistido`/`confirmado`. Ele vincula usuário, ator, opção, plano de custos, círculo, alvos, composição, parâmetros, ajustes, atividade e contexto relevante. Mudanças relevantes invalidam o aceite; revisão de um ator independente não o invalida sozinha. Limites e requisitos das opções assistidas passam a ser validados antes do débito.

O diário de execução já salva mundo e recibo juntos; foi acrescentado um limite de 32 IDs de confirmação por ator para impedir reaplicar o mesmo aceite após recarga. Reações declarativas independentes usam bloqueio por ator quando não há reação pendente global. Cancelamento/resultado/retomada continuam na execução existente, sem criar um segundo gasto.

A confirmação ainda não aceita é guardada localmente por sala/usuário, com identidade da cena. F5 recupera a instância e consulta a revisão atual, sem restaurar uma autorização aceita. Cancelar ou começar a execução limpa essa preparação. Atividades mostra Aguardando confirmação de uso, inclusive antes da execução; os motivos detalhados ficam locais ao executante.

## Descanso e tempo

- O comando de descanso curto e a conclusão de Prece de Cura registram um contexto técnico para gastar Dados de Vida dos PJs vivos. Sem esse contexto, ou após deslocamento posterior, o gasto é bloqueado. Começar combate ou executar outra habilidade encerra esse contexto. Isto **não implementa a futura fila paralela de Dados de Vida**, cuja arquitetura permanece guardada.
- Astúcia Mágica inicia uma recuperação persistente de 60 segundos. Nenhum uso/espaço é alterado antes disso. Avançar o tempo conclui, revalida e cobra o uso uma vez; há marcador e botão Cancelar recuperação. Cancelar ou iniciar combate não gasta o recurso. O estado sobrevive à serialização/recarga.
- Rituais e ações cujo modo/tempo ainda dependem de arbitragem mostram essa limitação e o custo efetivamente configurado. Confirmar não transforma um uso normal em ritual gratuito nem implementa automaticamente todos os rituais do catálogo. A conjuração longa de Prece e os demais protótipos existentes continuam com suas etapas próprias, sem nova cobrança na retomada.

## Validação

- **537 testes Node aprovados**: 517 anteriores, adequados ao aceite explícito nas suites de mecânicas, mais 20 novos que chamam o motor diretamente. Cobrem recusa sem aceite, consulta sem mutação, contexto, requisitos, reações, custos, identidade/versão, reentrega, descanso, tempo e metadados autorais.
- **12 verificações novas de navegador**: seis da HUD (cancelar, F5, débito único, encaminhamento e mudança independente), três da ficha e três de concorrência com segundo jogador/rolagem Dice+.
- Regressões locais: oito de A com 160 cliques/arrastes no canvas; sete de estabilidade; 24 gerais da HUD; seis de expansão; 11 de Favoritos; 21 da barra de efeitos. Nenhum erro não tratado nesses ensaios.
- Catálogo runtime e versão/cache 0.8.82 válidos. Nenhuma ficha de personagem alterada; somente schema ampliado. Não é necessário reenviar fichas.

Os ensaios são headless locais, com host/sala simulados e SDK verdadeiro nos medidores internos. Nenhum navegador do responsável foi controlado. A validação visual na sala autenticada fica para depois da publicação.

## Preservações e limites

Sopro de Dragão, Marca/Saraivada, condições/reação automática, CA/Luvas, hitboxes, movimento dinâmico/oportunidades, defesas dos zumbis, reanimação instantânea, sobreposição e loot continuam cobertos pelas suites anteriores. Nenhuma nova imagem foi gerada ou adicionada ao site; os dois novos módulos de classificação/cobertura somam cerca de 15 KB de fonte, sem copiar o inventário de estudo para o pacote publicado.

O estudo histórico por personagem e as vinte provas em `mapeamento-uso-habilidades` documentam a **0.8.82 antes da correção**. Os scripts de estudo consultam o checkout em que forem executados; para reproduzir exatamente os resultados antigos é necessário aquele commit. A nova suite `skill-use-review.test.mjs` registra os resultados esperados após a correção.

Pendências de módulos distintos: fila paralela de Dados de Vida; automação integral de rituais e critérios narrativos; aprovação excepcional de violações de regra. Esta revisão não cria um modo geral de ignorar regras nem exige aprovação prévia do mestre para toda declaração narrativa.


Atualização de 22/11/2026: a pendência de fila paralela de Dados de Vida mencionada acima foi implementada localmente. [Módulo de descanso curto e resultados dos testes](IMPLEMENTACAO-DESCANSO-CURTO-DADOS-DE-VIDA-2026-11-22.md). As demais limitações deste documento permanecem.

# Versão 0.8.78 — hotfix A: bloqueio de cliques à esquerda

O responsável relatou que a 0.8.77 bloqueava as ferramentas do Owlbear em toda a coluna esquerda, inclusive acima do rodapé. A correção anterior separou os grupos visíveis, mas manteve dois popovers invisíveis de medição (`barra` e `ordem`) com altura de 1 px. Essa foi uma limitação do ensaio anterior: verificar apenas o retângulo do iframe não demonstra como o host trata o seu contêiner.

## Correção

Os dois medidores **não são mais popovers do Owlbear**. São iframes internos do documento de Atividades da mesa, invisíveis, fora da navegação por Tab e com `pointer-events:none`. O iframe externo de Atividades limita a área de entrada; os medidores não conseguem cobrir o mapa ou ferramentas fora desse limite. Continuam calculando o mesmo layout com a largura virtual correta, sem janela técnica de 1 px na borda da tela.

Os documentos internos usam o canal local já existente. Não aguardam um segundo handshake com o host nem carregam o parâmetro `obrref` do pai. A medição usa um timer curto em vez de depender de animation frames em um documento invisível. O SDK verdadeiro foi usado nesses dois documentos durante o ensaio local.

A inicialização e o comando Reabrir HUD fecham também os IDs antigos de `barra`/`ordem`. Isso remove superfícies que tenham sobrevivido à versão anterior. Somente os grupos visíveis, cartas, dados, atividades e efeitos continuam na lista de popovers.

Filtros de habilidades, recurso selecionado e confirmações do mestre são restaurados quando Atividades muda de posição ou é recriada. O cálculo das rolagens usa o rodapé virtual. Mantidos o máximo de 1120 px, a linha de recursos, os carrosséis, ícones, mecânicas, fichas e decisões anteriores.

## Verificação

- **494 testes de regras e protocolos aprovados**; versão/cache e catálogo runtime válidos.
- **24 verificações gerais de navegador** com GM e jogador, incluindo a remoção de uma janela antiga simulada, cliques na coluna esquerda/topo, linhas 1/2/3/5, viewports 620/900/1440/2560 px, filtros preservados após reposicionar Atividades, recarga, recuperação manual, tooltips, instâncias e controles GM.
- **8 cenários específicos do A**, combinando GM/jogador, larguras 1366/1920 px e grades de 1/5 linhas: **160 cliques chegaram ao próprio canvas do mapa**, além dos arrastes. A verificação exige que o elemento atingido seja o canvas e que seus handlers recebam o evento; apenas escutar o documento seria insuficiente.
- Nenhum popover de medição no documento do mapa; os dois medidores existem somente dentro de Atividades. Sem erros de execução nos ensaios.

O host da sala e seu canvas são simulados localmente. A alteração elimina o caminho dos popovers invisíveis, mas não foi apresentada como diagnóstico conclusivo dos estilos internos do Owlbear nem como teste autenticado. O navegador e o PC do responsável não foram controlados nesta etapa, conforme solicitado. A validação final das ferramentas nativas fica para a mesa real após atualizar a extensão.

## B reservado

A barra de buffs/debuffs permanece sem reforma nesta entrega. Posição inferior esquerda, dez efeitos por linha, scroll horizontal, reaproveitamento de ícones e produção das artes pendentes com GPT 6 Luna estão [registrados para a etapa B](PENDENCIA-B-BARRA-DE-EFEITOS.md).

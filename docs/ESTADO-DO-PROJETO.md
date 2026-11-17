# Estado do projeto

Revisão de 17 de novembro de 2026, versão **0.8.50**, linha travada em 0.8.x até 0.8.99. Nenhum avanço de versão maior/menor está autorizado.

## Ajuste local — histórico e PV de inimigos

Resultados de dano ocultam saldos de PV dos NPCs para jogadores e mantêm os dados completos para GM. Somente execuções entram na barra histórica; cancelar remove a atividade e descarta atualizações atrasadas. 308 testes passaram, incluindo interface com SDK simulado. Ainda não publicado.

## Próxima entrega local — organização do mestre

Quatro páginas internas e listas recolhíveis por grupo nas páginas de combate e fichas; Aventureiros sempre primeiro. Origem do grupo persistida inclusive para NPCs duplicados. 305 testes passaram. [Detalhes](CONTROLE-MESTRE-PAGINAS.md). Ainda não publicado.

## Ajuste de interface — 0.8.50

- Cancelar/concluir a própria atividade deixa a tela sem seleção automática do histórico. Recolher a barra também limpa a inspeção antiga.
- Inspeções de GM e jogadores são somente leitura e mostram Fechar na instância e no resultado, voltando à barra. Fechar uma inspeção não cancela uma ação própria pausada.
- A seta para abrir permanece disponível sem seleção/histórico. Com instância fica à esquerda dela; sem instância fica junto à borda direita. A barra aberta possui seta na sua borda esquerda para recolher à direita. O brilho de atividade permanece.
- Instâncias e miniaturas dos balões não sobrepõem nomes às imagens. Pós-acerto e rerrolagens exibem o nome fora da imagem, abaixo dela; ajuste de rolagem tem mais espaço.
- 302 testes automatizados aprovados. Navegador com SDK simulado confirmou Fechar, ausência de Executar/Cancelar no histórico, retorno à barra, seta na borda, rascunhos preservados e nome pós-acerto abaixo do ícone. Falta validação na sala real. Integrado à publicação 0.8.50.

## Entrega atual

A 0.8.49 reúne os quatro avanços preparados depois da 0.8.48:

- **Saque:** pegar e equipar fecha apenas o loot do chão esgotado. Em baú/recipiente, retira a unidade e mantém a janela aberta, mesmo quando o recipiente fica vazio.
- **Barra de Atividades:** histórico horizontal à direita, teste/dano e retrato, seleção por clique e abertura por duplo clique. A própria ação tem prioridade; ocultar preserva alvos, composição e rascunho, e concluir restaura o modo anterior. Histórico local de sessão, sem persistir ao recarregar. [Contrato e limites](BARRA-ATIVIDADES.md).
- **Loteria/compositor:** Golpe Desarmado unificado com modos de Ação Bônus e Ação, até dois alvos e custo agregado. Torrente mantém os dois golpes e pode acrescentar um terceiro por Ação; Mão de Cura substitui somente um dos dois originais. **Mão de Dolo saiu de todos os modos preparados**, por pedido posterior do responsável; continua oferecida após acerto elegível, com Foco e limite compartilhado. [Contrato](COMPOSICAO-GOLPES-DESARMADOS.md).
- **Metabolismo Incomum:** escolha ao rolar iniciativa, individual, em lote ou como reforço; sem cronômetro e sem custo de Reação. Só oferece com uso e benefício disponível. Recupera Foco e rola 1d6+3 de cura no nível 3. Ativação direta pela barra é bloqueada no cliente e no motor. O dono decide; o mestre assume sem dono conectado. A iniciativa inicial aguarda as escolhas antes de iniciar os turnos. [Contrato](METABOLISMO-INICIATIVA.md).
- **Pico de Adrenalina:** conferidos Correr com Ação Bônus, 2 PV temporários e dois usos recuperáveis em descanso curto ou longo para Loteria de nível 3; descrição central esclarecida.

Fichas salvas são normalizadas a partir do catálogo central; essas mudanças não exigem apagar/reimportar as sete fichas. Nenhuma imagem nova foi gerada nesta entrega.

## Base integrada

A base preserva as contribuições dos PRs #66–#74 e as correções posteriores. A conexão e recuperação de estado da 0.8.45 foram integradas na 0.8.46. O saque/arremesso recebeu menus, geometria de seleção e criação de loot em ATTACHMENT acima dos personagens. A 0.8.48 corrigiu RateLimitHit: comparação de campos, gravações em lote e uma única fila com espera progressiva; 50 sincronizações estáveis não gravam a cena. [Investigação e estresse](FIX-RATELIMIT-LOOT.md).

Mantidos: escala compartilhada de 1,5 m por célula, posições contínuas e distância euclidiana; áreas com medidas do livro; itens portáteis com efeitos derivados do portador; invocações vinculadas e zonas persistentes; defesa por tipo de dano; grupos de fichas e comércio com dinheiro/carga validados. As decisões #1/#2 permanecem intencionais. As regressões #4, #63, #64 e #65 estão fechadas no GitHub.

## Validação da publicação

- **301 testes automatizados passaram** na suíte completa executada pelo workflow de publicação.
- Catálogo consistente: 260 habilidades, 120 itens e duas lojas; versão/cache sincronizados.
- Navegador headless com SDK/Dice+ simulados: Barra de Atividades e rascunhos, golpes/custos no compositor, Metabolismo sem relógio, barra bloqueada, cura e Foco sem gastar Reação.
- Estresse do reconciliador: 1.000 recipientes/2.000 peças, operações em lote, repetição idempotente e recuperação após falha simulada.
- Esses resultados **não substituem a conferência em uma sala real**. O responsável informou que saque/equipar já funcionavam; a nova regra de permanência e os fluxos novos ainda precisam ser conferidos após instalar a 0.8.49.

## Ponto de retomada

1. Conferir na sala real a Barra de Atividades com dois clientes, prioridade própria, pausa/retomada, rascunhos, resultados e permissões.
2. Conferir Loteria: Golpe Desarmado Ação/Bônus, Torrente com terceiro golpe, Mão de Cura, Mão de Dolo somente pós-acerto, Metabolismo pelo jogador e pelo mestre quando ausente; confirmar custos/recargas.
3. Conferir saque/equipar em baú versus item único e repetir arremessos/depósitos com vários clientes. A #76 separa implementação entregue do estresse real ainda pendente.
4. Encerrar os aceites visuais das sete fichas nas issues #56–#62 e atualizar a auditoria #39 com evidência. Não declarar toda a etapa de nível 3 concluída por passar a suíte atual.
5. Retomar os contratos gerais de M02/M03/M04: ordenação/interceptação genérica, escolhas declarativas e reserva condicional de custos/Smites. Os custos por modo implementados são um avanço parcial, sem fechar o M04 inteiro.
6. Seguir [módulos pendentes](MODULOS-PENDENTES.md) e [roadmap](../ROADMAP-COBERTURA-REGRAS.md): nível 3, depois 5, 7 e 10. A fila de imagens continua congelada na #75 até nova ordem.

## Documentação para contribuir

- [Manual de criação de fichas JSON e grupos](MANUAL-CRIACAO-FICHAS.md).
- [Matriz de testes das sete fichas](TESTES-SETE-FICHAS-NIVEL-3.md).
- [Arquitetura M04](ARQUITETURA-M04-COMPOSITOR-ACOES.md) e [Gaveta](MODULO-GAVETA-COMPOSICAO.md). Direcionamentos históricos de Mão de Dolo preparada foram superados pelo contrato da 0.8.49.
- [Notas 0.8.49](RELEASE-0.8.49.md) e [política de versões](../VERSIONING.md).

O histórico detalhado das versões anteriores está nos commits e nos relatórios específicos. Preserve progresso de outros contribuidores ao integrar; fetch antes de publicar e execute o mesmo conjunto de testes do workflow.

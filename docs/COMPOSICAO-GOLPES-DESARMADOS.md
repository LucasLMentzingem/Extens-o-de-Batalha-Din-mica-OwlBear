# Golpe Desarmado e Torrente — composição de recursos

Decisão da mesa integrada à 0.8.49 em 17/11/2026. Substitui o direcionamento anterior que permitia preparar Mão de Dolo na gaveta.

- Para Loteria e fichas de monge normalizadas por Artes Marciais, há um único botão Golpe Desarmado no rodapé e livro. A entrada histórica Soco permanece migrável, mas não aparece como botão separado.
- O compositor do golpe tem Soco com ação bônus e Soco com ação. Escolha inicial: bônus se houver saldo, depois ação. Cada modo pode entrar uma vez, totalizando até dois golpes contra o mesmo alvo ou dois alvos. Escolha explícita permite usar só a ação.
- Torrente mantém custo base de 1 ação bônus + 1 Foco e dois golpes. O terceiro modo, Soco extra · +1 ação, ocupa exclusivamente a terceira etapa. Não cobra nova ação bônus nem Foco por esse soco. Mão de Cura pode substituir apenas um dos dois golpes originais.
- Mão de Dolo não consta dos compositores avulso ou da Torrente, nem vem pré-selecionada no dano. Seu aprimoramento e o atalho pós-acerto mantêm custo de Foco e limite por turno já existente.

## Contrato reutilizável

Cada modo pode declarar `custo`, somado ao custo base apenas quando selecionado. `composicao.custosPorModo: true` substitui o custo base pela soma dos modos (caso do golpe unificado). O motor valida todas as etapas antes de cobrar e efetua uma cobrança única agregada antes das rolagens. O custo de ação bônus tem prioridade na ordem dessa cobrança.

`ateOrdem` limita até qual etapa um modo pode aparecer. Junto de `ordem` e `limitePorUso`, impede usar cura ou um terceiro golpe gratuito na etapa reservada ao ataque com ação. Schema JSON e validação do motor incluem os campos novos. A prévia mostra o custo agregado no cabeçalho e na linha de execução; modos sem saldo são bloqueados no compositor e revalidados pelo motor.

O catálogo central e o runtime foram atualizados. A normalização adapta fichas existentes e não exige recriar ou editar manualmente as sete fichas. Nenhuma ilustração foi gerada; variantes do mesmo soco reutilizam a arte de golpe desarmado.

## Verificação

294 testes passaram, incluindo regressões atualizadas para o novo direcionamento de Mão de Dolo e quatro testes novos de composição: dois recursos/dois alvos, terceiro soco da Torrente, cura restrita aos golpes originais e normalização repetida sem duplicações. Testes de navegador com SDK simulado conferiram os dois modos do golpe, custos no cabeçalho, três etapas da Torrente e ausência de Mão de Dolo. Falta conferência na sala real. Integrado à versão 0.8.49, com 301 testes na suíte completa.

# Descanso curto e Dados de Vida — implementação local

Implementação de 22/11/2026 sobre a versão 0.8.82, junto da segunda verificação de habilidades já presente no checkout. Sem publicação, alteração do manifesto ou reexportação de fichas.

## Experiência entregue

O mestre concede descanso curto pelos controles existentes. Os recursos recuperáveis são restaurados uma vez; uma participação identificada é gravada em cada PJ. PJs feridos, vivos, com pelo menos 1 PV e Dados de Vida disponíveis recebem a escolha. NPCs não participam desta lista; PJs sem dados, a 0 PV ou com vida completa são dispensados automaticamente.

Cada dono vê seus personagens, token, PV, Constituição, tipos/saldos de dados e quantidade inicial 1. A fórmula acompanha a escolha. **Rolar e recuperar** lança diretamente no Dice+, aplica a cura, desconta os dados e conclui sem outro botão Continuar. **Não gastar** dispensa sem débito. Minimizar conserva a pendência e o estado minimizado após F5.

O mestre vê Aguardando escolha, Rolando, Concluído e Dispensado; pode rolar por qualquer pendente, inclusive sem dono ou desconectado, dispensar ou reabrir uma participação encerrada. Reabrir mantém a sessão e não restaura recursos. Assumir uma rolagem usa o pedido existente. Atividades da mesa recebe participações com token, pendências, resultados e o filtro Descanso curto. Participações antigas concluídas preservam seu resultado no diário da execução.

O atalho Gastar Dado de Vida na HUD/ficha abre a mesma janela na sala. Comandos de clientes anteriores são adaptados ao mesmo diário e à mesma participação; não existe um segundo caminho de cura. Multiclasse exige escolha explícita por tipo, inclusive no acesso legado.

## Cálculo e migração

- Cada face recebe Constituição separadamente, com mínimo de 1 PV por dado. A soma é limitada aos PV máximos atuais; todos os dados selecionados são gastos, mesmo havendo excesso de cura. A cura usa a função comum do motor, respeitando suas restrições.
- O saldo continua no recurso `dv` ou `dados-de-vida`. Para tipos diferentes, `saldosDadosVida` preserva a distribuição restante por dado. Descanso curto não recupera estes dados; longo recupera todos e reinicializa a distribuição.
- O tipo vem das classes/níveis ou da indicação explícita no recurso. Não se assume d8 quando a ficha não fornece dados suficientes. Fichas multiclasses com saldo antigo parcialmente gasto exigem que o mestre distribua o saldo por tipo; a soma deve ser exatamente o saldo existente. Isso evita inventar qual classe teve dados gastos.
- Não foi necessário modificar/reimportar nenhuma ficha do conteúdo atual.

## Consistência e retomada

`site/rest-recovery.mjs` concentra elegibilidade, seleção, migração, participação e cálculo; `site/rest-ui.mjs` renderiza o seletor/lista. O estado da participação fica no ator (`descansoVida`), sem um objeto global que todos os jogadores precisem sobrescrever para concluir. Cada recuperação bloqueia apenas seu ator. O merge de execuções preserva alterações de outros personagens.

O mestre é a autoridade da sala. Desconto, cura, conclusão e recibo da execução entram na mesma gravação. Identidades de sessão/participação, validação de saldo/controle/condições atuais e o diário impedem repetição. Disputa de mestre e jogador pela mesma participação retém a execução já iniciada. Uma nova concessão curta exige resolver ou dispensar as escolhas anteriores; a identidade de concessão também protege contra reentrega. Descanso longo aguarda rolagens em andamento pelo bloqueio da mesa e encerra as escolhas anteriores.

F5 do jogador não altera a execução do mestre. Se o resultado já foi salvo, a retomada usa as mesmas faces sem relançar. Se o mestre foi interrompido depois de lançar, antes de registrar as faces, o resultado permanece indeterminado: o mestre informa as faces observadas ou cancela explicitamente. Nunca se cria automaticamente outra rolagem para adivinhar o resultado perdido. Faces manuais precisam estar dentro dos limites dos dados.

Se houver mudança relevante no mesmo personagem depois da rolagem, a execução fica em **Revisão necessária**, conservando as faces. **Aplicar resultado preservado** revalida a participação e aplica as mesmas faces às condições atuais. Não se lança novamente. Mudança de hitbox não invalida uma recuperação; movimento posterior encerra o contexto de descanso. Iniciar combate ou executar outra habilidade também encerra escolhas ainda não usadas, seguindo a delimitação do contexto de descanso já implementada anteriormente.

## Prece de Cura e demais comportamentos preservados

Prece conserva os dez minutos de conjuração, custo, cura e efeitos em NPCs. Na conclusão, primeiro aplica cura/benefícios e depois abre a recuperação somente para PJs ainda elegíveis. O beneficiário não pode receber nova concessão sobre uma participação pendente. A revalidação na conclusão protege contra mudanças durante a conjuração. Não há recarga adicional ao rolar Dados de Vida.

A segunda verificação continua presente. As regras de combate, sobreposição de zumbis, Sopro de Dragão, favoritos, ícones e transparência do rodapé não foram substituídas por este módulo.

## Evidências locais

- **558 testes Node aprovados**, incluindo 21 casos novos: elegibilidade, autorização, lotes, Constituição negativa, excesso, multiclasse, migração, duplicidade, reabertura, longo, Prece, persistência e merge.
- Estresse do motor com **12 PJs**, todos concluindo desde a mesma revisão, sem perda de PV/saldo de outro ator.
- **13 cenários novos em Chromium headless**, sem controlar o navegador/desktop do usuário: escolha e fórmula, dois jogadores simultâneos, audiência pública, GM por ausente, reabertura, F5 antes/durante/depois, retomada de resultado salvo, resultado indeterminado, disputa GM/jogador e conflito após faces recebidas. Nenhum erro JavaScript não tratado.
- Regressões: 6 verificações da segunda confirmação e 8 cenários do problema A, incluindo **160 cliques no canvas**. Sem erros.
- Versão 0.8.82 sincronizada, catálogo de runtime válido e `git diff --check` aprovado.

Os testes de integração utilizam o simulador local de SDK/Dice+ já usado pelo projeto. A validação em uma sala real fica para depois da publicação autorizada; esta entrega permanece local.

Artefatos de execução em `work/descanso-vida/`: `TESTES-INTERFACE.json`, `TESTES-RETOMADA.json`, `preview.png` e scripts headless. Resumo completo da suíte em `work/descanso-regressao.log`.

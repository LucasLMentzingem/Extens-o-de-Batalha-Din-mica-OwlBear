# Escolhas ao rolar iniciativa

Implementação local, ainda sem publicação de manifesto.

## Metabolismo Incomum — Loteria

Ao concluir a iniciativa, abre uma escolha opcional sem cronômetro. O dono da ficha decide; o mestre recebe a escolha se não houver dono conectado. Ela só aparece se existir uso disponível e faltar PV ou Foco. Recusar preserva o uso, mas encerra aquela oportunidade de ativação.

Aceitar gasta um uso de Metabolismo Incomum, recupera todo o Foco e abre a rolagem de cura. No monge de nível 3, a cura é `1d6+3`, limitada aos PV máximos. Não gasta Ação, Ação Bônus ou Reação. O uso é recuperado em descanso longo.

A habilidade fica na classificação Reações do livro e do filtro do rodapé por ser uma escolha disparada por evento. Essa classificação não representa custo de Reação. Seu botão na barra permanece bloqueado, inclusive fora de combate: não se pode guardar a ativação para depois. A confirmação usa a janela própria de iniciativa.

As fichas antigas recebem o gatilho e a descrição por normalização; a definição central foi atualizada. Não é necessário reimportar Loteria.

## Contrato do gatilho

- Opção: `gatilho: "rolar_iniciativa"`, `categoria: "reacao"`, automação `economia`, custos somente de recursos.
- O motor oferece a escolha na iniciativa individual, em lote e na entrada como reforço. Os benefícios atualmente suportados são `cura` e `recuperarRecursos`.
- Cada ator mantém `reacaoIniciativa: {id, reator, opcoes, descricao}`. Não existe `terminaEm`. O estado sobrevive a salvar/compactar/reabrir.
- `responderIniciativa` exige controle da ficha, revisão vigente e `pendenciaId` exato. O motor revalida benefício e saldo, cobra uma única vez e remove a pendência. Repetir uma resposta antiga é rejeitado.
- Outras fichas podem rolar sua iniciativa enquanto a escolha está aberta. O combate começa seus turnos após todas as iniciativas e escolhas iniciais terminarem. Isso também permite resolver a recuperação a 0 PV antes de um teste de morte do primeiro turno.
- Reforços resolvem sua escolha antes de agir. Sair do combate ou encerrá-lo descarta a pendência sem consumir o uso.
- A ativação por `usar` é rejeitada no motor, além do bloqueio visual. Falhar/cancelar a rolagem de cura não confirma gasto parcial.

## Pico de Adrenalina

A implementação existente foi conferida: Ação Bônus para Correr e ganhar PV temporários iguais à proficiência; dois PV temporários e dois usos para Loteria no nível 3. Recupera os usos em descanso curto ou longo. PV temporários seguem a regra de manter o maior valor, sem somar. A descrição central agora explica esses efeitos e a recarga.

## Referências e validação

[Monge nas regras gratuitas de 2024](https://www.dndbeyond.com/sources/dnd/br-2024/character-classes), [apresentação oficial do monge 2024](https://www.dndbeyond.com/posts/1758-2024-monk-vs-2014-monk-whats-new), [espécies do Livro do Jogador 2024](https://www.dndbeyond.com/posts/1783-the-10-species-in-the-2024-players-handbook) e [SRD 5.2.1 oficial](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf).

Regressões em `initiative-choices.test.mjs`: benefícios parciais/ausentes, custo, cura máxima, recusa, repetição, autorização, persistência, iniciativa em lote, reforço, recuperação a 0 PV e recargas das duas habilidades. Teste de navegador com SDK simulado confirmou a janela sem relógio, o bloqueio do botão, a rolagem e a recuperação sem gasto de Reação. A conferência em uma sala real do Owlbear continua pendente.

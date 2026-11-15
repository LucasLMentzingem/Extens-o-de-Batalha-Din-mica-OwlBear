# M04 — Arquitetura do Compositor de Ações

Estado: implementação incremental na versão 0.8.13. Círculo dinâmico, custos derivados, os dois estados visuais e a primeira sequência seriada (Ágil de Zurich) estão operacionais; reservas condicionais e integrações completas continuam pendentes.

O M04 é o orquestrador transacional das ações. Ele monta um plano, recebe escolhas, calcula custos, valida tudo e executa etapas em série. Escolhas pertencem ao M03, escalonamento ao M15, gatilhos ao M02, modificadores de rolagem ao M09 e efeitos persistentes ao M01.

## Objetivos

- Compor ataques, magias, curas, efeitos, movimentos e invocações.
- Alterar o círculo usado sem criar cópias da magia.
- Integrar Smites, metamagias, manobras, maestrias e ataques extras.
- Manter custo, alcance, alvos, dano e efeitos sincronizados durante a montagem.
- Validar tudo antes de consumir o primeiro recurso.
- Consumir custos condicionais somente quando seu gatilho realmente ocorrer.
- Exibir a composição e sua execução para todos os participantes.

## Plano de execução

```json
{
  "id": "plano-uuid",
  "atorId": "zurich",
  "opcaoRef": "habilidade.ataque-cimitarra",
  "revisaoFicha": 42,
  "estado": "rascunho",
  "parametros": {
    "circuloUsado": null,
    "recursoUsado": null
  },
  "etapas": [],
  "modificadores": [],
  "custosDerivados": []
}
```

Estados: `rascunho`, `valido`, `confirmado`, `executando`, `concluido`, `interrompido` e `cancelado`.

O plano não altera a ficha enquanto estiver em rascunho. Depois da confirmação, custos imediatos são consumidos e custos condicionais permanecem reservados até a janela correta.

## Apresentação responsiva

O conjunto **Gaveta de Composição + Instância da Habilidade** possui dois tamanhos funcionais.

### Planejamento expandido

- Ativo desde a seleção da habilidade até a abertura da primeira rolagem.
- Gaveta com **duas colunas e até sete linhas visíveis** (`2×7`).
- O conjunto pode crescer verticalmente para acomodar as catorze opções.
- Acima de catorze opções, a gaveta mantém o tamanho e ganha rolagem vertical.
- Instância e gaveta permanecem coladas e com a mesma altura.
- A composição escolhida aparece como uma sequência numerada na instância.

### Execução compacta

- Ativo quando uma janela de ajuste, rolagem ou resultado é aberta.
- Gaveta compactada para **duas colunas e quatro linhas visíveis** (`2×4`).
- Acima de oito opções, a gaveta usa rolagem vertical.
- A composição fica somente leitura durante a rolagem.
- A instância preserva título, custos, sequência, alvo atual e progresso.
- O conjunto retorna ao modo expandido apenas se a execução voltar legalmente à etapa de planejamento.

```text
Planejamento: [ Gaveta 2×7 ][ Instância expandida ]
                         ↓ Executar
Execução:     [ Gaveta 2×4 ][ Instância compacta ] [ Ajuste/Rolagem ]
```

O redimensionamento deve ocorrer por estado sem desmontar o componente. Isso evita perder seleção, foco, scroll, alvo ou sincronização pública.

## Barra de custos derivada

Os custos deixam de ser texto embutido no título. Eles viram versões reduzidas dos botões de recurso do rodapé de combate.

Existem duas apresentações da mesma barra:

1. **Barra superior:** uma linha imediatamente abaixo do título.
2. **Barra de confirmação:** ao lado da linha de execução e do botão Executar.

As duas barras usam o mesmo `view model`; nenhuma calcula custos separadamente.

Exemplos de botões reduzidos:

```text
[● 1 Ação] [◆ 1 Bônus] [◇ 1 Espaço de 2º] [✦ 1 Feitiçaria]
```

Cada botão mostra:

- ícone e cor iguais ao recurso do rodapé;
- quantidade que será consumida;
- saldo atual e saldo restante no balão;
- momento do consumo: imediato, reservado ou condicional;
- origem do custo, como magia, metamagia, manobra ou item;
- estado gratuito, indisponível ou substituído.

O texto completo continua disponível no balão e para leitores de tela.

### Atualização em tempo real

`custosDerivados` é recalculado sempre que mudar:

- círculo usado;
- origem do espaço de magia;
- metamagia;
- Smite;
- manobra;
- maestria ou ataque extra;
- quantidade de alvos ou instâncias;
- uso gratuito;
- equipamento, buff ou recurso disponível.

Exemplo de círculo:

```text
Mísseis Mágicos · 1º: [● 1 Ação] [◇ 1 Espaço de 1º] · 3 projéteis
Mísseis Mágicos · 2º: [● 1 Ação] [◇ 1 Espaço de 2º] · 4 projéteis
```

Exemplo de Smite condicionado:

```text
Antes do acerto: [● 1 Ação]
Depois do acerto e da escolha: [● gasto] [◆ 1 Bônus] [◇ 1 Espaço de 2º]
```

Custos indisponíveis aparecem apagados e explicam o bloqueio. A execução não pode ser confirmada enquanto existir custo obrigatório inválido.

## Círculo de magia

- O seletor varia do círculo base ao maior espaço compatível disponível.
- Diminuir significa voltar até o círculo base; nunca conjurar abaixo dele.
- Truques não usam espaço.
- Uma magia pode gastar espaço superior mesmo sem melhoria direta, com aviso visual.
- O jogador escolhe a origem do espaço quando houver mais de uma reserva compatível.
- Usos gratuitos declaram o círculo que concedem.
- M04 guarda a escolha; M15 deriva dano, cura, alvos, projéteis, área e duração.

## Etapas e janelas

Tipos iniciais de etapa: `ataque`, `salva`, `dano`, `cura`, `efeito`, `movimento`, `teleporte`, `escolha`, `invocacao` e `adjudicacao`.

Janelas iniciais: `ao_montar`, `antes_de_executar`, `antes_do_ataque`, `depois_do_ataque`, `depois_do_acerto`, `antes_do_dano`, `depois_do_dano`, `depois_da_salva` e `fim_da_acao`.

Smites entram depois do acerto; metamagias podem entrar ao montar ou na rolagem; manobras respeitam seu gatilho; maestrias usam os eventos do ataque; ataques extras são etapas da mesma Ação Atacar quando a regra determinar.

## Zurich e Ágil

1. Zurich escolhe a Cimitarra, uma arma Leve com Ágil.
2. A gaveta oferece o ataque extra da propriedade Leve dentro da mesma Ação Atacar.
3. Selecionar a oferta acrescenta uma etapa de ataque com uma arma Leve diferente equipada.
4. Cada ataque recebe alvo próprio antes da confirmação.
5. A barra mostra apenas `1 Ação`; não mostra Ação Bônus para o ataque Ágil.
6. Um único botão inicia as duas etapas, resolvidas em série.
7. O primeiro ataque precisa ser realizado, mas não precisa acertar.
8. O ataque extra não soma modificador de atributo ao dano, salvo regra que permita.
9. Ágil e o ataque extra da propriedade Leve são limitados a uma vez por turno.
10. Não é permitido executar novamente o mesmo ataque extra usando Ação Bônus.

## Validação e transação

1. Criar o plano.
2. Recalcular parâmetros, etapas e custos.
3. Validar equipamento, alvos, alcance, economia e conflitos.
4. Mostrar prévia pública.
5. Reservar recursos.
6. Confirmar e consumir custos imediatos.
7. Executar etapas em série, revalidando cada etapa.
8. Abrir reações e escolhas condicionais entre etapas.
9. Consumir custos condicionais somente quando disparados.
10. Registrar o resultado final.

Falha técnica desfaz a transação. Resultado normal, como errar um ataque, não devolve a ação. Se uma reação invalidar uma etapa futura, a sequência pausa para escolher outro alvo válido ou cancelar somente o restante.

## Critérios de aceite visual

- [x] Planejamento suporta `2×7` sem cobrir o rodapé ou sair da área segura.
- [x] Execução compacta para `2×4` quando ajuste, rolagem ou resultado abrir.
- [ ] Scroll aparece acima de catorze opções no planejamento e acima de oito na execução.
- [ ] Redimensionar não perde seleção, alvo, scroll ou foco.
- [x] Custos aparecem abaixo do título e junto ao botão Executar.
- [x] As duas barras mostram valores idênticos e atualizam no mesmo quadro.
- [x] Alterar círculo atualiza custo, alvos e dano imediatamente.
- [x] Observadores veem composição e custos, mas somente dono e mestre editam.
- [x] Zurich compõe Cimitarra e Espada Curta com alvos próprios, uma Ação e nenhuma Ação Bônus adicional.

## Ordem recomendada

1. Plano imutável, transação e `custosDerivados`.
2. Estados visuais expandido `2×7` e compacto `2×4`.
3. Botões reduzidos de custo e atualização reativa.
4. Seletor de círculo integrado ao M15.
5. Sequência de ataques e Ágil de Zurich. **Concluído no primeiro caso real.**
6. Reservas e custos condicionais.
7. Janelas integradas ao M02.
8. Conflitos e limites de composição.
9. Migração de manobras, metamagias, Smites, maestrias e ataques extras.

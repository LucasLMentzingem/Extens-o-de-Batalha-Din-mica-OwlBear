# Pré-arquitetura dos módulos para cobertura do nível 3

Estado: proposta para leitura e aprovação. Nenhum dos contratos abaixo deve ser considerado estável antes da revisão do mestre.

Referências de regras: [SRD 5.2.1](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf), [Equipment — Basic Rules 2024](https://www.dndbeyond.com/sources/dnd/br-2024/equipment), [Rules Glossary — Basic Rules 2024](https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary) e [Playing the Game — Basic Rules 2024](https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game).

## Objetivo

Transformar as 193 opções ainda classificadas como `PARCIAL`, `ASSISTIDO` ou `NOVO_MODULO` em definições de catálogo reutilizáveis. A ficha continuará guardando apenas referências, escolhas e estado mutável; regras, textos e automações pertencem ao catálogo do sistema.

Cada entrada de `catalogo-nivel-3.json` agora possui `modulos_necessarios`. O arquivo `modulos-nivel-3.json` resume a demanda por módulo.

## Contrato comum

Todo módulo deve obedecer ao mesmo ciclo:

1. **Validar:** verificar esquema, custo, alvo, alcance de campanha (máximo 18 m) e autoridade.
2. **Planejar:** produzir etapas imutáveis antes de gastar recursos.
3. **Visualizar:** publicar seleção, área, trajetória e instância da habilidade para toda a mesa.
4. **Confirmar:** somente o dono ou o GM altera ajustes e confirma escolhas.
5. **Resolver:** o host executa dados e efeitos em ordem determinística.
6. **Persistir:** gravar apenas referências e estado mutável.
7. **Auditar:** registrar origem, escolhas, dados, custos, alvos e resultado no histórico.

Formato-base proposto:

```json
{
  "pipeline": [
    {"tipo": "selecionar", "alvos": {"min": 1, "max": 1}},
    {"tipo": "rolar", "teste": "salvaguarda", "atributo": "des", "cd": {"origem": "cdMagia"}},
    {"tipo": "aplicar", "efeito": {"ref": "efeito.exemplo"}}
  ],
  "escolhas": {},
  "gatilhos": [],
  "estado": {}
}
```

O catálogo pode declarar o plano; a ficha só conserva algo como `{"ref":"magia.exemplo","escolhas":{"tipoDano":"fogo"}}`.

## Ordem recomendada

| Fase | Módulos | Motivo |
|---|---|---|
| 1 | M01, M02, M03, M04 | Formam a linguagem de resolução usada pelos demais. |
| 2 | M05, M06, M07, M08 | Cobrem mapa, entidades, transformação e movimento. |
| 3 | M09, M10, M11, M12 | Generalizam exceções mecânicas recorrentes. |
| 4 | M13, M14, M15, M16 | Fecham expressões especiais, arbitragem, escala e reservas. |

## M01 — Ciclo de vida declarativo de efeitos

- Dados: `inicio`, `duracao`, `expiraEm`, `removeQuando`, `repetirEm`, `concentracaoId` e `empilhamento`.
- Motor: agenda eventos no início/fim de turno, dano, cura, descanso, queda a 0 PV e fim de concentração.
- Interface: contador e motivo de término no balão do efeito.
- Aceite: um efeito persistido sobrevive à recarga, termina uma única vez e remove todas as concessões derivadas.

## M02 — Barramento de gatilhos e interceptações

- Dados: `evento`, `fase` (`antes`, `depois`), `filtros`, `prioridade`, `umaVez`, `resposta`.
- Eventos iniciais: ataque, acerto, erro, dano, cura, teste, conjuração, entrada/saída de área e movimento.
- Motor: fila ordenada, pausa com reação quando necessário e retomada da etapa original.
- Aceite: Sanctuary pode interceptar um ataque sem apagar o comando original; múltiplos gatilhos têm ordem estável.

## M03 — Escolhas e variantes declarativas

- Dados: `id`, `momento`, `opcoes`, `min`, `max`, `padrao`, `condicoes` e `persistir`.
- Interface: prompt único no cartão da habilidade, visível a todos; edição só pelo controlador.
- Aceite: uma magia escolhe tipo de dano, atributo ou benefício sem duplicar a definição central.

## M04 — Compositor e modificador de ações

- Dados: `ancora` (`proximo_ataque`, `arma_escolhida`, `acao_atual`), `alteracoes`, `consumo` e `termino`.
- Motor: compõe custo, ataque, dano, alvos e efeitos antes da confirmação; nada é cobrado duas vezes.
- Aceite: smites, maestrias, metamagias e ataques extras reutilizam o mesmo contrato.

## M05 — Templates e zonas persistentes

- Formas: cubo, cilindro, parede, emanação; círculo, quadrado, cone e linha continuam no módulo atual.
- Dados: geometria, âncora, orientação, altura, bloqueio, mobilidade, gatilhos de entrada/saída/turno e duração.
- Mapa: marcas públicas acima dos tokens, identificadas por `efeitoId`, sem depender do grid.
- Aceite: Web e Moonbeam mantêm uma zona sincronizada, selecionam alvos por geometria euclidiana e reagem a movimento.

## M06 — Entidades, familiares e objetos vinculados

- Dados: `fichaRef`, `token`, `dono`, `controlador`, `iniciativa`, `comandos`, `limite`, `distanciaVinculo` e `termino`.
- Motor: instancia derivada com ID próprio; a definição permanece no catálogo.
- Aceite: Find Familiar, Find Steed, Unseen Servant, Wild Companion e Spiritual Weapon entram/saem sem duplicar fichas.

## M07 — Transformações e sobreposição de ficha

- Dados: camadas de atributos, tamanho, deslocamentos, sentidos, resistências, ações, token e política de PV.
- Motor: pilha reversível; cada camada conhece sua origem e precedência.
- Aceite: Alter Self e Wild Shape terminam restaurando exatamente o estado anterior, inclusive equipamentos e recursos.

## M08 — Movimento e trajetórias avançadas

- Dados: modo (`andar`, `voar`, `nadar`, `escalar`, `teleportar`, `forcado`), vetor, caminho, terreno e colisão.
- Regra da campanha: distância euclidiana contínua; o grid é somente visual.
- Terreno difícil: recebe o comprimento real do trecho; botas e efeitos podem ignorar apenas a parcela permitida.
- Aceite: puxar, fugir, Gust of Wind, Levitate, Spider Climb e Rope Trick compartilham o mesmo resolvedor.

## M09 — Modificadores condicionais de rolagem

- Dados: tipos de teste, filtros, momento, vantagem/desvantagem, rerrolagem, substituição, mínimo/máximo e consumo.
- Aceite: modificadores aparecem no ajuste/resultado correto, cobram recurso somente se escolhidos e não vazam CD.

## M10 — Tags de criatura e restrições sistêmicas

- Dados: `tagsCriatura`, `imunidadesFuncionais`, `requisitosAlvo`, `bloqueios`.
- Aceite: uma regra pode distinguir morto-vivo, constructo, aliado, criatura viva ou alvo curável sem comparar nomes.

## M11 — Vínculo persistente com equipamento

- Dados: `itemId`, `slot`, `alteracoes`, `termino`, `permiteTroca`.
- Motor: recalcula ações pelo portador atual e termina ou acompanha o item conforme a regra.
- Aceite: Magic Weapon e Shillelagh não criam cópias de arma e continuam corretos após equipar/desequipar.

## M12 — Agendador de efeitos e dano

- Dados: evento futuro, origem, alvo, fórmula, tipo, tags e cancelamento.
- Aceite: Acid Arrow agenda o dano posterior uma única vez e respeita defesas vigentes quando o evento ocorre.

## M13 — Expressões de dados estendidas

- Dados: operação (`explodir`, `manter`, `rerrolar`, `substituir`) e limite de segurança.
- Integração: preparar um comando Dice+ quando suportado; caso contrário, rolar lote e somar no host.
- Aceite: Sorcerous Burst resolve dados explosivos sem loop infinito e mostra todas as parcelas.

## M14 — Pedido estruturado de adjudicação

- Dados: pergunta, contexto, opções, CD sugerida, alvos, custos e campos de resposta.
- Interface: tarefa do mestre com `aprovar`, `alterar` ou `negar`; resposta entra no histórico.
- Aceite: efeitos narrativos deixam de ser texto solto, ainda que não sejam automatizados.

## M15 — Escalonamento e variantes

- Dados: tabelas por nível total, nível de classe, círculo usado, quantidade de alvos e tamanho de área.
- Aceite: uma definição produz a variante correta sem a ficha armazenar versões redundantes.

## M16 — Limites de cura, PV temporários e recursos

- Dados: reserva, distribuição, teto por alvo, mínimo, alvo válido, consumo parcial e recuperação.
- Aceite: Preserve Life e efeitos semelhantes distribuem apenas o saldo confirmado e nunca ultrapassam o limite da regra.

## Decisões que precisam de aprovação

1. Zonas devem bloquear movimento/visão automaticamente ou começar apenas detectando entradas e alvos?
2. Entidades invocadas devem entrar na mesma iniciativa da origem por padrão ou cada definição decide?
3. Transformações trocam a imagem do token automaticamente ou pedem confirmação do jogador?
4. O módulo de adjudicação pode permitir ao mestre criar um efeito temporário no resultado ou somente registrar a decisão?
5. A primeira entrega deve priorizar todas as sete fichas atuais ou maximizar a quantidade total de opções SRD cobertas?

## Critério para declarar o nível 3 concluído

- As 320 entradas têm definição central ou pedido estruturado de adjudicação.
- Nenhuma regra depende de texto duplicado nas fichas.
- Cada módulo possui testes unitários, de interação e ao menos um smoke test visual.
- As sete fichas atuais completam seus turnos padrão, combinações principais e descansos sem intervenção no estado interno.
- O catálogo é regenerado e não contém `NOVO_MODULO`; itens `ASSISTIDO` só permanecem quando a própria natureza da regra exige decisão narrativa.

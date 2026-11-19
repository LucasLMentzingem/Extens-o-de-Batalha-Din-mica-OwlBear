# Arquitetura e inventário de impacto — Luvas e Classe de Armadura

**Atualização da execução:** este é o estudo histórico da 0.8.70. A PR #78 iniciou a implementação na 0.8.71; a [revisão 0.8.72](RELEASE-0.8.72.md) registra a regra final esclarecida pelo usuário, os reparos e as verificações. O total legado não deve gerar bônus artificial. Nenhuma ficha canônica tem dois pares equipados, e as fichas existentes são atualizadas sem reimportação. Consultar as notas da revisão para o estado atual das decisões da seção 15.

Data: 18/11/2026. Estado analisado: **0.8.70**, commit `8f4be22a4abbaf2d6145a3387fdfbe86e5ad5766`.

**Status: estudo e plano de adaptação. Nenhuma alteração funcional, migração de sala ou publicação da extensão foi realizada nesta etapa. A entrega deste estudo no Git e sua issue são documentação.** Os nomes dos novos campos e módulos abaixo são propostas; os campos identificados como atuais foram encontrados no código.

Checkout analisado: `D:\Documents\Codex\2026-11-09\os-ogros-de-dnd-s-o\work\publicacao-owlbear`.

## 1. Escopo auditado e limites da verificação

- 125 definições de itens e 327 definições de habilidades do catálogo materializado, incluindo variantes da La Arte.
- 31 itens diretamente relevantes: 27 com definição de CA e quatro tipos de luvas. Itens com bônus ofensivos também precisam continuar funcionando sem transformá-los em bônus defensivos.
- 29 arquivos JSON de fichas: 13 em `site/fichas`, 11 em `conteudo/aventura-no-cemiterio` e cinco cópias distribuídas em downloads. Representam 24 IDs distintos.
- Quatro ZIPs de distribuição, com 16 ocorrências de fichas JSON; são cópias dos conteúdos, não 16 personagens adicionais.
- Dois modelos de reanimação em `site/modelos/reanimacao.mjs` e três definições de entidade dentro de habilidades: Familiar e duas entradas de Mão Mágica.
- Motor, ficha, inventário, loja, saque, troca, importação, compactação, recuperação, execução de rolagens, geração de catálogo e testes existentes.
- **451 testes existentes passaram** como baseline. As reproduções específicas foram executadas sobre cópias em memória pelo motor real, sem conectar a uma sala.

Não foram lidos os inventários particulares armazenados no navegador de uma mesa real. Fichas importadas pelo mestre, ajustes locais, lojas alteradas e backups externos exigem o modo de auditoria/migração descrito adiante. Portanto, os números deste documento cobrem o checkout, não todas as possíveis instâncias já existentes nas salas.

Evidências estruturadas: [EVIDENCIAS-INVENTARIO-CA-2026-11-18.json](EVIDENCIAS-INVENTARIO-CA-2026-11-18.json). Os valores de CA são do estado inicial das fichas, sem efeitos adicionais, salvo quando o cenário indica o contrário.

## 2. Requisitos consolidados

| ID | Requisito que a implementação deve garantir |
|---|---|
| R01 | Novo slot `luvas`; uma unidade de item representa um par completo. |
| R02 | Um único par equipado; o par não ocupa mãos, vestes ou acessórios. |
| R03 | CA é derivada do estado atual: base da fórmula ativa + bônus aplicáveis. |
| R04 | Armadura equipada fornece sua base; atributo permitido entra nos bônus, com o limite configurado. |
| R05 | Encantamento de CA, proteção de escudo, equipamentos, traços aditivos e efeitos entram nos bônus, sem duplicação. |
| R06 | Fórmulas alternativas, como Defesa sem Armadura e Armadura Arcana, não se somam entre si. |
| R07 | Traços precisam respeitar concessão, ativação e requisitos, incluindo armadura e escudo separadamente. |
| R08 | Equipar, desequipar, substituir, excluir, transferir ou alterar atributos atualiza a CA imediatamente. |
| R09 | Ficha, prévia e resolução do combate usam uma única função de cálculo e o mesmo detalhamento. |
| R10 | Migração preserva IDs, posse, quantidades, preços, pesos, recursos, ajustes autorais e loot original. |
| R11 | CAs fixas/naturais de criaturas e objetos não recebem DES automaticamente por uma conversão genérica. |
| R12 | Recarregar, exportar/importar e recuperar uma execução não duplica bônus nem reintroduz dados antigos. |

## 3. Achados confirmados no sistema atual

### A01 — Não existe slot de luvas

`site/engine.mjs`, `slotsEquipamento`, declara dez slots. `slotLegado()` coloca nomes de luvas no acessório I. O item-base `item.luvas-de-treino-par` usa `slotEquipamento: "acessorio"`; as três variantes herdam esse destino.

Consequência: hoje é possível usar dois tipos de luvas em acessórios distintos e somar benefícios. A nova regra altera também essa combinação permitida, não somente o desenho do inventário.

### A02 — A CA salva funciona como piso

Em `caAtual()`, a base começa em `ficha.caBase` para personagens comuns. As armaduras entram com `Math.max(base, valorDaArmadura)`. Ao remover a armadura, o valor salvo continua presente.

Reprodução pelo comando real `inventario/desequipar`:

| Ficha | Equipamento removido | CA antes | CA depois, hoje |
|---|---|---:|---:|
| Dragoberto | Armadura Couro Batido | 16 | 16 |
| Draven Thorne | Cota de Malha | 16 | 16 |
| Hannah Montana | Armadura de Couro | 13 | 13 |
| Skimi | Armadura de Couro | 13 | 13 |
| Zurich | Armadura de Couro Batido | 15 | 15 |

### A03 — Sem armadura, DES pode ficar congelada no número salvo

Nikki tem `caBase: 12` e DES 14. Alterar DES para 18 em uma cópia sem armadura mantém CA 12, em vez de recalcular a fórmula proposta `10 + DES`.

O problema também existe em NPCs cuja base técnica é 10: ao retirar todas as proteções, DES pode deixar de participar. Não basta corrigir somente os sete aventureiros.

### A04 — Defesa sem Armadura está ligada ao nome da classe

O motor calcula `10 + DES + SAB` ao encontrar a classe `monge`, desde que `usaArmadura()` seja falso. A definição `habilidade.passiva-defesa-sem-armadura` contém descrição, mas não a fórmula estruturada usada pelo cálculo.

Reprodução: desativar a passiva de Loteria com `ativa: false` mantém CA 14. O cálculo ignora a ativação do traço. Uma fórmula equivalente concedida a outra classe também não seria reconhecida por esse mecanismo.

### A05 — “Sem armadura” mistura armadura corporal e escudo

`usaArmadura()` considera armaduras leves/médias/pesadas **e escudo**. Esse mesmo predicado controla Defesa sem Armadura, bônus condicionais das luvas, Movimento sem Armadura, requisitos de magias e outros ataques desarmados.

É preciso expor os fatos separadamente e preservar as condições autorais atuais por adaptador. Trocar o significado dessa função globalmente alteraria regras que o usuário não pediu para mudar.

### A06 — Armadura Arcana vira um bônus calculado uma vez

Ao aplicar um efeito com `caMinima`, o motor faz:

```js
def.modificadores.ca = Math.max(0, def.caMinima + mod(DES) - caAtual(alvo));
```

Isso grava uma diferença dependente dos equipamentos e efeitos daquele instante. A fórmula não acompanha mudanças posteriores.

Reprodução adicional: Nikki com um efeito de +2 CA recebe Armadura Arcana. O bônus gravado da magia é +1 e a CA conjunta fica 15. Ao remover o efeito de +2, cai para 13. Pela separação proposta, a fórmula de Armadura Arcana seria 13 + DES 2, com +2 adicional enquanto válido: **17 com ambos e 15 após retirar o +2**.

### A07 — A ficha e o motor não apresentam a mesma decomposição

`ficha-view.mjs` exibe `f.caBase` e um campo Bônus calculado por `bonusEfeito + bonusEquipamento + bonusPassiva`. Esse campo não representa todos os termos de `caAtual()`, como atributo da armadura, proteção de escudo em `classeArmadura` e fórmula especial do Monge.

`ui.mjs` salva o input `ca` diretamente em `f.caBase`. Exibir a base calculada nesse mesmo input, sem alterar o salvamento, gravaria um resultado derivado como nova entrada e recriaria o bug.

### A08 — Os encantamentos de armadura estão embutidos na base

Variantes +1/+2 da La Arte elevam `classeArmadura.valor`. Escudos mágicos usam valor de bônus já somado. A mudança exige separar os componentes nos dados, mantendo o total atual de cada item; adicionar outro +1 sobre o número já elevado duplicaria o encantamento.

### A09 — Os quatro itens de luvas têm benefícios distintos

| Referência | Benefício atual a preservar |
|---|---|
| `item.luvas-de-treino-par` | Sem bônus de CA; item-base do par. |
| `item.la-arte.luvas-guarda-mais-1` | +1 CA sob a condição legada `semArmadura`. Pelo predicado atual, escudo também desativa essa condição. |
| `item.la-arte.luva-boxeador-das-ruas-mais-1` | +1 acerto e +1 dano desarmados sem armadura nem escudo; não concede CA. |
| `item.la-arte.luvas-dragao-ascendente-mais-2` | +1 CA e +1 acerto desarmado sem armadura nem escudo; +1d4 de fogo por acerto desarmado permanece mesmo com armadura, conforme cadastro/testes. |

Logo, o “+2” no nome das Luvas do Dragão não pode ser convertido em +2 CA. Somar Luvas da Guarda a uma armadura equipada também violaria a condição já cadastrada.

### A10 — As versões de ocupação não são uniformes

O formato compacto escreve `inventario.versaoOcupacao: 6`. `resolverFicha()` converte a representação de execução para versão 5 e guarda os dados antigos em `_catalogoV2`. `inventarioNormalizado()` tem um caminho rápido para versão 5.

Uma migração baseada apenas em `versaoOcupacao < 6` pode não alcançar os lugares certos, ou repetir a migração a cada carga. Precisam ser tratados o formato persistido, o runtime e os metadados de compactação.

### A11 — A validação de compatibilidade dos slots é ampla demais

As rotas `inventario/equipar` e `confirmarSaque` aceitam qualquer slot válido quando o item declara `slotEquipamento: "acessorio"`. Ao adicionar `luvas`, essa condição permitiria que um acessório genérico ocupasse Luvas por comando.

Além disso, a validação inicial confere se `equipadoSlot` pertence à enumeração, mas não verifica toda a compatibilidade entre item, tipo, slot declarado e slot ocupado. `itensEquipados()` usa a flag `equipado`. A invariância precisa ser garantida no carregamento e na autoridade, não somente no menu.

### A12 — Há normalizações por ID e número que podem desfazer a nova regra

Existem correções específicas para Soldado e Nikki em `atualizarMagias()`. A de Nikki converte certos `caBase` 13/15 para 12. Essas rotinas devem ser limitadas à migração legada; não podem continuar reescrevendo uma configuração de defesa já migrada ou um ajuste manual legítimo.

### A13 — O catálogo é composto e gerado

`site/catalogos/itens.json` não contém sozinho todos os itens usados. `gerar-catalogo-runtime.mjs` aplica as variantes de `site/catalogo-la-arte.mjs`, injeta ícones e produz `catalogo-gerado.mjs`. Corrigir somente o arquivo gerado seria perdido na próxima geração.

### A14 — Recuperação inválida pode retirar fichas da mesa

`recuperarEstado()` valida cada ator; quando encontra fichas inválidas, pode isolá-las e retornar o encontro à preparação. A migração precisa ocorrer antes da rejeição de slots antigos, mantendo backup e original intactos. Uma atualização de enumeração não pode desmontar um combate por causa de luvas legadas.

### A15 — Há divergência real em Dragoberto

`item.armadura-couro-batido` declara base 13, sem atributo, com descrição “CA 13”. A ficha usa `caBase: 16` e DES 17. Outro item, `item.armadura-de-couro-batido`, usado por Zurich, declara 12 + DES.

Não é seguro fundir os dois IDs ou substituir 13 por 12. Também não é seguro habilitar DES em Dragoberto somente para reproduzir 16. Essa definição exige decisão sobre a regra pretendida antes da migração definitiva; ver seção 15.

## 4. Arquitetura proposta

### 4.1 Um resolvedor puro de CA

Criar módulo compartilhado, por exemplo `site/armor-class.mjs`, sem dependência de SDK, DOM ou rede. Ele recebe o ator completo e devolve:

```js
{
  disponivel: true,
  origemBase: { tipo: 'armadura', itemId: '...', nome: 'Camisão de malha +1' },
  base: 13,
  bonusAtributos: 2,
  bonusItens: 1,
  bonusEscudos: 2,
  bonusTracos: 0,
  bonusEfeitos: 0,
  bonusManual: 0,
  bonusTotal: 5,
  total: 18,
  fontes: [ /* IDs estáveis, valores, requisitos e motivos */ ],
  formulasDescartadas: [ /* candidatas inválidas ou não escolhidas */ ]
}
```

O exemplo é base 13 + DES limitada a 2 + encantamento 1 + escudo comum 2. Cada termo aparece uma vez. `caAtual(a)` continua existindo como fachada para consumidores atuais e devolve `resolverCA(a).total`.

Regras do resolvedor:

1. Não mutar a ficha, inventário, efeitos ou catálogo ao consultar CA.
2. Não usar a CA total anterior como entrada ou piso da próxima conta.
3. Não depender de texto de descrição ou do nome da classe para calcular a defesa já migrada.
4. Avaliar requisitos de cada fonte sobre os equipamentos efetivamente válidos.
5. Escolher uma única fórmula-base válida; somar somente os bônus compatíveis.
6. Contar cada contribuição pelo identificador da fonte/campo, não por igualdade numérica.
7. Usar atributos atuais e aplicar o limite configurado ao modificador, inclusive valores negativos.
8. Não impor um teto global novo à CA; validar entradas finitas e preservar as regras de valores existentes.
9. Em um ator público com dados omitidos, devolver defesa indisponível em vez de inventar CA 10.
10. Não persistir a decomposição completa como outra verdade editável; calcular na leitura ou usar cache descartável corretamente invalidado.

Na autoridade, defesa indisponível ou inválida deve impedir a resolução do acerto com diagnóstico recuperável. Não converter ausência em zero, acerto automático ou número padrão. A fachada numérica só é usada quando a defesa completa foi resolvida; vistas públicas sem dados mostram o estado indisponível.

### 4.2 Classificação de proteção separada

Criar helper compartilhado, por exemplo `estadoProtecao(a)`, com `usaArmaduraCorporal`, `usaEscudo`, `usaVesteComum` e itens/fontes correspondentes.

- Luvas e acessórios não são armadura corporal só por estarem equipados.
- Escudo tem sua própria classificação e ocupa a mão conforme as regras atuais.
- Veste simples e variantes não bloqueiam automaticamente os traços de estar sem armadura.
- Adaptar o predicado legado `usaArmadura()` sem mudar silenciosamente as condições de magias, luvas, ataque desarmado e movimento.
- Classificações estruturadas têm precedência. Heurísticas de nomes ficam no importador legado, com diagnóstico de ambiguidade.

### 4.3 Contrato de defesa do personagem

Proposta de novo campo, preservando a leitura dos formatos antigos:

```json
{
  "defesaCA": {
    "versao": 1,
    "modo": "formulas",
    "semArmadura": {
      "base": 10,
      "atributos": [{ "atributo": "des" }]
    },
    "ajusteManual": 0
  }
}
```

Para uma criatura com defesa intrínseca fixa, usar configuração explícita de base fixa e nenhum atributo automático. Por exemplo, base 12 do Crocodilo, 13 de Seu Furtado ou 1 do Saco de Pancadas. “Fixa” descreve a base intrínseca; efeitos adicionais autorizados continuam sendo avaliados conforme suas próprias regras.

`caBase` permanece legível no adaptador legado enquanto for necessário. Depois de migrada, a ficha não pode usar esse número como um piso paralelo. É preciso definir um único caminho de leitura e de gravação; não manter dois campos concorrentes de base ativa.

### 4.4 Contrato de armadura e escudo

É possível preservar a estrutura já existente, separando o encantamento em `modificadores.ca`:

```json
{
  "slotEquipamento": "vestes",
  "categoriaArmadura": "media",
  "classeArmadura": {
    "tipo": "base",
    "valor": 13,
    "classe": "media",
    "atributo": "des",
    "limiteAtributo": 2
  },
  "modificadores": { "ca": 1 }
}
```

O item acima representa o Camisão +1. O modificador de DES será contabilizado em bônus, mesmo que sua configuração continue junto da definição da armadura.

Escudo +1: `classeArmadura.tipo: "bonus"`, `valor: 2`, `modificadores.ca: 1`. Ambos são bônus; nenhum deles troca a base do personagem.

Cuidados:

- Armadura pesada sem atributo habilitado não acrescenta DES.
- Limitar DES a +2 não significa eliminar penalidades de DES negativa.
- Não usar o campo ofensivo genérico `bonusMagico` das armas como CA.
- Não somar encantamento duas vezes quando a definição legada já o embute em `valor`.
- Não apagar outros modificadores do item ao migrar somente sua CA.

### 4.5 Traços e efeitos com fórmulas

Adicionar uma forma declarativa reutilizável, por exemplo `formulaCA`, às concessões/passivas e aos efeitos que substituem a fórmula:

```json
{
  "formulaCA": {
    "id": "defesa-sem-armadura-monge",
    "base": 10,
    "atributos": [{ "atributo": "des" }, { "atributo": "sab" }],
    "requisitos": { "semArmaduraCorporal": true, "semEscudo": true }
  }
}
```

- Traço precisa estar concedido e ativo. Desativar uma concessão retira sua contribuição sem apagar a definição.
- Fórmulas de traços diferentes competem; não juntar atributos de duas Defesas sem Armadura.
- Bônus aditivos de traços ficam separados das fórmulas alternativas.
- Com armadura corporal, a base da armadura deve prevalecer na regra pedida; só entram outras fórmulas que declarem compatibilidade explicitamente.
- Sem armadura corporal, considerar defesa comum, traços e efeitos alternativos válidos. Escolher a maior fórmula completa válida por padrão; desempate estável por prioridade/ID. Uma preferência explícita de fórmula, se suportada, também precisa ser validada.
- O bônus de atributo da fórmula escolhida entra nos bônus da apresentação. Exemplo: Monge base 10, DES +3 e SAB +1 = bônus +4, total 14.
- Armadura natural e fórmulas raciais precisam de dados próprios; não inferir de espécie ou de classe em toda consulta.

Armadura Arcana passa a ser candidata dinâmica de base 13 + DES. Seus requisitos, duração, origem, custos e identificação permanecem no efeito. Eliminar o delta congelado por `caMinima` e migrar efeitos ativos conhecidos sem somar o delta antigo à nova fórmula.

**Compatibilidade autoral:** hoje escudo bloqueia Armadura Arcana e os benefícios legados `semArmadura`; isso está coberto por testes. Não alterar essa regra junto desta adaptação. A política de suspender ou encerrar um efeito ao equipar proteção incompatível deve ser explícita; nunca manter o bônus funcionando apesar de requisitos falsos, nem devolver o custo da magia.

## 5. Slot de Luvas e invariantes do inventário

1. Adicionar `luvas` à lista central de slots, schemas, rótulos, menus e validadores.
2. Item de luvas só ocupa `luvas`. Acessório genérico só pode ocupar `acessorio_1` ou `acessorio_2`; não aceitar qualquer slot por ser acessório.
3. Quantidade 1 significa um par. Quantidade 2 significa dois pares, não duas mãos. Não dividir quantidades por dois na migração.
4. Preservar preço e peso da unidade já cadastrada; não multiplicar por dois por causa da representação visual do par.
5. Manter IDs de instância e de catálogo. Trocar o slot não deve recriar recursos nem recarregar usos gastos.
6. Preservar ocupação das mãos e a regra de armas de duas mãos. Luvas não ocupam mãos nem permitem empunhar equipamento adicional.
7. Substituir um par pelo outro deve guardar o anterior no inventário e atualizar CA, ataques desarmados e demais benefícios na mesma operação.
8. Preservar o custo de equipamentos que o motor já aplica: equipar em slot livre sem a cobrança de substituição; substituir equipamento ou desequipar em combate exige ação bônus. A UI atualmente menciona genericamente “1 ação” e precisa ser alinhada, sem mudar a regra nesta tarefa.
9. Se uma ficha antiga usa dois pares simultaneamente nos acessórios, registrar conflito. Não vender, excluir, duplicar ou escolher silenciosamente o par vencedor. A resolução deve preservar ambos e definir um único par equipado antes da confirmação da migração.
10. Item inválido marcado como equipado não deve conceder benefício apenas pela flag. Validar tipo de equipamento, slot declarado, compatibilidade, exclusividade e quantidade.
11. Aplicar a mesma função de compatibilidade em equipar normal, pegar-e-equipar, importação, loja e carregamento. Evitar regras copiadas e divergentes.

## 6. Correção dos itens +1/+2 sem mudar seus totais

| Variantes La Arte | Valor atual | Nova base/proteção | Bônus adicional |
|---|---:|---:|---:|
| Camisão de malha +1 / +2 | 14 / 15, antes de DES | 13 | +1 / +2 CA |
| Cota de malha +1 / +2 | 17 / 18 | 16 | +1 / +2 CA |
| Placas +1 / +2 | 19 / 20 | 18 | +1 / +2 CA |
| Escudo +1 / +2 | bônus 3 / 4 | bônus de proteção 2 | +1 / +2 CA |

Fontes a editar: `site/catalogo-la-arte.mjs` e, quando necessário, o item-base em `site/catalogos/itens.json`. Gerar novamente o catálogo e a visão de conteúdo configurado. Preservar IDs, ícones, preços, raridades, requisitos de FOR, penalidades de Furtividade e descrições de efeitos.

Revisar todas as 31 entradas do apêndice; não alterar somente o item que estiver na ficha de um jogador. As bases de Vestes simples/variantes, Couro do Passo Macio e Couro da Sombra Curta também participam da seleção de fórmula.

## 7. Plano por aventureiro

| Ficha | Base salva hoje | CA atual | Sem equipamentos hoje | Meta sem proteção, sem efeitos | Ação específica |
|---|---:|---:|---:|---:|---|
| Dragoberto | 16 | 16 | 16 | 13 pela defesa comum proposta | Decidir a definição da armadura CA 13 antes de estabelecer a CA equipada. Não fundir IDs distintos. |
| Draven Thorne | 16 | 16 | 16 | 11 | Tirar o total da Cota do campo intrínseco. Equipado continua 16. |
| Hannah Montana | 13 | 13 | 13 | 12 | Couro base 11 e DES +2; equipada continua 13. |
| Loteria | 14 | 14 | 14 | 14 com o traço ativo | Tornar Defesa sem Armadura declarativa e sensível à ativação. Sem o traço, defesa comum seria 13. |
| Nikki | 12 | 12 | 12 | 12 com DES atual | Trocar o número fixo por 10 + DES; Armadura Arcana fica dinâmica. Retirar a reescrita repetida por ID. |
| Skimi | 13 | 13 | 13 | 12 | Couro base 11 e DES +2; equipada continua 13. |
| Zurich | 15 | 15 | 15 | 13 | Couro Batido base 12 e DES +3; equipado continua 15. |

As metas pressupõem a defesa comum `10 + DES` e os atributos atuais, sem ajustes adicionais ocultos. Elas são critérios para fichas de referência, não autorização para substituir ajustes particulares já feitos numa sala.

Descrições contendo totais fixos, como “CA 11 + DES = 13”, “em Nikki, CA 15” e “Defesa sem Armadura = 14”, precisam deixar claro o valor calculado atual, sem reaproveitar aquele número como regra. Preferir fórmula estática e resultado dinâmico na apresentação.

## 8. NPCs, objetos e entidades que também precisam de tratamento

- `soldado`, `reino-soldado-3`, `reino-comandante-4`, `reino-arqueiro-3`: manter os totais equipados; configurar separadamente defesa comum, armadura e escudo. Retirar proteção deve voltar à defesa correta com atributos, não à base técnica 10 sem DES.
- `reino-mago-3`: veste comum não equivale a armadura corporal. Sem a veste, a defesa comum com DES não deve desaparecer.
- Goblins 1/2: manter 15 equipados; couro e escudo são componentes separados. Não reclassificar o tipo feérico ou a regra autoral de reanimação durante esta mudança.
- Irineu: manter 14 equipado; sua base técnica 10 já foi ajustada anteriormente. Sem couro, a defesa comum proposta é 13, e não o 10 hoje retornado.
- Padre Quevedo: manter 18 equipado, com escamas base 14, DES +2 e escudo +2. Sem equipamentos, defesa comum proposta 12.
- Drow necromante: manter 12 sem magia, com defesa comum dinâmica; revisar Armadura Arcana e Escudo Arcano do protótipo.
- Crocodilo e Mímico: preservar a defesa intrínseca atual 12, sem acrescentar DES de novo por padrão. Estruturar a origem fixa/natural explicitamente.
- Seu Furtado: preservar base intrínseca 13; não converter em 10 + DES −1.
- Zumbi padrão: preservar 9; Zumbi reanimado e Zumbigoblin: preservar 8. Revisar também os modelos de runtime usados ao transformar corpos.
- Saco de Pancadas: preservar **CA 1, 500 PV e inventário vazio**; uma conversão global para defesa comum o quebraria.
- Familiar: modelo embutido com CA 11; Mão Mágica: duas entradas com CA 10. Definir suas origens sem somar atributos novamente ou inventar armadura vestida.

## 9. Mapa de arquivos e responsabilidades

| Área | Arquivo(s) | O que adaptar ou verificar |
|---|---|---|
| Cálculo central | `site/engine.mjs` | `caAtual`, `bonusEquipamento`, `bonusPassiva`, `bonusEfeito`, classificação de armaduras, proficiências e aplicação de efeitos de CA. Delegar ao resolvedor sem quebrar consumidores. |
| Novo domínio | Proposta `site/armor-class.mjs` | Resolver fórmulas, fontes, requisitos e explicação da CA. |
| Slots/normalização | `site/engine.mjs` | `slotsEquipamento`, `slotLegado`, `normalizarItemEquipamento`, `inventarioNormalizado`, `equiparInicial`, `separarCopias`, `slotsOcupadosItem`, `itensEquipados` e validação de ocupação. |
| Rotas de equipamento | `site/engine.mjs` | `inventario`, `confirmarSaque`, exclusão GM, coleta, transferências, compra/venda e alterações de ficha. Evitar benefício residual e troca de slots inválida. |
| Edição da ficha | `site/ficha-view.mjs`, `site/ui.mjs` | CA base/bonus/total, rótulos, detalhamento, leitura do formulário e preview de alterações. Não salvar o total derivado no campo intrínseco. |
| Grade de equipamentos | `site/ficha-view.mjs`, `site/estilo.css` | Rótulo Luvas e 11 slots. A grade atual tem cinco colunas; conferir nova linha, altura, responsividade e espaços vazios sem slots fictícios. |
| Menus de item | `site/ui.mjs` | Equipar Luvas no slot correto; comparação e mensagem de substituição; remover opções de acessório das luvas migradas. |
| Loja | `site/loja.mjs`, `site/loja.css` | Comparação com item do mesmo slot, base/bonus de proteção e encantamento; compras preservam definição/ref e não equipam indevidamente. |
| Saque | `site/saque.mjs`, `site/inventory-cell.mjs` | “Pegar e equipar” com slot Luvas e rótulo legível, comparação correta e unidade = par. Compartilhar a regra de slots com a autoridade. |
| Troca/janelas | `site/troca.mjs`, `site/inventory-popovers.mjs` | Verificar que cada par e os dados novos são transferidos/mostrados corretamente; não é necessário reescrever esses módulos se o caminho genérico já conservar os campos. |
| Fonte de itens | `site/catalogos/itens.json`, `site/catalogo-la-arte.mjs` | Luvas, armaduras, escudos, condições e encantamentos separados. |
| Fonte de traços/magias | `site/catalogos/habilidades.json` | Defesa sem Armadura declarativa, Armadura Arcana, modelos de invocação e textos com totais estáticos. |
| Geração | `gerar-catalogo-runtime.mjs`, `site/catalogos/catalogo-gerado.mjs` | Validar novos campos e gerar artefato. Não editar somente o arquivo gerado. Variantes atualmente são materializadas com revisão 1. |
| Conteúdo configurado | `gerar-catalogo-configurado.mjs`, `site/conteudo-configurado.json` | Atualizar a visão de cadastro para não continuar anunciando configuração antiga. |
| Schemas | `site/fichas/ficha.schema.json`, `site/catalogos/catalogo.schema.json`, `site/catalogo-victor.schema.json` | Novos slots, campos, fórmulas, condições, números finitos e relações; schema de catálogo hoje é amplo dentro da definição. Validação de runtime também precisa mudar. |
| Compactação | `site/catalog.mjs` | `resolverFicha`, `resolverInstancia`, `instanciaDe`, `concessaoDe`, `compactarFicha`, `compactarEstado`, `_catalogoV2` e ajustes persistidos. |
| Conversão antiga | `converter-fichas-forge.mjs`, `migrar-fichas-v2.mjs` | O conversor copia a CA final do Forge para `caBase`. Separar total legado e regra; preservar IDs em vez de regenerar hashes de todo o catálogo. |
| Importação/recuperação | `site/importar-pasta-fichas.mjs`, `site/state-recovery.mjs` | Migrar antes de validar estritamente; diagnóstico/backup sem isolar fichas válidas apenas pelo slot antigo. |
| Sincronização | `site/bridge.mjs`, `site/room-sync.mjs` | Carregamento, publicação de vistas, diffs e clientes com versões diferentes. Não ampliar broadcasts com fichas/fontes sigilosas de NPC. |
| Execuções | `site/executions.mjs` | Dependências de ficha/efeitos, bases antigas de execuções e retomada por versão de regra. Não misturar CA antiga e nova na mesma rolagem. |
| Combate comum | `site/engine.mjs` | Ataques simples, compostos, múltiplos, reações e oportunidades devem continuar consultando a mesma CA. |
| Protótipos | `site/prototipos-cemiterio.mjs` | Toque Vampírico já consulta `api.caAtual`; preservar isso e a reação Escudo Arcano. |
| HUD/efeitos | `site/hud-ui.mjs`, `site/hud-controller.mjs` | Textos/fontes de efeitos, carta e valores públicos, quando aplicável. Não gerar outro cálculo de CA no controlador. |
| Sobreposição | `site/substituicao-ficha.mjs`, `site/modelos/reanimacao.mjs` | Defesa da camada nova e da ficha original; inventário compartilhado e restauração sem duplicar loot. |
| Fichas distribuídas | `site/fichas/*.json`, `conteudo/aventura-no-cemiterio/*.json`, `site/downloads` | Metadados novos, referências, exemplos, pacote atual e documentação. Ver lista integral de arquivos no JSON de evidências. |
| Ícones/arte | `site/catalogos/icones-itens.json`, `site/item-art.mjs` | Conferir referências existentes. Não há necessidade identificada de gerar novas artes para implementar a regra. |
| Entrega | `validar-versao.mjs`, manifesto, referências `?v=`, docs e workflow de publicação | Fazer a atualização de cache e checks somente na futura entrega funcional. Nesta etapa não publicar. |

## 10. Lugares onde a migração precisa procurar dados

Não fazer uma substituição textual global de `acessorio` por `luvas` ou de `caBase` por 10.

- Ficha-base e instâncias dos atores ativos, inclusive NPCs duplicados e entidades invocadas.
- `gruposFichas` e modelos importados, para que a próxima unidade adicionada já nasça coerente.
- Itens de inventário, recipientes/baús/chão, sessões de saque, ofertas de troca, lojas e recompras/estoque serializados.
- `ref`, `catalogoRef`, `definicaoLocal` e `ajustes` de instância. Um ajuste legado pode continuar sobrepondo o slot/base novos do catálogo.
- `_catalogoV2.instancias` e concessões, para que compactar não restaure os valores antigos depois da migração.
- Efeitos ativos conhecidos de Armadura Arcana com delta de CA congelado; conservar duração, origem e custo já pago.
- `sobreposicaoFicha.fichaOriginal`, além da camada atual. O inventário original foi deliberadamente esvaziado: os itens vivos pertencem ao inventário compartilhado atual.
- Bases de execuções pendentes, snapshots e intenções. Não reinterpretar resultados já obtidos sob outra versão de regra.
- Backups e JSONs importados posteriormente, inclusive os antigos ZIPs de distribuição.
- Registros de quarentena: preservar o documento bruto exatamente como está e migrar somente uma cópia quando for recuperado. Não normalizar o original isolado.

## 11. Estratégia de compatibilidade e migração

### 11.1 Leitura compatível antes da escrita nova

1. Definir uma versão de regras de CA própria e uma nova versão de ocupação. Documentar explicitamente a relação entre representação persistida e runtime; não assumir que os atuais 5 e 6 significam a mesma coisa.
2. Ampliar leitores/schemas para reconhecer os dados novos e adaptar os antigos antes da rejeição.
3. Preservar IDs de catálogo e de instância; incrementar revisões das definições realmente alteradas. Se houver incremento de `versaoCatalogo`, atualizar fontes de itens/habilidades, gerador e consumidores juntos.
4. Não reexecutar o migrador de todo o catálogo para gerar IDs novos por conteúdo: referências, lojas, ícones e fichas existentes dependem dos IDs atuais.

### 11.2 Auditoria sem gravar

Criar comando/ferramenta de simulação que produza, por ator e item: regra atual, regra proposta, CA antes/depois equipado/sem proteção, mudanças de slot, conflitos, ajustes preservados e pendências. Exportar o resultado para revisão antes de gravar a migração de uma mesa.

### 11.3 Aplicação idempotente e transacional

1. Salvar backup do estado e versão do catálogo usado.
2. Trabalhar em uma cópia. Identificar fichas/itens por IDs e assinaturas legadas conhecidas, não apenas pelo nome.
3. Separar CA total legada de defesa intrínseca quando a origem for demonstrável. Casos autorais ambíguos mantêm valor legado identificado até revisão, sem inventar uma fórmula.
4. Migrar luvas para o novo slot, preservando pares/quantidade e flags explícitas. Resolver conflitos sem perder itens ou escolher o par vencedor silenciosamente.
5. Separar os encantamentos embutidos dos oito itens da tabela e remover somente o componente legado reconhecido. Ajustes particulares não podem ser apagados por coincidirem numericamente com um bônus.
6. Migrar fórmulas/traços/efeitos ativos conhecidos. Remover o delta antigo de Armadura Arcana somente quando sua origem for identificada.
7. Atualizar metadados de compactação e cópias previstas na seção 10.
8. Validar todos os invariantes na cópia, incluindo incompatibilidade de slots e preservação de inventário/recursos.
9. Gravar atomicamente estado e versão de migração. Nenhuma etapa deve cobrar ação, recarregar recurso, ativar traço desligado ou mudar a iniciativa.
10. Reexecutar a migração e comprovar que o resultado não muda. Compactar → resolver → validar → compactar também deve ser estável.

### 11.4 Execuções e clientes antigos

- Evitar migrar uma sala com dados lançados ou uma ação de movimento/habilidade no meio. Concluir ou cancelar pela autoridade antes da troca de regra; não rerrolar automaticamente.
- Se for necessário permitir migração com pendência, a execução precisa carregar sua versão de regra e uma política explícita de retomada. Essa compatibilidade não pode ser presumida porque o JSON ainda abre.
- Invalidar o cache da entrega futura e detectar cliente/controlador antigo antes de aceitar comandos com semântica de slot antiga.
- Manter rollback com o backup e os assets/catálogo correspondentes, sem duplicar itens ou ressuscitar saldos consumidos.

## 12. Comportamentos de CA que exigem regressão

### Fórmulas e atributos

- Defesa comum, atributo habilitado/desabilitado, DES negativa, limite de +2 e mudança de atributo após equipar.
- Armadura de base inferior à antiga CA salva: não manter um piso invisível.
- Troca entre armadura leve/média/pesada, vestir roupa comum e retirar toda a proteção.
- Monge com traço concedido/ativo/inativo, com armadura e com escudo; múltiplas fórmulas sem somar SAB/CON/DEX de fontes alternativas.
- Bônus aditivo de passiva separado de uma passiva que fornece fórmula-base.
- Corpo/objeto de CA fixa e ficha pública com defesa omitida.

### Itens e slots

- Quatro luvas, um par por unidade, dois pares no inventário, equipar/substituir/desequipar, conflito legado de dois pares equipados.
- Luvas com arma de duas mãos; proteção de mãos continua inalterada.
- Acessório genérico tentando ocupar Luvas, item não equipamento marcado como equipado, dois itens no mesmo slot e slot forjado por comando.
- Guarda e Dragão: CA condicional desativada por proteção incompatível; Boxeador não altera CA; fogo do Dragão permanece nas condições atuais.
- Armadura +1/+2 e escudo +1/+2, sem contar duas vezes o encantamento.
- Escudo sem proficiência, armadura sem treinamento, requisito de FOR e Furtividade: preservar as regras atuais, inclusive a restrição de CA do escudo hoje coberta por testes.
- Recursos concedidos por item não são recarregados ao migrar ou substituir o par; benefícios desaparecem/restauram corretamente ao desequipar/equipar.

### Magias, efeitos e combate

- Armadura Arcana antes/depois de outro bônus de CA, alteração de DES durante o efeito e interação com uma fórmula de defesa superior.
- Arcana e proteção incompatível: respeitar a política autoral decidida, sem bônus residual e sem devolver custos.
- Escudo da Fé +2, perda de concentração, duração/descanso/dissipação e remoção do efeito.
- Escudo Arcano +5: reavaliação do acerto, expiração, crítico e bloqueio de Mísseis Mágicos preservados.
- Proteção contra Lâminas continua penalizando o ataque; não convertê-la em CA fixa nem ignorar a rolagem do d4.
- Defesa Paciente/Esquiva continua alterando o modo do ataque conforme a automação atual, sem inventar bônus de CA.
- Ataque comum, composição, vários ataques, reação, oportunidade e Toque Vampírico usam o mesmo total.
- Alteração de defesa enquanto existe execução pendente é bloqueada/revalidada sem misturar versões ou cobrar duas vezes.

### Fluxos e apresentação

- Equipar na ficha e por “Pegar e equipar”; comprar, vender, recomprar, trocar, depositar e excluir item pelo GM.
- Base + bônus apresentados somam exatamente o total usado pelo ataque. Fontes inativas explicam a condição que falhou.
- Salvar ficha não escreve total derivado em `caBase`; preview de edição não grava dados nem duplica fontes.
- GM e jogador veem o mesmo resultado permitido; detalhes privados de NPC não vazam em tooltip, broadcast ou carta de dado.
- Onze slots em telas largas/estreitas, menus sem opção errada e visual de item equivalente no slot correto.
- Sem regeneração de arte, sem novo upload de imagens e sem crescimento significativo do estado por decomposição derivada duplicada.

### Persistência e conteúdos

- Todos os sete aventureiros e os demais atores do apêndice, com marcos explícitos de CA equipada/sem equipamento.
- Importação v1/v2, definições locais, ajustes, pacotes antigos e nova exportação.
- F5 no GM/jogador, troca de controlador, migração repetida, compactação idempotente, sala com grupos personalizados e backup restaurado.
- Sobrepor/remover ficha de zumbi sem duplicar inventário original; CA 8/9/13 dos mortos-vivos e CA 1 do saco preservadas quando não houver fontes adicionais.
- Familiar/Mão Mágica não recebem DES duplicada.
- Compatibilidade com movimento dinâmico e interrupção por oportunidade; preservar Sopro de Dragão, hitbox e recursos publicados.

## 13. Testes existentes que devem ser preservados e ampliados

| Arquivo | Cobertura relevante |
|---|---|
| `combate.test.mjs` | Equipamentos, armaduras, proficiência de escudo, Monge, Arcana, itens +1/+2, luvas, exclusão GM, trocas e combate. Há testes de luvas que ainda equipam em `acessorio_1` e precisam mudar junto da migração. |
| `monk-composition.test.mjs` | Ataques/curas e custos do Monge; integração dos modificadores desarmados. |
| `prototipos-cemiterio.test.mjs` | Arcana, Escudo Arcano, Fé, Toque Vampírico, sobreposição e defesas dos zumbis. |
| `cemiterio.test.mjs`, `cemiterio-aventureiros.test.mjs` | Fichas distribuídas e confrontos com aventureiros. |
| `alvo-treino.test.mjs` | CA 1 e 500 PV do saco, inclusive após compactar/restaurar. |
| `state-recovery.test.mjs` | Migração antes de rejeição/quarentena e preservação do bruto. |
| `master-groups.test.mjs` | Modelos importados e adição de unidades. |
| `recipientes.test.mjs`, `loot-sync.test.mjs` | Saque, recipientes e dados de itens transferidos. |
| `descansos.test.mjs` | Efeitos, recursos de itens e regras de descanso já publicadas. |
| `executions.test.mjs`, `room-sync.test.mjs`, `room-delta.test.mjs` | Persistência, dependências, deltas e retomada. |
| `dynamic-movement.test.mjs`, `target-geometry.test.mjs` | Reação/oportunidade e execução após aproximação, sem regressão de hitbox. |
| `reanimacao-token-sync.test.mjs` | Fluxo de sobreposição/token; a mudança de defesa não deve refazer o token indevidamente. |

Adicionar testes puros do resolvedor, migração e conservação de dados; depois integração no navegador com duas sessões. Não basta alterar snapshots para aceitar novos totais: cada alteração de expectativa deve estar ligada a uma fórmula e a uma decisão registrada.

## 14. Sequência recomendada de implementação

| Fase | Entrega | Critério de saída |
|---|---|---|
| P0 | Fechar decisões da seção 15 e registrar CA esperada por ficha | Nenhuma alteração autoral implícita. |
| P1 | Contratos de dados e resolvedor puro | Base/bônus/total e requisitos demonstráveis em testes. |
| P2 | Leitor legado e migração em simulação | Relatório antes/depois, conflitos e idempotência, sem gravar a sala. |
| P3 | Atualização das fontes do catálogo e modelos | IDs preservados; variantes sem bônus duplo; quatro luvas no novo slot. |
| P4 | Autoridade do inventário e cálculo de combate | Mesma validação em equipar, saque e carregamento; todas as rotas usam o resolvedor. |
| P5 | Ficha, menus, comparações e apresentação | Onze slots; salvar não grava resultados derivados; decomposição bate com o total. |
| P6 | Persistência, efeitos ativos e sobreposições | Round-trip estável, sem recursos/loot extras e sem quebrar pendências. |
| P7 | Fichas e pacotes de referência | Matriz de CA aprovada, novos pacotes/documentação coerentes. |
| P8 | Regressão completa e ensaio GM/jogador | Baseline 451 testes preservada/ampliada e cenários da seção 12 aprovados. |
| P9 | Entrega funcional e migração controlada | Backup, cache/versão, verificação pública e procedimento de rollback. Só em tarefa de implementação autorizada. |

## 15. Decisões pendentes e limites de autorização

1. **Dragoberto:** confirmar se a armadura cadastrada como CA 13 é fixa ou usa atributo, e de onde vem a CA 16 salva. Não corrigir para outro item “parecido” por nome.
2. **Conflito de luvas legadas:** definir a interface para escolher um único par quando houver dois equipados. Proposta: relatório de conflito preservando ambos, com resolução explícita antes de confirmar a migração.
3. **Efeito de fórmula incompatível:** definir se equipar proteção suspende a contribuição ou encerra definitivamente cada efeito. A arquitetura suporta requisitos; não inventar mudança de duração/custo na implementação.
4. **Ajustes particulares:** distinguir CA total legada de ajuste manual legítimo em fichas não canônicas. Proposta: valor legado identificado e revisão, sem subtração heurística de bônus desconhecidos.
5. **Versões e pendências:** decidir se a primeira entrega exige mesa sem execução pendente ou se haverá compatibilidade explícita de regras por execução. Não migrar diário já rolado como se fosse uma ficha ociosa.

Regras que já estão suficientemente determinadas: um par por slot; atributos e encantamentos separados da base; Defesa sem Armadura por traço; preservar as condições autorais reais das luvas; não alterar regras de proficiência, Sopro, loot ou movimento nesta adaptação.

## 16. Pacotes e documentação distribuída

- `site/downloads/aventura-no-cemiterio.zip`: 11 fichas; gerar versão atualizada coerente com as fontes quando a adaptação for implementada.
- `site/downloads/saco-de-pancadas.json` e `.zip`: preservar CA 1 e o restante da ficha; atualizar somente o necessário para o contrato novo.
- `fichas-drow-e-padre-0.8.56.zip` e `...0.8.58.zip`, além das pastas correspondentes: tratar como históricos versionados. Não reescrever silenciosamente pacotes antigos; garantir importação compatível e oferecer pacote novo.
- `Leia-me-cemiterio.md`, documentação dos protótipos, exemplos de importação e prompts que declarem `caBase` como total precisam ser revisados para não gerar novas fichas com o problema.
- O novo relatório de migração deve listar o que foi preservado, alterado ou deixado pendente, incluindo a origem da fórmula adotada.

## 17. Condição de conclusão da futura adaptação

O trabalho só estará concluído quando retirar uma armadura realmente trocar a fórmula usada, a conta exibida bater com a conta do combate, todos os efeitos/traços válidos forem reavaliados, somente um par ocupar Luvas, e os mesmos resultados sobreviverem a importação, F5, troca de equipamento, sobreposição e restauração — sem perda ou duplicação de itens, ações ou recursos.

As seções seguintes são inventários extraídos do checkout, para que a implementação não dependa de lembrar apenas dos personagens ou itens citados no chat.

## 18. Inventário integral de fichas e baseline

Esta tabela contém os 24 IDs distintos. Os valores são **observados no motor atual**, não expectativas da nova arquitetura. “Sem armadura corporal” retira somente leves/médias/pesadas; “sem equipamentos” desmarca todos os equipamentos, preservando traços e atributos.

| ID | Nome | DES / SAB | Base normalizada | CA equipada atual | Sem armadura corporal hoje | Sem equipamentos hoje |
|---|---|---|---|---|---|---|
| `dragoberto` | Dragoberto | 17 / 15 | 16 | 16 | 16 | 16 |
| `draven-thorne` | Draven Thorne | 13 / 12 | 16 | 16 | 16 | 16 |
| `hannah-montana` | Hannah Montana | 14 / 12 | 13 | 13 | 13 | 13 |
| `loteria` | Loteria | 17 / 12 | 14 | 14 | 14 | 14 |
| `nikki` | Nikki Lauda | 14 / 12 | 12 | 12 | 12 | 12 |
| `reino-arqueiro-3` | Arqueiro do Reino · nível 3 | 16 / 12 | 10 | 14 | 10 | 10 |
| `reino-comandante-4` | Comandante do Reino · nível 4 | 14 / 12 | 10 | 17 | 12 | 10 |
| `reino-mago-3` | Mago do Reino · nível 3 | 14 / 12 | 10 | 12 | 12 | 10 |
| `reino-soldado-3` | Soldado do Reino · nível 3 | 12 / 11 | 10 | 16 | 12 | 10 |
| `saco-de-pancadas` | Saco de Pancadas | 10 / 10 | 1 | 1 | 1 | 1 |
| `skimi` | Skimi | 14 / 12 | 13 | 13 | 13 | 13 |
| `soldado` | Soldado da guarda | 12 / 11 | 10 | 16 | 12 | 10 |
| `zurich` | Zurich | 17 / 14 | 15 | 15 | 15 | 15 |
| `crocodilo` | Crocodilo | 10 / 10 | 12 | 12 | 12 | 12 |
| `drow-necromante-6` | Drow necromante — Nv6 | 14 / 12 | 12 | 12 | 12 | 12 |
| `cemiterio-goblin-1` | Goblin 1 — séquito do necromante | 15 / 8 | 10 | 15 | 12 | 10 |
| `cemiterio-goblin-2` | Goblin 2 — séquito do necromante | 15 / 8 | 10 | 15 | 12 | 10 |
| `cemiterio-zumbigoblin` | Zumbigoblin | 6 / 6 | 8 | 8 | 8 | 8 |
| `irineu-ladino-3` | Irineu — Ladino Nv3 | 16 / 13 | 10 | 14 | 10 | 10 |
| `mimico` | Mímico | 12 / 13 | 12 | 12 | 12 | 12 |
| `padre-quevedo` | Padre Quevedo | 14 / 18 | 10 | 18 | 12 | 10 |
| `seu-furtado-zumbi-4` | Seu Furtado — Zumbi Nv4 | 8 / 10 | 13 | 13 | 13 | 13 |
| `zumbi-padrao-3` | Zumbi padrão — Nv3 | 8 / 6 | 9 | 9 | 9 | 9 |
| `cemiterio-zumbi-reanimado` | Zumbi reanimado | 6 / 6 | 8 | 8 | 8 | 8 |

### 18.1 Os 29 arquivos inspecionados

| Arquivo | ID | Formato / ocupação na fonte | CA carregada |
|---|---|---|---|
| `site/fichas/dragoberto.json` | `dragoberto` | 2 / 6 | 16 |
| `site/fichas/draven-thorne.json` | `draven-thorne` | 2 / 6 | 16 |
| `site/fichas/hannah-montana.json` | `hannah-montana` | 2 / 6 | 13 |
| `site/fichas/loteria.json` | `loteria` | 2 / 6 | 14 |
| `site/fichas/nikki.json` | `nikki` | 2 / 6 | 12 |
| `site/fichas/reino-arqueiro-3.json` | `reino-arqueiro-3` | 2 / 6 | 14 |
| `site/fichas/reino-comandante-4.json` | `reino-comandante-4` | 2 / 6 | 17 |
| `site/fichas/reino-mago-3.json` | `reino-mago-3` | 2 / 6 | 12 |
| `site/fichas/reino-soldado-3.json` | `reino-soldado-3` | 2 / 6 | 16 |
| `site/fichas/saco-de-pancadas.json` | `saco-de-pancadas` | 2 / ausente | 1 |
| `site/fichas/skimi.json` | `skimi` | 2 / 6 | 13 |
| `site/fichas/soldado.json` | `soldado` | 2 / 6 | 16 |
| `site/fichas/zurich.json` | `zurich` | 2 / 6 | 15 |
| `conteudo/aventura-no-cemiterio/crocodilo.json` | `crocodilo` | 2 / ausente | 12 |
| `conteudo/aventura-no-cemiterio/drow-necromante-6.json` | `drow-necromante-6` | 2 / ausente | 12 |
| `conteudo/aventura-no-cemiterio/goblin-1.json` | `cemiterio-goblin-1` | 2 / ausente | 15 |
| `conteudo/aventura-no-cemiterio/goblin-2.json` | `cemiterio-goblin-2` | 2 / ausente | 15 |
| `conteudo/aventura-no-cemiterio/goblin-zumbi.json` | `cemiterio-zumbigoblin` | 2 / ausente | 8 |
| `conteudo/aventura-no-cemiterio/irineu-ladino-3.json` | `irineu-ladino-3` | 2 / ausente | 14 |
| `conteudo/aventura-no-cemiterio/mimico.json` | `mimico` | 2 / ausente | 12 |
| `conteudo/aventura-no-cemiterio/padre-quevedo.json` | `padre-quevedo` | 2 / ausente | 18 |
| `conteudo/aventura-no-cemiterio/seu-furtado-zumbi-4.json` | `seu-furtado-zumbi-4` | 2 / ausente | 13 |
| `conteudo/aventura-no-cemiterio/zumbi-padrao-3.json` | `zumbi-padrao-3` | 2 / ausente | 9 |
| `conteudo/aventura-no-cemiterio/zumbi-reanimado.json` | `cemiterio-zumbi-reanimado` | 2 / ausente | 8 |
| `site/downloads/fichas-prototipo-0.8.56/drow-necromante-6.json` | `drow-necromante-6` | 2 / ausente | 12 |
| `site/downloads/fichas-prototipo-0.8.56/padre-quevedo.json` | `padre-quevedo` | 2 / ausente | 18 |
| `site/downloads/fichas-prototipo-0.8.58/drow-necromante-6.json` | `drow-necromante-6` | 2 / ausente | 12 |
| `site/downloads/fichas-prototipo-0.8.58/padre-quevedo.json` | `padre-quevedo` | 2 / ausente | 18 |
| `site/downloads/saco-de-pancadas.json` | `saco-de-pancadas` | 2 / ausente | 1 |

### 18.2 Pacotes inspecionados sem alteração

| ZIP em site/downloads | Ocorrências de ficha JSON |
|---|---|
| `aventura-no-cemiterio.zip` | 11 |
| `fichas-drow-e-padre-0.8.56.zip` | 2 |
| `fichas-drow-e-padre-0.8.58.zip` | 2 |
| `saco-de-pancadas.zip` | 1 |

Os nomes das entradas, IDs e bases dentro dos ZIPs constam nas evidências. Cópias históricas são alvos de **compatibilidade de leitura**, sem obrigação de reescrever o arquivo histórico.

## 19. Inventário integral dos 31 itens relevantes

Todos têm revisão 1 no catálogo auditado. A tabela descreve o cadastro atual. Não deduzir a fórmula somente do nome; consultar atributos, limites, condições e origem no JSON de evidências.

| Referência | Nome | Slot atual | CA declarada atual | Bônus/condição atual |
|---|---|---|---|---|
| `item.armadura-couro-batido` | Armadura Couro Batido | vestes | base 13 | — |
| `item.armadura-de-couro` | Armadura de Couro | vestes | base 11 + DES | — |
| `item.armadura-de-couro-batido` | Armadura de Couro Batido | vestes | base 12 + DES | — |
| `item.armadura-de-placas` | Armadura de placas | vestes | base 18 | — |
| `item.camisa-de-malha` | Camisa de malha | vestes | base 13 + DES (limite 2) | — |
| `item.camisao-de-malha` | Camisão de malha | vestes | base 13 + DES (limite 2) | — |
| `item.cota-de-malha` | Cota de malha | vestes | base 16 | — |
| `item.cota-de-malha-09004bac` | Cota de Malha | vestes | base 16 | — |
| `item.couro-batido` | Couro batido | vestes | base 12 + DES | — |
| `item.escudo` | Escudo | mao_fraca | bônus 2 | — |
| `item.escudo-b66123ac` | Escudo | mao_fraca | bônus 2 | — |
| `item.luvas-de-treino-par` | Luvas de treino (par) | acessorio | — | — |
| `item.veste-simples` | Veste simples | vestes | base 10 + DES | — |
| `item.armadura-de-escamas` | Armadura de escamas | vestes | base 14 + DES (limite 2) | — |
| `item.la-arte.veste-bolsos-oficina` | Veste dos Bolsos de Oficina | vestes | base 10 + DES | {"capacidadeCargaKg":14} |
| `item.la-arte.veste-ultimo-folego` | Veste do Último Fôlego | vestes | base 10 + DES | — |
| `item.la-arte.couro-passo-macio` | Couro do Passo Macio | vestes | base 12 + DES | {"furtividade":1} |
| `item.la-arte.camisao-malha-mais-1` | Camisão de malha +1 | vestes | base 14 + DES (limite 2) | — |
| `item.la-arte.cota-malha-mais-1` | Cota de malha +1 | vestes | base 17 | — |
| `item.la-arte.placas-mais-1` | Armadura de placas +1 | vestes | base 19 | — |
| `item.la-arte.escudo-mais-1` | Escudo +1 | mao_fraca | bônus 3 | — |
| `item.la-arte.luvas-guarda-mais-1` | Luvas da Guarda +1 | acessorio | — | {"semArmadura":{"ca":1}} |
| `item.la-arte.luva-boxeador-das-ruas-mais-1` | Luva de Boxeador das Ruas +1 | acessorio | — | {"semArmadura":{"ataqueDesarmado":1,"danoDesarmado":1}} |
| `item.la-arte.veste-passo-nebuloso` | Veste do Passo Nebuloso | vestes | base 10 + DES | — |
| `item.la-arte.veste-trama-serena` | Veste da Trama Serena | vestes | base 10 + DES | — |
| `item.la-arte.couro-sombra-curta` | Couro da Sombra Curta | vestes | base 12 + DES | — |
| `item.la-arte.camisao-malha-mais-2` | Camisão de malha +2 | vestes | base 15 + DES (limite 2) | — |
| `item.la-arte.cota-malha-mais-2` | Cota de malha +2 | vestes | base 18 | — |
| `item.la-arte.placas-mais-2` | Armadura de placas +2 | vestes | base 20 | — |
| `item.la-arte.escudo-mais-2` | Escudo +2 | mao_fraca | bônus 4 | — |
| `item.la-arte.luvas-dragao-ascendente-mais-2` | Luvas do Dragão Ascendente +2 | acessorio | — | {"semArmadura":{"ca":1,"ataqueDesarmado":1}} |

## 20. Habilidades e traços defensivos localizados

| Referência | Nome | Tratamento |
|---|---|---|
| `habilidade.reino.escudo-arcano` | Escudo Arcano (Shield) — 1º CÍRCULO / REAÇÃO | Texto assistido pelo mestre; retirar totais rígidos da explicação quando aplicável, sem automatizar por nome. |
| `habilidade.1-armadura-arcana-defesa-classe` | 1º \| Armadura Arcana · defesa · classe | Substituir delta congelado por fórmula dinâmica; migrar efeito conhecido e preservar duração/requisitos. |
| `habilidade.1-escudo-da-fe` | 1º \| Escudo da Fé | Bônus aditivo; preservar concentração, duração, custo e origem. |
| `habilidade.defesa-paciente` | Defesa Paciente | Desengajar/Esquiva; não converter em bônus de CA. |
| `habilidade.defesa-paciente-foco` | Defesa Paciente · Foco | Desengajar/Esquiva; não converter em bônus de CA. |
| `habilidade.passiva-defesa-sem-armadura` | Passiva \| Defesa sem Armadura | Declarar fórmula e requisitos; respeitar concessão/ativa. |
| `habilidade.passiva-movimento-sem-armadura` | Passiva \| Movimento sem Armadura | Revisar predicado de proteção sem mudar o benefício. |
| `habilidade.protecao-e-tatica` | Proteção e tática | Revisar descrição e requisitos; nome defensivo não implica modificador de CA. |
| `habilidade.truque-protecao-contra-laminas` | Truque \| Proteção contra Lâminas | Penalidade no ataque, não CA; preservar 1d4. |
| `habilidade.truque-protecao-contra-laminas-concentracao-classe` | Truque \| Proteção Contra Lâminas · concentração · classe | Penalidade no ataque, não CA; preservar 1d4. |
| `habilidade.cemiterio.necromante-armadura-arcana` | Armadura Arcana | Substituir delta congelado por fórmula dinâmica; migrar efeito conhecido e preservar duração/requisitos. |
| `habilidade.cemiterio.necromante-escudo-arcano` | Escudo Arcano | Reação +5 CA e bloqueio de Mísseis; revalidar acerto e expiração. |
| `habilidade.cemiterio.quevedo-escudo-fe` | Escudo da Fé | Bônus aditivo; preservar concentração, duração, custo e origem. |
| `habilidade.cemiterio.quevedo-protecao` | Proteção contra o Bem e o Mal | Preservar proteção/desvantagem e protótipo; não adicionar CA. |

A busca percorreu nomes defensivos e campos numéricos de CA/fórmula. Essas 14 entradas não equivalem a 14 modificadores de CA: há habilidades que alteram modo/resultado do ataque e descrições assistidas. Campos autorais desconhecidos e concessões locais precisam do diagnóstico de migração, não de uma regex de nomes no cálculo final.

## 21. Dependências críticas adicionais

- **Escudo mágico sem proficiência:** ao separar +1/+2 em `modificadores.ca`, condicionar também esse encantamento à elegibilidade do escudo. Caso contrário, o caminho genérico de bônus concederia +1 mesmo quando a proteção 2 é negada pela regra atual. Testar escudo comum, +1 e +2 com/sem proficiência.
- **Dados incompletos:** a normalização legada pode inferir armadura de base 0 quando falta o número. O antigo `Math.max` escondia isso. Ausência de base não é base zero: diagnosticar antes de usar a nova precedência da armadura.
- **Loja de Victor:** `catalogo-victor.schema.json` valida o envelope da loja e permite `ajustes` livres, não define diretamente todos os campos de CA. Revisar referências/ajustes e a validação após resolução; não adicionar slots a um enum que esse schema não possui.
- **Desempenho:** resolver por ator/estado de forma pura, reutilizando o resultado no mesmo render. Não serializar todas as fontes derivadas em cada delta de sala. Se houver cache, invalidar por atributos, itens/ocupação, proficiências, concessões/ativação, efeitos e versão de regra. Medir antes de introduzir cache persistente.
- **Limite do baseline:** os 9.550 ms da suíte não medem o tempo de resposta de GM/jogador nem tráfego da extensão. A futura implementação deve comparar carga de ficha/inventário e tamanho do estado serializado sob as mesmas condições antes/depois.

## 22. Rastreabilidade e lista de execução futura

| Frente | Achados corrigidos/afetados | Requisitos | Entrega verificável |
|---|---|---|---|
| Slot Luvas e autoridade | A01, A09, A11 | R01, R02, R08, R10 | Um par; validação comum; acessórios restritos; nenhuma perda de itens. |
| Resolvedor e campos de defesa | A02, A03, A04, A05, A07 | R03, R04, R06, R07, R09, R11 | Uma fórmula ativa; atributos atuais; fonte rastreável; CA fixa preservada. |
| Itens e variantes | A08, A09, A13 | R04, R05, R10 | Oito encantamentos separados; quatro luvas; sem duplicação ou alteração ofensiva. |
| Magias/traços/consumidores | A04, A05, A06 | R05, R06, R07, R08, R09 | Arcana dinâmica; Fé/Shield aditivos; todos os ataques consultam o mesmo total. |
| Ficha e comparações | A07, A11 | R08, R09 | Base + bônus = total; salvar não congela CA; onze slots e rótulos corretos. |
| Migração/persistência | A10, A12, A14, A15 | R10, R11, R12 | Leitor compatível; simulação; conflitos; round-trip; transação e rollback. |
| Conteúdo/distribuição | A08, A09, A13, A15 | R04, R10, R11, R12 | 24 IDs avaliados; 29 arquivos e pacotes classificados; originais históricos importam. |

- [x] Auditar checkout e definições materializadas; registrar baseline e reproduções.
- [x] Inventariar fichas, pacotes, itens, habilidades, caminhos de persistência e consumidores.
- [x] Propor contratos, migração, sequência de implementação e critérios de aceitação.
- [ ] Resolver as cinco decisões da seção 15 antes das respectivas mudanças dependentes.
- [ ] Implementar P1–P7 com diagnóstico e testes por invariantes.
- [ ] Executar P8 em duas sessões, com casos de importação/rolagens/equipamentos/recuperação.
- [ ] Autorizar e executar a entrega funcional P9 em tarefa posterior.

O repositório deve receber esta arquitetura e as evidências em uma branch de documentação. A issue vinculada acompanha a implementação futura; criar a issue não significa que o código foi adaptado.

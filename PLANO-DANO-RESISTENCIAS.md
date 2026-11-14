# Arquitetura — dano, resistências e resultado final

## Decisões fechadas

- A base será compatível com D&D 5e 2014 e SRD 5.2.1/2024. As diferenças de uma habilidade ficam nos dados da habilidade, não em cálculos duplicados no motor.
- Existem **13 tipos oficiais de dano**. “Lâmina”, “arma”, “ataque”, “mágico” e “não mágico” serão tags/filtros de origem, nunca tipos de dano.
- Cada parcela conserva seu próprio tipo e suas tags até o fim da resolução.
- O motor produzirá um relatório imutável antes de alterar PV. A mesma transação aplica o relatório ao estado, evitando diferença entre o número exibido e o número persistido.
- O resultado principal mostrará **PV perdido**, exatamente o valor retirado da barra. Também preservará dano recebido, PV temporários absorvidos e excesso de dano, pois esses valores alimentam concentração, morte instantânea e outros gatilhos.
- Cada tipo terá cor própria no resultado. Nome e símbolo continuarão visíveis: cor nunca será a única forma de identificar o tipo.
- Dados coloridos no Dice+ serão uma melhoria opcional. O resultado da La Arte continuará correto mesmo sem modelos personalizados no Dice+.

## Regras oficiais que o motor deve respeitar

O SRD define treze tipos. Eles não possuem regras automáticas próprias; são chaves usadas por resistência, vulnerabilidade, imunidade e efeitos específicos.

Ordem oficial do SRD 5.2.1:

1. aplicar ajustes de dano, como bônus, penalidades, reduções e multiplicadores;
2. aplicar resistência, dividindo por 2 e arredondando para baixo;
3. aplicar vulnerabilidade, multiplicando por 2;
4. nunca acumular duas resistências ou duas vulnerabilidades aplicáveis ao mesmo dano;
5. imunidade faz a parcela correspondente causar 0;
6. PV temporários absorvem o dano já resolvido antes dos PV reais.

O exemplo oficial de 28 de fogo com redução 5, resistência e vulnerabilidade deve resultar em: 28 − 5 = 23; resistência = 11; vulnerabilidade = 22.

Redução de dano não é uma categoria universal igual a resistência. Cada habilidade informa valor, dado, gatilho e filtros. Por isso **Redução**, **Desviar Ataques**, **Esquiva Sobrenatural**, resistência elemental e imunidade precisam ser efeitos diferentes no contrato.

## Tipos, cores e nomes do Dice+

As cores abaixo são tokens de interface para fundo escuro. O fundo da etiqueta usa a mesma cor com 16% de opacidade; a borda usa 55%. O texto do valor usa a cor sólida.

| ID interno | Nome | Cor | Símbolo | Modelo Dice+ sugerido |
|---|---|---:|:---:|---|
| `acido` | Ácido | `#A3E635` | ◌ | `Acido` |
| `contundente` | Contundente | `#D6B98C` | ● | `Contundente` |
| `frio` | Frio | `#67E8F9` | ❄ | `Frio` |
| `fogo` | Fogo | `#FF6B3D` | ▲ | `Fogo` |
| `forca` | Força | `#D8B4FE` | ✦ | `Forca` |
| `raio` | Elétrico/Raio | `#FDE047` | ϟ | `Raio` |
| `necrotico` | Necrótico | `#8B5CF6` | ✢ | `Necrotico` |
| `perfurante` | Perfurante | `#94A3B8` | ◆ | `Perfurante` |
| `veneno` | Veneno | `#4ADE80` | ⬡ | `Veneno` |
| `psiquico` | Psíquico | `#F472B6` | ◈ | `Psiquico` |
| `radiante` | Radiante | `#FDE68A` | ☀ | `Radiante` |
| `cortante` | Cortante | `#FB7185` | ╱ | `Cortante` |
| `trovejante` | Trovejante | `#60A5FA` | ))) | `Trovejante` |

Ácido e veneno, radiante e raio, frio e trovejante possuem matizes próximos. Por isso cada etiqueta sempre mostrará também nome e símbolo.

## Tipo de dano não é origem do dano

Uma parcela possui exatamente um tipo oficial, mas pode possuir várias tags:

```json
{
  "id": "dano-espada-fogo",
  "formula": "1d8+3",
  "tipo": "cortante",
  "tags": ["ataque", "arma", "corpo_a_corpo", "lamina", "nao_magico"]
}
```

Exemplos de filtros:

- resistência a fogo: `tipos: ["fogo"]`;
- resistência a cortante: `tipos: ["cortante"]`;
- resistência a lâminas da campanha: `tagsAlguma: ["lamina"]`;
- redução contra armas não mágicas: `tagsTodas: ["arma", "nao_magico"]`;
- redução contra ataques físicos: tipos contundente, perfurante e cortante + tag `ataque`;
- resistência a dano de magia: `tagsTodas: ["magia"]`;
- resistência a tudo exceto psíquico: `todosTipos: true`, `tiposExcluidos: ["psiquico"]`.

Isso evita o erro de tratar “lâmina” como um décimo quarto tipo e permite que uma arma mágica continue causando dano cortante.

## Contratos de dados

### Pacote de dano

```json
{
  "id": "evento-123",
  "origemAtorId": "nikki",
  "habilidadeId": "espada-flamejante",
  "area": false,
  "rolagemCompartilhada": false,
  "alvos": ["soldado-1"],
  "parcelas": [
    {
      "id": "corte",
      "formula": "1d8+3",
      "tipo": "cortante",
      "tags": ["ataque", "arma", "lamina", "corpo_a_corpo", "magico"]
    },
    {
      "id": "chama",
      "formula": "1d4",
      "tipo": "fogo",
      "tags": ["ataque", "arma", "elemental", "magico"]
    }
  ]
}
```

`rolagemCompartilhada: true` indica efeitos como Bola de Fogo: os dados são rolados uma vez, mas cada alvo recebe sua própria salvaguarda e resolução defensiva.

### Efeito defensivo

```json
{
  "id": "resistencia-fogo-tiefling",
  "nome": "Resistência Infernal",
  "operacao": "resistencia",
  "filtro": {
    "tipos": ["fogo"],
    "tagsTodas": [],
    "tagsAlguma": [],
    "tagsExcluidas": []
  },
  "valor": null,
  "escopo": "parcela",
  "acumulo": "uma_vez",
  "chaveAcumulo": "resistencia:fogo",
  "origem": { "tipo": "raca", "id": "tiefling" },
  "visibilidade": "publica"
}
```

Operações necessárias:

| Operação | Função | Fase |
|---|---|---|
| `bonus` | soma dano | ajustes |
| `reducao_fixa` | subtrai valor, mínimo 0 | ajustes |
| `reducao_dado` | rola e subtrai, mínimo 0 | ajustes |
| `multiplicador` | metade, dobro ou outro fator específico | ajustes |
| `imunidade` | zera parcela correspondente | imunidade |
| `resistencia` | divide por 2, uma vez, arredonda para baixo | resistência |
| `vulnerabilidade` | multiplica por 2, uma vez | vulnerabilidade |
| `absorcao` | zera dano compatível e dispara cura/recurso declarado | imunidade/gatilho |
| `limiar` | zera a instância abaixo do limiar | depois da mitigação |
| `conversao` | troca o tipo antes de consultar defesas | antes dos ajustes |
| `redirecionamento` | troca o receptor de parte ou todo o dano | antes da aplicação |

`chaveAcumulo` evita duplicação. Resistências diferentes que atingem a mesma parcela ainda contam como uma só resistência. Reduções só deixam de acumular quando a própria regra ou a mesma chave determinar isso.

Reduções também declaram `escopo: "parcela" | "instancia"` e `aplicacoes: "uma" | "cada_parcela"`. Quando uma redução única atinge uma instância com vários tipos, a ficha da habilidade deve declarar a alocação. O padrão técnico será consumir primeiro a maior parcela compatível e desempatar pela ordem declarada, sempre registrando a escolha no relatório. Esse padrão é uma decisão determinística da extensão para um caso que a regra geral não detalha; uma habilidade pode substituí-lo.

## Resolvedor central

Uma única função pura fará o cálculo:

```text
resolverDano(pacote, alvo, contexto) -> RelatorioDano
```

Ela não altera a ficha. Depois da confirmação, outra função aplica o relatório exatamente uma vez:

```text
aplicarRelatorioDano(estado, relatorio) -> estado atualizado
```

### Ordem da resolução

1. normalizar tipos e migrar campos antigos;
2. construir parcelas e tags derivadas da arma, magia, item e habilidade;
3. rolar dados ofensivos — uma vez para áreas e uma vez por instância quando exigido;
4. resolver reações anteriores ao dano, como redução, resistência temporária ou metade de dano;
5. aplicar salvaguarda e demais ajustes/multiplicadores declarados;
6. aplicar bônus, penalidades e reduções fixas ou roladas;
7. aplicar imunidade por parcela;
8. aplicar no máximo uma resistência por parcela compatível, arredondando para baixo;
9. aplicar no máximo uma vulnerabilidade por parcela compatível;
10. aplicar limiar de dano quando o alvo possuir essa regra;
11. somar parcelas, com mínimo 0;
12. consumir PV temporários;
13. reduzir PV reais sem passar de 0;
14. registrar excesso, concentração, morte instantânea, falhas de morte e gatilhos de “sofrer dano”.

Salvaguarda que reduz dano é um ajuste anterior à resistência. Esquiva Sobrenatural também é um multiplicador de ajuste, não uma segunda resistência; portanto pode combinar com resistência.

Toda divisão arredonda para baixo, salvo quando a própria habilidade mandar arredondar de outra forma. Um efeito nunca produz dano negativo.

Para efeitos com vários tipos e uma salvaguarda compartilhada, o contrato aceitará `arredondamento: "por_parcela" | "pelo_total"`. O padrão será `por_parcela`, preservando o tipo de cada parcela; habilidades excepcionais poderão declarar outro comportamento sem criar código especial.

## Relatório e valor exato de PV

```json
{
  "alvoId": "soldado-1",
  "parcelas": [
    {
      "tipo": "cortante",
      "rolado": 9,
      "aposAjustes": 9,
      "resistencia": "Resistência a lâminas",
      "final": 4
    },
    {
      "tipo": "fogo",
      "rolado": 6,
      "aposAjustes": 6,
      "resistencia": "Resistência a fogo",
      "final": 3
    }
  ],
  "danoRecebido": 7,
  "absorvidoPorPvTemporario": 2,
  "pvAntes": 20,
  "pvDepois": 15,
  "pvPerdido": 5,
  "excesso": 0
}
```

Definições:

- **dano bruto**: soma rolada antes das defesas;
- **dano recebido**: valor após ajustes, imunidade, resistência e vulnerabilidade;
- **absorvido por PV temporário**: parte consumida pelo escudo temporário;
- **PV perdido**: `pvAntes - pvDepois`; este é o número principal exibido e é exatamente o que sai da barra;
- **excesso**: dano restante após chegar a 0 PV, necessário para morte instantânea;
- **dano evitado**: bruto menos recebido, apresentado por fonte defensiva.

Se um alvo com 3 PV recebe 10, o relatório preserva `danoRecebido: 10`, `pvPerdido: 3` e `excesso: 7`. Isso mantém a interface fiel sem quebrar regras que dependem do dano recebido.

## Interface da rolagem e do resultado

### Alvo direto

No ajuste de dano:

- parcelas ofensivas aparecem com cor, tipo, fórmula e origem;
- habilidades que adicionam dano continuam selecionáveis;
- abaixo surge **Defesas relevantes do alvo**;
- defesas automáticas ficam bloqueadas, pois não são modificadores manuais;
- reações disponíveis entram antes da aplicação final;
- somente defesas que realmente combinam com alguma parcela aparecem.

No resultado, cada parcela recebe uma faixa da cor correspondente:

```text
[CORTANTE] 9 → Resistência a lâminas → 4
[FOGO]     6 → Resistência a fogo → 3

Dano recebido: 7
PV temporários: −2
PV perdido: 5
```

### Vários alvos e rajadas

- Cada alvo recebe sua própria seção e seu próprio relatório.
- Repetir um alvo em Mísseis Mágicos preserva as instâncias, depois mostra subtotal do alvo.
- Uma defesa de um alvo nunca altera o dano de outro.
- O botão único de rolagem continua lançando todas as instâncias em paralelo.

### Área

- A janela de ajuste mostra apenas as parcelas da habilidade e não revela resistências, imunidades ou buffs dos alvos.
- O dano compartilhado é rolado uma vez.
- Cada alvo resolve sua salvaguarda e suas defesas individualmente.
- O resultado posterior pode mostrar o cálculo e o PV perdido de cada criatura; a informação fica oculta somente antes/durante a rolagem, como solicitado.

## Dice+: cor física dos dados

O Dice+ aceita selecionar um **modelo de dado pelo nome** usando chaves na notação:

```text
1d8{Cortante} # Cortante + 1d4{Fogo} # Fogo
```

Isso permite dados físicos coloridos se o usuário tiver modelos chamados `Cortante`, `Fogo` etc. na bolsa. Porém a API documentada não permite que a La Arte altere diretamente a cor de um dado nem crie esses modelos na bolsa do usuário. Se o modelo solicitado não existir, o Dice+ usa os dados ativos normais.

Arquitetura recomendada:

- `dicePlus.usarModelosPorTipo: false | true`;
- mapa configurável `tipo -> nome do modelo`;
- validar a notação normalmente;
- usar `groups[].diceModel` e `groups[].description` no retorno;
- nunca depender da cor física para calcular ou identificar a parcela;
- manter as cores garantidas na janela de resultado da La Arte.

Portanto, dados coloridos são possíveis como integração opcional, não como requisito de funcionamento.

## Migração

Campos atuais continuam aceitos:

```json
{
  "resistencias": ["fogo"],
  "imunidades": ["veneno"],
  "vulnerabilidades": ["radiante"]
}
```

Na importação eles viram efeitos defensivos normalizados. `automacao.elemento` vira uma parcela única. Habilidades novas usarão `parcelas`, permitindo dano misto. Os nomes antigos em português continuam válidos para não quebrar as sete fichas.

## Testes de aceitação

1. Os 13 tipos são aceitos e recebem cor, nome e símbolo.
2. 10 de fogo contra resistência a fogo causa 5.
3. Duas resistências aplicáveis continuam causando 5, nunca 2.
4. 28 de fogo, redução 5, resistência e vulnerabilidade resulta em 22.
5. Imunidade zera apenas parcelas compatíveis.
6. 9 cortante + 6 fogo é calculado por parcela e mantém duas cores.
7. Resistência a lâminas afeta a parcela marcada `lamina`, mas não o fogo adicional.
8. Redução contra armas não mágicas não afeta uma arma mágica do mesmo tipo.
9. Esquiva Sobrenatural e resistência podem reduzir em etapas distintas.
10. Salvaguarda pela metade acontece antes da resistência.
11. PV temporários são descontados depois das defesas.
12. O valor principal exibido como PV perdido é idêntico à alteração persistida.
13. Dano além de 0 PV preserva excesso para morte instantânea.
14. Rajadas repetidas mantêm instâncias e subtotal por alvo.
15. Áreas não revelam defesas no ajuste, mas calculam cada alvo corretamente.
16. Limiar de dano zera a instância abaixo do limite e aceita a instância inteira acima dele.
17. A ausência de modelos Dice+ personalizados não altera resultado nem bloqueia a rolagem.
18. Notação com modelos existentes preserva grupos e tipos no retorno do Dice+.

## Ordem de implementação

1. Criar catálogo dos 13 tipos, tokens de cor e normalização de aliases.
2. Criar `DamagePacket`, parcelas e efeitos defensivos sem alterar a HUD.
3. Implementar e testar `resolverDano` como função pura.
4. Implementar aplicação transacional e eliminar o cálculo antigo `ajustarDano`.
5. Migrar arrays antigos e `automacao.elemento`.
6. Integrar ataques diretos e o resultado colorido.
7. Integrar reduções, reações e multiplicadores.
8. Integrar rajadas e múltiplos alvos.
9. Integrar áreas com defesas ocultas no ajuste.
10. Adicionar preferência opcional de modelos Dice+.
11. Migrar as sete fichas, soldados, itens e buffs configurados.
12. Validar histórico, concentração, PV temporários, 0 PV e morte instantânea.

## Fontes de regra e integração

- D&D Beyond, SRD 5.2.1 / regras de dano e cura: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
- D&D Beyond, glossário 2024: https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary
- D&D Beyond, regras básicas 2014 / combate: https://www.dndbeyond.com/sources/dnd/basic-rules-2014/combat
- Dice+, documentação de notação e integração: https://extensions.owlbear.rodeo/dice-plus

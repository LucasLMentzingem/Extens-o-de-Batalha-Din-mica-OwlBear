# Mapeamento de regras até o nível 3

Este catálogo compara as opções oficiais disponíveis até o nível 3 com os módulos da extensão na versão 0.8.6. O objetivo é transformar a cobertura completa do nível 3 em uma meta verificável, antes de avançar para os níveis 5, 7 e 10.

Fontes primárias: [SRD 5.2.1](https://www.dndbeyond.com/srd), [Classes — Regras Básicas 2024](https://www.dndbeyond.com/sources/dnd/free-rules/character-classes) e [Origens — Regras Básicas 2024](https://www.dndbeyond.com/sources/dnd/free-rules/character-origins). Os nomes e dados de regras derivados do SRD são usados sob a licença Creative Commons indicada na própria publicação.

## Resultado da varredura

Foram classificados **320 itens**:

| Categoria | Quantidade |
|---|---:|
| Ações básicas | 16 |
| Habilidades de classe | 69 |
| Habilidades de subclasse SRD | 23 |
| Invocações | 14 |
| Maestrias de arma | 8 |
| Magias, de truques ao 2º círculo | 141 |
| Metamagias | 10 |
| Talentos | 8 |
| Traços de espécie | 31 |

| Estado | Quantidade | Significado |
|---|---:|---|
| `PORTAVEL` | 127 | Os módulos fundamentais existem; ainda pode faltar cadastrar e testar a definição. |
| `PARCIAL` | 92 | O fluxo principal funciona, mas alguma escolha, consequência ou regra secundária ainda é manual. |
| `ASSISTIDO` | 85 | A ficha pode apresentar e gastar a opção, mas o mestre resolve sua consequência. |
| `NOVO_MODULO` | 16 | Falta uma capacidade reutilizável essencial no motor. |

“Portável” não significa “já disponível em todas as fichas”. Uma opção só é considerada concluída na etapa quando tiver definição central, validação do esquema, testes de interação e, quando aplicável, interface utilizável.

## Cobertura por classe

Os números incluem as habilidades da classe e da subclasse presente no SRD até o nível 3. Magias ficam no catálogo próprio, pois são compartilhadas por várias classes.

| Classe | Total | Portável | Parcial | Assistido | Novo módulo |
|---|---:|---:|---:|---:|---:|
| Bárbaro | 8 | 2 | 6 | 0 | 0 |
| Bardo | 7 | 7 | 0 | 0 | 0 |
| Clérigo | 7 | 4 | 2 | 1 | 0 |
| Druida | 8 | 3 | 2 | 2 | 1 |
| Guerreiro | 8 | 4 | 3 | 1 | 0 |
| Monge | 8 | 7 | 1 | 0 | 0 |
| Paladino | 9 | 6 | 3 | 0 | 0 |
| Patrulheiro | 8 | 5 | 2 | 1 | 0 |
| Ladino | 9 | 3 | 3 | 3 | 0 |
| Feiticeiro | 7 | 5 | 2 | 0 | 0 |
| Bruxo | 6 | 5 | 1 | 0 | 0 |
| Mago | 7 | 3 | 1 | 3 | 0 |

## Cobertura por espécie

| Espécie | Total | Portável | Parcial | Assistido | Novo módulo |
|---|---:|---:|---:|---:|---:|
| Draconato | 4 | 3 | 0 | 1 | 0 |
| Anão | 4 | 3 | 0 | 1 | 0 |
| Elfo | 5 | 4 | 0 | 1 | 0 |
| Gnomo | 3 | 2 | 0 | 1 | 0 |
| Golias | 2 | 1 | 0 | 1 | 0 |
| Halfling | 4 | 2 | 0 | 2 | 0 |
| Humano | 3 | 3 | 0 | 0 | 0 |
| Orc | 3 | 3 | 0 | 0 | 0 |
| Tiefling | 3 | 2 | 0 | 1 | 0 |

A Forma Grande do Golias e o Voo Dracônico do Draconato começam no nível 5 e, portanto, não fazem parte desta etapa. Linhagens élficas e legados tieflings incluem apenas as concessões obtidas até o nível 3.

## Novos módulos necessários

As 16 entradas classificadas como `NOVO_MODULO` apontam para quatro famílias reutilizáveis:

- **Entidades vinculadas, familiares e servos:** Find Familiar, Find Steed, Unseen Servant e Wild Companion.
- **Zonas, emanações e objetos persistentes:** Alarm, Create or Destroy Water, Find Traps, Floating Disk, Moonbeam, Rope Trick, Spiritual Weapon e Web.
- **Transformação temporária de ficha:** Alter Self.
- **Ilusões e manifestações ambientais declarativas:** Druidcraft, Elementalism e Mirror Image.

Essas famílias devem ser implementadas como módulos genéricos. Evite escrever uma exceção exclusiva para uma única magia quando outras regras puderem reutilizar o mesmo fluxo.

## Módulos já reconhecidos

O motor atual já possui blocos reutilizáveis para ataque contra CA, dano tipado, crítico, salvaguarda por alvo, dano reduzido ou anulado, cura e PV temporários, buffs e condições, concentração, recursos e descansos, preparação de magias, reações, projéteis multialvo, teleporte, deslocamento forçado e áreas em círculo, quadrado, linha e cone. Todo alcance ofensivo é limitado pelo sistema a 18 metros e as distâncias são euclidianas contínuas.

## Arquivos e reprodução

- [Catálogo completo em JSON](catalogo-nivel-3.json)
- [Planilha em CSV](catalogo-nivel-3.csv)
- [Resumo para automação](resumo.json)
- Gerador: `node scripts/gerar-mapeamento-nivel-3.mjs`

O gerador lê o catálogo-base do projeto da campanha, corrige regras que começam depois do nível 3 e produz saídas determinísticas. Mudanças de classificação devem ser acompanhadas por testes que comprovem a nova portabilidade.

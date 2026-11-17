# Manual de criação de fichas JSON

Este guia orienta colaboradores e agentes a produzir fichas importáveis na Mesa de Combate La Arte. O formato recomendado é `versaoFormato: 2`. As sete fichas em `site/fichas/` são exemplos de personagens de nível 3.

## Arquivos de referência

| Arquivo | Uso |
| --- | --- |
| `site/fichas/ficha.schema.json` | Estrutura dos campos aceitos |
| `site/catalogos/habilidades.json` | IDs e definições compartilhadas de habilidades e passivas |
| `site/catalogos/itens.json` | IDs e definições compartilhadas de itens |
| `site/catalogos/icones-itens.json` e `docs/ARTE-ITENS.md` | Ícones reutilizáveis e composição visual dos itens |
| `site/engine.mjs` | Validação e execução das regras |
| `site/conteudo-configurado.json` | Relação exibida em Conteúdo configurado |
| `docs/mapeamento-nivel-3/` | Cobertura e módulos pendentes para o nível 3 |

Consulte o catálogo atual antes de escolher uma referência. Um ID parecido pode representar uma variante histórica com propriedades distintas.

## Exemplo importável

O exemplo abaixo cria um personagem simples com uma adaga equipada. O motor calcula o ataque da arma a partir dos atributos, proficiência e equipamento.

```json
{
  "versaoFormato": 2,
  "id": "aventureiro-exemplo",
  "nome": "Aventureiro Exemplo",
  "tipo": "pj",
  "edicao": "2024",
  "classes": [{"id": "guerreiro", "nivel": 3}],
  "especie": "Humano",
  "atributos": {"for": 16, "des": 14, "con": 14, "int": 10, "sab": 12, "car": 8},
  "proficiencia": 2,
  "pvMaximos": 28,
  "caBase": 12,
  "deslocamentosM": {"andar": 9},
  "salvaguardas": {"for": 5, "des": 2, "con": 4, "int": 0, "sab": 1, "car": -1},
  "pericias": {"Atletismo": 5, "Percepção": 3},
  "proficienciasEquipamento": {
    "armas": ["simples", "marciais"],
    "armaduras": ["leve", "media", "pesada", "escudo"],
    "maestrias": []
  },
  "recursos": [],
  "concessoes": [],
  "preparacao": {"vagas": 0, "preparadas": [], "semprePreparadas": []},
  "inventario": {
    "capacidadeCargaKg": 120,
    "itens": [{
      "id": "adaga-exemplo-1",
      "ref": "item.adaga",
      "quantidade": 1,
      "equipado": true,
      "equipadoSlot": "mao_forte"
    }]
  }
}
```

Este exemplo demonstra a importação. Complete as concessões da classe, espécie e talentos para representar uma build completa.

## Preenchimento e valores

- Atributos recebem o valor total, como DES 14. Salvaguardas e perícias recebem o bônus total já calculado.
- `tipo` aceita `pj` ou `npc`. Classes recebem nível de 1 a 10. O nível aceito pelo formato não garante automação completa de cada habilidade.
- Distâncias usam metros e valores reais. O teto sistêmico de alcance é 18 m. Áreas possuem suas próprias dimensões.
- `caBase` representa a defesa base. Equipamentos e buffs aplicam seus modificadores dinamicamente. Confira o resultado equipado para evitar contabilizar o escudo duas vezes.
- Pesos pertencem às definições dos itens em kg. Quantidade e equipamento pertencem à instância.
- PO têm peso zero por decisão da mesa. Essa regra também é aplicada às fichas antigas ao carregar.
- Cada item físico tem um ID próprio. Duas adagas equipadas precisam de duas instâncias, uma em cada mão. Armas de duas mãos ocupam ambas as mãos. Escudos usam `mao_fraca`.
- Slots disponíveis são `cabeca`, `capa`, `vestes`, `botas`, `mao_forte`, `mao_fraca`, `arma_distancia`, `colar`, `acessorio_1` e `acessorio_2`. Confira os nomes no schema e nos exemplos antes de criar um equipamento novo.

## Habilidades por referência

Inclua em `concessoes` um registro com ID local, referência existente e tipo.

```json
{
  "id": "armadura-arcana-aprendida",
  "ref": "habilidade.1-armadura-arcana-defesa-classe",
  "tipo": "habilidade"
}
```

Para passivas, use `tipo: "passiva"`. O catálogo define ação, bônus, reação, magia, truque, custo, alcance, automação e origem racial ou de classe. A ficha registra escolhas e exceções individuais em `ajustes`. Conteúdo próprio pode usar `definicaoLocal`, conforme o contrato de contribuições.

A identificação da origem usa `origemTipo` na definição. Use `raca` para as habilidades raciais, incluindo passivas. A HUD e o Livro de Habilidades usam essa classificação para os filtros.

Os arrays `preparadas` e `semprePreparadas` referenciam os IDs locais das habilidades resolvidas a partir das concessões. Copie o padrão de uma das sete fichas e confira a preparação após resolver o catálogo.

## Recursos e magia

```json
{
  "id": "espaco-1",
  "nome": "Espaços de 1º círculo",
  "maximo": 4,
  "saldoInicial": 4,
  "recuperacao": [{"evento": "descanso_longo", "modo": "completar"}]
}
```

Cada círculo disponível recebe um recurso independente, `espaco-1`, `espaco-2` e assim por diante. A HUD os ordena do maior para o menor. Truques usam círculo base zero e seu filtro aparece quando há truques disponíveis.

Skimi é bruxa de nível 3 e possui dois espaços de 2º círculo recuperados por descanso curto. As magias de 1º círculo dela usam esses espaços. A HUD mostra também um botão de 1º círculo para filtrar essas magias, com contador compartilhado e explicação no balão. Esse botão é derivado da lista de habilidades. O filtro de 2º inclui as magias de 1º elegíveis e deriva seu custo e escala.

Outros recursos usam IDs estáveis, máximo, saldo inicial e recuperação. Ação, ação bônus e reação são controladas pelo motor. Concessões de usos gratuitos podem apontar para um recurso próprio com `usoGratuito.recursoId`. O caso de Nikki e Passo Nebuloso está documentado no plano de fichas por referência.

## Conteúdo disponível

A revisão da 0.8.15 contém 250 definições de habilidades, 115 itens e duas lojas. Consulte Conteúdo configurado para os nomes e o mapeamento de nível 3 para distinguir as opções portáveis das que exigem módulos adicionais.

O sistema já comporta ataques derivados de armas equipadas, magias de ataque ou salvaguarda, seleção múltipla, projéteis, áreas e cones, cura, buffs, condições, concentração, reações, aprimoramentos após acerto, rerrolagens, inventário, lojas e trocas. A Gaveta de Composição atende casos configurados como Torrente e Ágil. O M04 está pausado após a primeira sequência de ataques e o seletor de círculo. Custos condicionais e sua generalização continuam pendentes.

Habilidades sem automação são assistidas pelo mestre. Texto descritivo não implementa um efeito. Confirme custos e recursos mesmo para habilidades assistidas.

## Validação e importação

Valide o JSON pelo motor a partir da raiz do repositório.

```js
import {readFile} from 'node:fs/promises';
import {validar} from './site/engine.mjs';
const ficha = validar(JSON.parse(await readFile('./minha-ficha.json', 'utf8')));
console.log(ficha.nome);
```

Ao alterar o catálogo, gere novamente o runtime e Conteúdo configurado com os scripts indicados em CONTRIBUTING.md. Execute a suíte de combate e o validador de versão antes de publicar.

Importe pelo Controle do Mestre, em Controle de fichas. Vincule a ficha ao token e ao jogador online. Confira armas equipadas, CA, recursos, preparação, ataques, descanso e uma habilidade representativa da build.

O estado da mesa guarda PV, saldos, equipamento, vínculos e efeitos. A ficha de criação guarda dados iniciais. Alterar o arquivo publicado não substitui automaticamente uma instância que já está carregada na sala.

## Organizar uma pasta como grupo

No Painel exclusivo do mestre, abra Controle de fichas e use **Importar pasta como grupo**. Selecione a pasta que contém as fichas. O nome da pasta será o nome exibido na lista recolhível.

Organize o grupo com um arquivo JSON de ficha por personagem ou modelo de NPC. Subpastas também são lidas. Por exemplo:

```text
Guarda da Cidade/
    comandante.json
    tropa/
        soldado.json
        arqueiro.json
    tokens/
        comandante.png
        soldado.png
```

Nesse exemplo, o grupo **Guarda da Cidade** terá três fichas. Imagens e arquivos de outras extensões são ignorados. Os tokens são colocados no mapa e vinculados pelo mestre após adicionar as fichas.

A pasta aceita de uma a cinquenta fichas nos formatos 1 ou 2. Todo arquivo `.json` encontrado precisa ser uma ficha válida. Guarde schemas, backups da mesa e arquivos de configuração em outra pasta. As referências de habilidades e itens devem existir no catálogo da extensão, ou a ficha deve fornecer as definições locais admitidas pelo formato.

A importação valida todas as fichas antes de salvar o grupo. Quando um JSON falha, o aviso informa seu caminho para correção. Corrija o arquivo e selecione a pasta novamente.

O grupo fica salvo junto ao estado da cena no navegador do mestre. Reabrir a extensão na mesma cena e navegador conserva os modelos. Guarde a pasta original para importar em outra cena ou computador.

Abra o grupo e use **Adicionar grupo inteiro** ou **Adicionar unidade**. Salvar a pasta disponibiliza os modelos na lista. Adicioná-los ao encontro cria cópias independentes, com PV e recursos iniciais, prontas para vincular a tokens e jogadores. É possível usar o grupo repetidamente e acrescentar fichas a uma mesa já preenchida. Em combate, as fichas adicionadas seguem o fluxo de reforços.

## Saque de inimigos

O motor disponibiliza a ação comum Saquear automaticamente, a partir de `habilidade.saquear` no catálogo. Ela usa uma ação em combate e seleciona um adversário a 0 PV a até 1,5 m. O saque oferece os itens reais do inventário do alvo, incluindo equipamentos. Preencha o inventário dos NPCs para definir o que os jogadores poderão obter.

O motor valida os IDs e quantidades enviados e transfere os itens entre as fichas, respeitando carga e mantendo as definições compartilhadas. Equipamentos transferidos chegam desequipados. PO seguem a regra de peso zero. Sessões de saque pertencem ao estado da mesa e são revalidadas ao confirmar.
# Duplicação de NPCs vinculados

Desde 0.8.22, duplicar no Owlbear um token CHARACTER vinculado a uma ficha `tipo: "npc"` cria um ator independente. A ficha de origem fornece equipamentos e escolhas; PV, recursos e efeitos começam em seus estados iniciais. Não é necessário criar um novo ID de definição da ficha: cada ator recebe seu próprio ID de instância. Jogadores não são clonados. Em combate, a nova instância aguarda inclusão manual na iniciativa. A extensão mantém nos metadados do token a referência de origem; não remova esse marcador ao duplicar.

## Bônus de equipamento em ataques desarmados

Use `modificadores.ataqueDesarmado` e `modificadores.danoDesarmado` para bônus desarmados permanentes enquanto o item estiver equipado. Para exigir ausência de armadura, use esses mesmos campos dentro de `modificadoresCondicionais.semArmadura`.

A condição permite vestes comuns e bloqueia armaduras leves, médias, pesadas e escudos. Armadura Arcana é um efeito mágico e permite o benefício. Os bônus são derivados das instâncias equipadas e das opções atuais da ficha. Não grave os valores já aumentados na definição da habilidade.

A Luva de Boxeador das Ruas +1 usa a referência `item.la-arte.luva-boxeador-das-ruas-mais-1`, custa 600 PO, pesa 0,25 kg e ocupa um slot de acessório, seguindo o padrão das luvas da mesa. Seus modificadores condicionais são `ataqueDesarmado: 1` e `danoDesarmado: 1`. O bônus fixo de dano permanece +1 no crítico.

As Luvas do Dragão Ascendente +2 usam `item.la-arte.luvas-dragao-ascendente-mais-2`. Concedem +1 ao ataque desarmado e +1 à CA sem armadura. O adicional de 1d4 de fogo por acerto segue no campo `danoExtraDesarmado`, com sua configuração própria.

## Itens de missão e saldos por instância

O catálogo inclui `item.adaga-do-ultimo-rito` e `item.colar-da-ultima-palavra`. O mestre pode concedê-los em **Adicionar item**. São recompensas de campanha disponíveis no catálogo central. As lojas mantêm sua seleção própria de estoque.

A Adaga do Último Rito custa 350 PO, pesa 0,5 kg e revende por 245 PO. Seus ataques e arremessos derivam do portador. Cada acerto soma uma parcela fixa de 1 de dano necrótico, separada do perfurante, inclusive no crítico. Essa parcela considera as defesas necróticas do alvo e aparece no resultado.

O Colar da Última Palavra custa 1.857,15 PO, pesa 0,1 kg e revende por 1.300 PO. Equipado no slot de colar, concede Falar com os Mortos com um uso recuperado ao amanhecer. A habilidade registra o uso e cobra uma Ação em combate e o recurso do item. A conversa é resolvida pelo mestre. O item concede a conjuração sem custo de espaço de magia.

O mestre usa **Registrar amanhecer** em Controle do mestre → Ferramentas da mesa, com confirmação. A operação recupera os itens com evento `amanhecer`, incluindo itens guardados e vendidos que estão na recompra. Descansos recuperam apenas os recursos associados a seus eventos.

Os ícones dos itens vêm do catálogo compartilhado. Não inclua arte duplicada em cada ficha; a composição visual usa um recorte transparente e molduras comuns ao catálogo. Veja `docs/ARTE-ITENS.md` para o contrato visual e como contribuir com novos ícones.

A instância de inventário pode persistir `saldosRecursos`, um objeto que relaciona o ID local do recurso concedido pelo item ao saldo atual. Esse estado acompanha venda, recompra, saque e transferência. A definição compartilhada do catálogo contém o máximo, o custo e a recuperação. O motor atualiza os saldos por instância e a compactação os preserva. Duplicar um NPC cria uma cópia independente com os usos iniciais dos equipamentos.

### Grupos no Controle do Mestre

As fichas importadas por pasta conservam o grupo na instância do encontro, inclusive ao copiar NPCs. Nas listas recolhíveis de combate e vínculos, personagens de jogador ficam em Aventureiros primeiro; NPCs ficam no grupo importado. O nome da pasta continua definindo o nome desse grupo. [Organização do painel](CONTROLE-MESTRE-PAGINAS.md).

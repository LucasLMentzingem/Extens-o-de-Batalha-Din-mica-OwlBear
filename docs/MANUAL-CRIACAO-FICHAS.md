# Manual de criação de fichas JSON

Este guia orienta colaboradores e agentes a produzir fichas importáveis na Mesa de Combate La Arte. O formato recomendado é `versaoFormato: 2`. As sete fichas em `site/fichas/` são exemplos de personagens de nível 3.

## Arquivos de referência

| Arquivo | Uso |
| --- | --- |
| `site/fichas/ficha.schema.json` | Estrutura dos campos aceitos |
| `site/catalogos/habilidades.json` | IDs e definições compartilhadas de habilidades e passivas |
| `site/catalogos/itens.json` | IDs e definições compartilhadas de itens |
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

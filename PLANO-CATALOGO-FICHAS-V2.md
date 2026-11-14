# Catálogo central e fichas por referência — plano do formato 2

Status: implementado inicialmente na versão 0.8.3. Este documento registra as decisões e o principal caso de referência da migração.

## Objetivo

As definições completas de habilidades e itens deverão pertencer ao catálogo do sistema. A ficha armazenará referências, escolhas, concessões, instâncias de itens e estado individual. O sistema resolverá essas referências ao carregar a ficha, permitindo corrigir uma definição uma única vez para todos os personagens que a utilizam.

## Caso de referência — concessão individual de Nikki Lauda

Durante uma aventura, **Nikki Lauda ganhou um uso gratuito de Passo Nebuloso por descanso longo**.

Esse benefício não deverá criar uma cópia modificada de Passo Nebuloso dentro da ficha. A magia continuará definida uma única vez no catálogo, por exemplo como `magia.passo-nebuloso`, enquanto a ficha de Nikki guardará uma concessão individual semelhante a:

```json
{
  "id": "passo-nebuloso-recompensa-aventura",
  "ref": "magia.passo-nebuloso",
  "tipo": "habilidade",
  "origem": {
    "tipo": "recompensa_aventura",
    "nome": "Recompensa de aventura"
  },
  "usoGratuito": {
    "recursoId": "passo-nebuloso-gratis",
    "quantidade": 1,
    "nome": "Uso gratuito de Passo Nebuloso"
  },
  "somenteUsoGratuito": true
}
```

### Comportamento esperado

- Passo Nebuloso aparece entre as habilidades disponíveis de Nikki mesmo que não esteja na lista normal de magias conhecidas ou preparadas.
- O uso concedido não gasta espaço de magia.
- Existe somente uma carga gratuita.
- A carga retorna após um descanso longo.
- A definição de alcance, ação bônus, alvo, efeitos e demais regras vem de `magia.passo-nebuloso` no catálogo central.
- Alterar a definição central da magia atualiza também esta concessão.
- `somenteUsoGratuito: true` significa que a recompensa, sozinha, não autoriza conjurar a magia com espaços. Se Nikki aprender ou preparar Passo Nebuloso por outra fonte, uma segunda concessão poderá habilitar também o custo normal sem duplicar a magia.
- A HUD deve priorizar o uso gratuito quando a habilidade for executada pelos filtros gerais e exibi-la também no filtro de usos gratuitos.

## Regra arquitetural derivada

Uma concessão responde **por que e em quais condições** um personagem possui um conteúdo. A definição central responde **o que esse conteúdo faz**. Um mesmo personagem poderá ter mais de uma concessão apontando para a mesma habilidade, e o resolvedor deverá combinar as permissões e fontes sem duplicar o botão na HUD.

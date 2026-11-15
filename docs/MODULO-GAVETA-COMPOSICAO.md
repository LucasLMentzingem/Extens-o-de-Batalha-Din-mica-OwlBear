# M04.1 — Gaveta de Composição

Submódulo reutilizável do **M04 — Compositor e modificador de ações**. Serve para habilidades cuja resolução possui uma ou mais instâncias e permite escolher, para cada uma, um modo e um alvo antes de confirmar a ação.

## Contrato no catálogo

```json
{
  "composicao": {
    "quantidadeMinima": 1,
    "quantidadeMaxima": 2,
    "modoPadrao": "ataque",
    "modos": [
      {
        "id": "ataque",
        "nome": "Ataque",
        "descricao": "Texto exibido no balão.",
        "tipo": "ataque",
        "limitePorUso": 2,
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "contundente",
          "alcanceM": 1.5
        }
      }
    ]
  }
}
```

- `quantidadeMinima` e `quantidadeMaxima`: quantas instâncias precisam ser escolhidas.
- `modoPadrao`: opção selecionada ao abrir a gaveta.
- `modos`: no planejamento, grade 2×7; durante ajuste, rolagem ou resultado, grade compacta 2×4. Acima do limite visível de cada estado, a gaveta ganha rolagem vertical.
- `limitePorUso`: limita quantas instâncias da mesma composição podem usar aquele modo.
- `umaVezPorTurno`: opcional; registra o uso no turno depois que o modo é executado.
- `automacao`: definição resolvida pelo motor. A versão atual aceita `ataque` e `cura`.

O comando enviado pelo HUD contém apenas escolhas mutáveis:

```json
{
  "composicao": [
    {"modoId": "ataque", "alvoId": "ator-2"},
    {"modoId": "cura", "alvoId": "ator-1"}
  ]
}
```

A definição permanece no catálogo. A ficha guarda somente a referência da habilidade, seguindo a arquitetura centralizada do projeto.

## Regras de execução

1. A gaveta aparece à esquerda da instância pública da habilidade.
2. O controlador escolhe um modo e então clica no alvo da instância.
3. Cada escolha mostra ordem, modo e alvo no cartão público.
4. O alcance é validado individualmente pelo modo selecionado.
5. Ataques abrem seus próprios ajustes de acerto e dano; curas abrem ajuste de cura.
6. O custo da habilidade é cobrado uma única vez, independentemente da quantidade de instâncias.
7. Uma composição inválida, incompleta ou acima do limite não altera recursos nem o estado da mesa.

## Estados visuais aprovados para o M04

- Antes da primeira rolagem, Gaveta e Instância podem crescer juntas para comportar até catorze opções em uma grade 2×7.
- Ao abrir ajuste, rolagem ou resultado, a Gaveta recolhe para 2×4, permanece visível e fica somente leitura.
- Custos deixam o texto do título e são exibidos como botões reduzidos dos recursos do rodapé, abaixo do título e novamente junto à confirmação.
- As duas barras de custos compartilham o mesmo cálculo e atualizam quando círculo, composição, recurso ou modificador mudar.

A arquitetura completa está em [M04 — Arquitetura do Compositor de Ações](ARQUITETURA-M04-COMPOSITOR-ACOES.md).

## Fichas configuradas

| Ficha | Habilidade | Composição |
|---|---|---|
| Loteria | Torrente de Golpes | Dois golpes; um pode ser substituído por Mão de Cura e um pode vir com Mão de Dolo preparada |
| Nikki Lauda | Explosão Elemental | Uma instância; escolha entre sete tipos de dano |
| Dragoberto | Golpe Certeiro | Uma instância; escolha arma e dano normal ou radiante |
| Dragoberto e Zurich | Ataques de arma com Destruidor de Hordas ativo | Etapa opcional após o ataque com a mesma arma |
| Nikki e conjuradores | Magias que ganham alvo por círculo | Metamagia Duplicada junto ao seletor de círculo |

Hannah Montana, Skimi e Zurich não possuem atualmente uma habilidade preparada que precise desse fluxo. As escolhas multi-alvo continuam no seletor de alvos. Manobras após acerto, Saraivada de Espinhos e efeitos semelhantes continuam no ajuste de dano, pois a decisão acontece somente depois de confirmar o acerto.

## Extensões futuras

- Adicionar modos `salva`, `efeito`, `teleporte` e `invocacao` quando o executor genérico desses tipos for extraído do fluxo principal.
- Permitir dependência entre instâncias, como “o segundo modo exige acerto do primeiro”.
- Permitir modos concedidos temporariamente por itens, buffs ou subclasses.
- Reutilizar a gaveta em ataques extras, metamágicas que alterem a ação atual e habilidades com substituição parcial.

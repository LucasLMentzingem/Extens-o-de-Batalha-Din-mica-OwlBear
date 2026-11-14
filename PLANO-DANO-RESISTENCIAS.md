# Plano — dano final, buffs e resistências

## Resultado esperado

O número exibido como dano aplicado deve ser o mesmo número retirado do alvo depois de salvaguarda, resistência, imunidade, vulnerabilidade, redução, absorção e demais efeitos. Se houver PV temporários, o resultado deve separar **dano final**, **PV temporários absorvidos** e **PV perdidos**.

Em ataques contra alvos diretos, a janela de ajuste de dano mostrará as defesas relevantes do alvo junto das habilidades que acrescentam dano. Em habilidades de área, essas informações não serão mostradas antes da rolagem, mas continuarão sendo computadas individualmente para cada criatura.

## Modelo de dados

Cada dano será uma lista de parcelas, em vez de um único total sem identidade:

```json
{
  "danos": [
    { "formula": "1d8+3", "tipo": "cortante", "tags": ["arma", "lamina", "nao_magico"] },
    { "formula": "1d4", "tipo": "fogo", "tags": ["elemental", "magico"] }
  ]
}
```

Tipos básicos: cortante, perfurante, contundente, fogo, frio, raio, ácido, veneno, psíquico, necrótico, radiante, trovejante e força. Tags descrevem a origem ou família — por exemplo `lamina`, `arma`, `magico`, `nao_magico`, `corpo_a_corpo` e `distancia`. Assim, resistência a fogo confere o tipo; resistência a lâminas confere a tag e afeta somente a parcela física correspondente.

As defesas usarão um contrato único, independentemente de virem da ficha, raça, classe, item ou buff:

```json
{
  "id": "resistencia-fogo",
  "nome": "Resistência a fogo",
  "efeito": "resistencia",
  "tipos": ["fogo"],
  "tags": [],
  "origem": "buff"
}
```

Efeitos previstos: `resistencia`, `imunidade`, `vulnerabilidade`, `reducao`, `absorcao` e `dado_defensivo`. Os arrays antigos `resistencias`, `imunidades` e `vulnerabilidades` continuarão aceitos e serão migrados para esse contrato.

## Resolução centralizada

Criar uma única função no motor, sem cálculo duplicado na interface:

```text
resolverDano(alvo, parcelas, contexto) → relatório
```

O relatório terá dano bruto por parcela, salvaguarda aplicada, defesas correspondentes, dados defensivos, dano final, absorção por PV temporários e perda real de PV. Esse mesmo relatório alimentará o histórico e a janela de resultado.

Ordem recomendada:

1. rolar cada parcela de dano e adicionais ofensivos;
2. aplicar sucesso em salvaguarda — metade ou anulação;
3. aplicar imunidade;
4. aplicar resistência e vulnerabilidade por parcela;
5. aplicar redução ou absorção fixa e dados defensivos;
6. consumir PV temporários;
7. retirar o restante dos PV.

Resistências iguais não se acumulam. Duas origens que concedem resistência a fogo continuam reduzindo pela metade uma única vez. Resistência e vulnerabilidade podem coexistir e são registradas separadamente no relatório.

## Interface de alvo direto

Na janela de ajuste de dano:

- habilidades que adicionam dano continuam aparecendo como hoje;
- abaixo delas, surge **Defesas do alvo**;
- cada defesa relevante aparece destacada e bloqueada: `Resistência a fogo · × 1/2`, `Resistência a lâminas · × 1/2`, `Imunidade a veneno · 0`;
- efeitos que exigem dado mostram uma fórmula bloqueada e são lançados na mesma confirmação do dano;
- reações continuam usando a fila de reações antes da aplicação final;
- o resultado mostra a conta por parcela e o dano realmente aplicado.

Exemplo:

```text
Cortante: 9 → resistência a lâminas → 4
Fogo: 6 → resistência a fogo → 3
Dano final: 7
PV temporários absorvidos: 2
PV perdidos: 5
```

## Vários alvos e áreas

Ataques e rajadas agrupam o relatório por alvo. Repetir o mesmo alvo conserva cada projétil como uma parcela separada, mas apresenta um subtotal daquela criatura.

Em áreas:

- a janela anterior à rolagem mostra apenas os dados da habilidade, sem revelar buffs ou resistências dos alvos;
- o dano compartilhado é rolado primeiro quando a habilidade exigir;
- cada salvaguarda é resolvida;
- o motor aplica silenciosamente as defesas de cada alvo;
- o resultado final pode listar por criatura: salvaguarda, dano após salvaguarda, ajustes aplicados e dano efetivo.

## Etapas de implementação

1. Criar parcelas de dano, taxonomia de tipos/tags e migração dos campos antigos.
2. Substituir `ajustarDano` por `resolverDano` e criar testes do relatório sem mudar a HUD.
3. Integrar ataques diretos e mostrar defesas relevantes no ajuste.
4. Integrar danos adicionais, dados defensivos e reações.
5. Integrar rajadas e múltiplos alvos com resultados agrupados.
6. Integrar áreas mantendo as defesas ocultas na janela de ajuste.
7. Migrar as sete fichas, soldados, itens de Victor e buffs já configurados.
8. Validar visualmente Dice+, histórico e perda exata de PV.

## Testes de aceitação

- 10 de fogo contra resistência a fogo aplica 5.
- Um golpe com cortante e fogo calcula cada parcela separadamente.
- Resistência a lâminas afeta a parcela da arma, mas não o fogo adicional.
- Imunidade zera somente os tipos correspondentes.
- Salvaguarda pela metade seguida de resistência aplica um quarto, com arredondamento por etapa.
- Duas resistências iguais não reduzem novamente.
- Rajada repetida no mesmo alvo mostra cada instância e um subtotal correto.
- Vários alvos mostram defesas e totais próprios.
- Área não revela defesas antes da rolagem, mas aplica o valor correto a cada alvo.
- PV temporários são descontados antes dos PV e aparecem separados no resultado.
- O total mostrado no resultado é idêntico à alteração persistida no estado.


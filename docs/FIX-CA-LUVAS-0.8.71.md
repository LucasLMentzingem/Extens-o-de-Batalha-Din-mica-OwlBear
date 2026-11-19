# CA dinâmica e slot de Luvas — 0.8.71 (#77)

Implementa o núcleo da [arquitetura de 18/11/2026](ARQUITETURA-INVENTARIO-LUVAS-E-CA-2026-11-18.md): P1 (resolvedor), P3 (conteúdo) e partes de P4, P5 e P6.

## O que mudou

- **`resolverCA(a)` no motor** devolve base, origem da base, bônus por grupo (atributos, escudos, itens, traços, efeitos, ajuste manual) e total. `caAtual(a)` passou a ser só uma fachada que devolve `resolverCA(a).total`.
- **A CA salva deixou de ser piso.** A base é a melhor fórmula válida entre:
  - armadura equipada;
  - "sem armadura" da ficha (`defesaCA.semArmadura`);
  - traços ativos com `formulaCA`;
  - efeitos com `formulaCA` ou `caMinima`.
- **Armadura corporal tem prioridade.** Com armadura leve, média ou pesada equipada, só as fórmulas de armadura entram. Sem ela, entram também as fórmulas de defesa sem armadura.
- **Defesa sem Armadura:** vale pelo traço ativo e não pelo nome da classe. Desativar o traço retira a fórmula. Armadura corporal ou escudo bloqueiam a fórmula, como já era a regra.
- **Armadura Arcana:** passou a ser a fórmula 13 + DES recalculada a cada consulta. O bônus fixo gravado pelos efeitos antigos é ignorado.
- **Proteção separada:** a armadura corporal e o escudo agora são verificados separadamente (`estadoProtecao`). A função antiga `usaArmadura` continua igual para as demais regras (luvas, movimento, magias).
- **Encantamentos +1/+2:** nas oito variantes de armadura e escudo da La Arte, o encantamento saiu da base e foi para `modificadores.ca`. O total de cada item não mudou. Escudo mágico sem proficiência não dá nenhum bônus, nem o do encantamento.
- **Slot `luvas`:** as luvas só podem ir para esse slot, e um acessório comum só pode ir para Acessório I ou II. Equipar um par novo guarda o anterior.
- **Ficha:** mostra a base calculada e os bônus, e só o ajuste manual é editável. Salvar não grava mais a CA calculada em `caBase`.

## Migração (automática e idempotente, no carregamento da ficha)

1. Cria `defesaCA` uma única vez, preservando a CA total que a ficha tinha:
   1. Primeiro tenta 10 + DES.
   2. Se for uma criatura sem armadura com CA própria fixa (por exemplo, o saco de pancadas com CA 1), usa esse valor fixo.
   3. Se ainda sobrar diferença, ela vira `ajusteManual` marcado como `ajusteLegado`, para o mestre revisar.
2. Luvas equipadas em acessórios passam para o slot Luvas. Se havia dois pares equipados, o primeiro fica e o outro volta ao inventário, com um aviso em `avisosMigracao`. Nada é vendido, apagado ou duplicado.
3. Todas as 18 fichas encontradas no repositório mantêm a mesma CA total depois da migração (conferido por script e por teste).

## Decisões tomadas (P0), para revisão

1. **Dragoberto (A15):** fica com CA 16 por um ajuste herdado de +3 sobre a base 13 do couro batido, marcado com asterisco na ficha. A regra pretendida continua em aberto. Enquanto o ajuste existir, ele também vale sem armadura.
2. **Dois pares de luvas legados:** o primeiro par fica equipado e o segundo volta ao inventário, com aviso.
3. **Proteção incompatível:** suspende a fórmula (Armadura Arcana, Defesa sem Armadura) enquanto a proteção estiver equipada. O efeito não é encerrado e o custo não é devolvido.
4. **CA legada e ajuste manual:** quando a CA antiga não fecha com a fórmula, a diferença vira ajuste visível na ficha.
5. **Migração com a mesa em uso:** roda no carregamento de cada ficha, sem exigir a mesa parada. É idempotente: se `defesaCA` já existe, nada é recalculado.

## Fora desta entrega

- Fórmulas de armadura natural e de traços raciais.
- Interface para escolher qual par de luvas fica equipado.
- Teste com duas sessões (mestre e jogador) numa sala real.
- Atualização dos pacotes ZIP históricos. Eles continuam sendo lidos e são migrados ao importar.

## Verificação

- Todos os arquivos `*.test.mjs` passam: 461 testes, sem falhas. Inclui `ca-luvas.test.mjs`, com 10 testes novos.
- `validar-versao` e `gerar-catalogo-runtime --check` passam.
- A ficha foi renderizada em Node: a linha de CA e os 11 slots aparecem.
- **Ainda não verificado:** nada disso foi testado numa sala real do Owlbear.

# Escudo Arcano contra Mísseis Mágicos — 0.8.74

## Problema
Pela regra, Escudo Arcano anula todos os dardos de Mísseis Mágicos que miram quem o conjurou, então esses dardos não precisam de rolagem. O motor já zerava o dano desses dardos, mas ainda rolava dados sem necessidade em dois casos:
- **Escudo já ativo:** quando o alvo já estava com o Escudo ativo desde antes, os dardos dele também eram rolados, e o resultado era descartado.
- **Escudo usado como reação:** cada dardo dos outros alvos era rolado em separado, sem identificar quem conjurou a magia.

## O que mudou
- Os dardos que miram uma criatura sob Escudo Arcano são anulados **sem rolar dado**. O histórico registra quantos foram: "Escudo Arcano anulou N dardos em X".
- Os dardos dos outros alvos são rolados **juntos, numa única rolagem**, por quem controla quem conjurou a magia.
- Se todos os dardos miram o alvo protegido, não há nenhuma rolagem de dano.

## Verificação
- Três testes novos em `reacoes-preventivas.test.mjs` cobrem estes casos: todos os dardos no alvo com escudo; dardos divididos entre dois alvos; escudo já ativo.
- Os 482 testes passam.
- Ainda não foi testado numa sala real.

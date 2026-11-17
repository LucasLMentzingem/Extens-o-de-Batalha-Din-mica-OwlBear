# Protótipo — sobreposição de ficha e aventura no cemitério

Integrado à publicação 0.8.53 em 17/11/2026.

## Sobreposição de reanimação

No Controle do mestre → Controle de fichas, o painel **Reanimar corpo** aparece quando há um corpo elegível e um conjurador com Animar Mortos. Escolha os dois e confirme que um minuto foi concluído e que os componentes estão disponíveis. O comando cobra um espaço de 3º círculo, exige distância euclidiana de até 3 m e é exclusivo do mestre. O motor também aceita círculos superiores pelo comando, sempre com um corpo por confirmação; o painel básico oferece o 3º. Tempo de conjuração, componentes, ordens e controle de 24 horas são assistidos, sem temporizador automático.

Um humanoide morto recebe a camada de Zumbi (15 PV, CA 8, Pancada +3, 1d8+1). Os dois goblins marcados da aventura recebem Zumbigoblin (15 PV, CA 8), preservando a origem Feérica como exceção autoral. O zumbi autoral nível 3 de 32 PV do cemitério continua sendo outro modelo.

O ator e token conservam seus IDs, posição e iniciativa. A ficha ativa passa a usar as estatísticas da camada; `sobreposicaoFicha` resguarda a ficha original, nome, PV/estado de morte, recursos e proprietário anteriores. O inventário é único e compartilhado, guardado na ficha ativa; a cópia original não armazena outra lista de loot. Ao remover a camada, a definição original recebe os pertences atuais. Itens previamente retirados não voltam. O botão **Remover sobreposição** restaura o estado morto original, sem ressuscitar a pessoa.

Os pertences ficam desequipados durante a camada: armadura, escudo e armas antigas não alteram a CA ou os ataques do morto-vivo. Morrer novamente mantém o mesmo inventário disponível para Saquear. O saque de uma pilha inteira conserva o ID da instância; retirar parte de uma pilha gera um novo ID para a parte transferida. Saldos de itens acompanham as instâncias.

Sem concessão automática de controle ao jogador: NPCs ficam sob controle do mestre. Efeitos e concentração do corpo anterior são encerrados, sessões de saque abertas são invalidadas e a camada não pode ser aplicada outra vez ao mesmo corpo enquanto estiver ativa. Em turnos, o reanimado aguarda sua próxima vez para receber economia de ações. Remover a camada não recupera efeitos já encerrados.

## Grupo e itens

`conteudo/aventura-no-cemiterio/` contém somente 11 JSONs de fichas formato 2. Importar essa pasta como grupo. Os mesmos arquivos estão na pasta da aventura, dentro de `Grupo-importavel/aventura no cemiterio`. O modelo adicional Zumbi reanimado apoia o protótipo. Não há itens finais nos inventários iniciais. Arquivos-base e tokens da aventura foram preservados; não foram gerados tokens novos.

Itens novos: `item.adaga-sagrada-purificada-mais-2`, `item.adaga-sagrada-profanada-mais-2`, `item.agua-benta-da-purificacao`, `item.corda-15-m`. As duas adagas concedem +1 ao ataque e 1d4 elemental separado (dobrado no crítico), sem bônus fixo ao dano perfurante e sem o +1 necrótico inicial. O +2 é apenas parte do nome. Preço de 1500 PO, raridade rara e revenda padrão de 1050 PO são propostas; peso de 0,5 kg preserva a arma. O colar permanece 1857,15 PO / revenda 1300 PO.

O mestre confirma o desfecho da adaga em Controle de fichas. A operação troca a definição conservando ID, posse e equipamento da instância. Purificação exige confirmação do altar original e consome uma dose de missão selecionada, inclusive de outro portador. Profanação exige confirmação narrativa das 100 mortes; o motor não detecta inocência ou elegibilidade. Os resultados são exclusivos.

## Automação e limites das fichas

- Irineu conserva atributos, perícias, habilidades e escolhas. A adaga agora usa a entrada central com arremesso. CA final equipada é 14 pelo couro 11+DES 3; a base técnica foi normalizada para 10. O campo antigo `caBase:13` não representava a defesa final com o couro. Sem talentos de origem adicionais.
- Drow é NPC autoral de INT, não Bruxo de Pacto: 38 PV, CA 12/15 com Armadura Arcana, ataque +7, CD 15, espaços 4/3/3. Conserva as dez magias originais. Raio de Gelo e Toque Arrepiante automatizam ataque/dano; redução de velocidade e bloqueio de cura são assistidos. Raio de Doença automatiza ataque/veneno; Armadura Arcana, Vitalidade Falsa e Passo Nebuloso usam automações existentes. Escudo Arcano, Raio do Enfraquecimento e Toque Vampírico são assistidos com seus custos; a repetição de Toque Vampírico sem novo espaço exige arbitragem do mestre.
- Padre: CA 18 sem escudo duplicado; cinco truques, nove preparadas e seis do domínio; Canalizar Divindade 2, recuperação de 1 no curto e total no longo. Curar Ferimentos/Palavra Curativa escalam, incluindo Discípulo uma vez. Bênção e Centelha de cura automatizadas. Preservar a Vida, Expulsar/Abrasar, curas coletivas e demais efeitos complexos assistidos. Revivificar consome espaço e exige que o mestre retire diamantes de 300 PO e confirme todos os requisitos; nenhum diamante ou uso gratuito é concedido. Sem autocura de nível 6.
- Goblins: CA 15 com escudo e 13 sem; é preciso guardar escudo/cimitarra para usar arco. Dano adicional por vantagem é oferecido após acerto e requer elegibilidade e tipo de dano conferidos pelo mestre. Alcances sujeitos ao teto da mesa de 18 m.
- Seu Furtado conserva PV 85, CA 13 e composição de duas Pancadas. Contém somente a adaga inicial e o colar. Fortitude e reação autoral assistidas. Zumbi do cemitério permanece com PV 32/CA 9.
- Mímico padrão 2024: ND 2, PV 58, CA 12. Ataques e parcela ácida separados automatizados; variante de mordida contra agarrado disponível. Aderência, formas, vínculo de agarrão, vantagem e condição Caído assistidos. Crocodilo comum: ND 1/2, PV 13/CA 12; mordida automatizada, agarrão/Contido e fôlego assistidos. O nível técnico 1 exigido pelo schema não é nível de PJ.

Fontes: [criaturas 2024](https://www.dndbeyond.com/sources/dnd/br-2024/creature-stat-blocks), [Clérigo/Domínio da Vida 2024](https://www.dndbeyond.com/sources/dnd/br-2024/character-classes) e bases da aventura. Este trabalho inclui material do SRD 5.2.1 da Wizards of the Coast LLC, disponível em https://www.dndbeyond.com/srd, sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode). Tradução, implementação e conteúdo autoral indicados acima.

## Verificação

Validação dos 11 JSONs com o motor real e referências centrais; suíte existente de 310 testes e 15 regressões específicas do protótipo (incluem humanoide/goblin, permissões, persistência JSON, remoção da camada, loot após segunda morte, custo de cura/Bênção, adaga e crítico/arremesso). Não houve importação em sala real. O grupo requer a extensão 0.8.53 ou posterior, com as entradas centrais desta entrega.

## Revisão mecânica de 17/11/2026

325 testes aprovados. Sete verificações adicionais cobrem recuperação dos NPCs, cura em turnos com custo e círculo exatos, troca/expiração de concentração, consumo das opções assistidas, Chama Sagrada (CD 15, sucesso/falha), Centelha sem Discípulo e estabilização sem ressurreição.

Corrigidos: padre e necromante habilitados explicitamente para descanso de NPC (`descansoNpc`); o comando de descanso recupera seus recursos e o painel os inclui. NPCs comuns continuam fora. Detectar Magia e Proteção contra o Bem e o Mal agora registram concentração e encerram a anterior. A marca `resolucaoAssistida` impede que a migração por nome transforme Acalmar Emoções em uma automação antiga de CD 13. Efeitos dessas magias continuam assistidos conforme descrito.

## Troca de token — 0.8.54

A reanimação usa `Tokens/Drow-e-goblins/Goblin-Zumbi.png` para o goblin marcado e `Tokens/Zumbis-do-cemiterio/Zumbi-Padrao-Nv3.png` para os outros humanoides. Foram portados os PNGs existentes, sem gerar ou alterar tokens. Os dois usam uma célula de 1,5 m. A ficha mecânica continua sendo a camada escolhida; o nome do arquivo de arte Nv3 não muda os PV da camada padrão.

A troca conserva a peça e vínculos. A imagem, DPI, offset e escala anteriores ficam no backup da camada e nos metadados do token; remover a camada restaura esses campos e preserva a posição atual. Segunda morte mantém a imagem de morto-vivo. Camadas salvas na 0.8.53 também recebem a arte ao sincronizar. Erros do SDK são repetidos sem reanimar novamente nem consumir outro espaço.

340 testes aprovados na 0.8.54, com SDK simulado e 154 execuções de ataque cruzadas entre os sete aventureiros e as 11 fichas novas. Validação em sala real permanece pendente.

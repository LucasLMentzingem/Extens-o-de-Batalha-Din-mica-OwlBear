# La Arte · Mesa de combate

## Jogar o encontro no navegador

Abra **Iniciar simulador.cmd** no Windows ou execute `node servir.mjs` nesta pasta com Node 22 ou superior. Acesse [o simulador local](http://127.0.0.1:4178/). O servidor atende somente neste computador. O ensaio usa dados locais e guarda o encontro no navegador.

1. Clique em **Carregar os 7 jogadores** para validar Dragoberto, Draven Thorne, Hannah Montana, Loteria, Nikki Lauda, Skimi e Zurich juntos. O ensaio **Carregar Nikki + 2 soldados** continua disponível para testes rápidos de combate.
2. Clique em **Iniciar combate**. O jogador recebe somente a iniciativa da ficha vinculada a ele. O mestre recebe jogadores e NPCs, marca qualquer conjunto de fichas e usa **Rolar selecionados**: a extensão prepara um d20 por personagem e envia todas as iniciativas juntas ao Dice+.
3. No turno de Nikki, selecione **Raio de Fogo**, escolha um soldado na lista ou no mapa e clique em **Executar**. Para testar uma área, selecione **Despedaçar** e marque o centro. O sistema gasta um espaço de 2º círculo, rola um único dano e uma salvaguarda por participante na área. A área pode atingir a própria Nikki.
4. No turno de um soldado, selecione **Lança** e Nikki. Se estiver fora do alcance, escolha **Marcar destino de movimento** no mapa tático e confirme o trajeto. O custo é a distância euclidiana em metros. Finalize o turno.
5. Para atuar por um PJ, o mestre seleciona sua ficha. A janela identifica em nome de quem a ação será feita. A confirmação vale apenas para aquele comando e o histórico registra a intervenção. O jogador continua vinculado.
6. Abra **Conteúdo configurado** para consultar classes, raças, ações comuns, itens e módulos já reconhecidos. As listas começam retraídas e mostram sua quantidade no cabeçalho.

Em preparação, **Importar ficha JSON** adiciona uma instância independente. Inclusive é possível importar o mesmo soldado várias vezes. Ao encerrar o combate os PV e recursos são preservados. O mestre pode ajustar saldos ou executar descansos. Para um ensaio novo, retire os participantes ou use outro perfil do navegador.

## Usar na sala do Owlbear

Hospede o conteúdo de `site` em HTTPS. Para GitHub Pages, coloque **o conteúdo desta pasta prototipo** na raiz de um repositório próprio, selecione GitHub Actions em Settings → Pages e envie para a branch `main`. O workflow executa os testes, configura o caminho do manifesto e publica somente `site`. A pasta publicada inclui a imagem do soldado e as duas fichas de exemplo. Revise esses arquivos antes de tornar o repositório público. A instalação usa o endereço publicado de `manifest.json`.

Instale e habilite a extensão e o Dice+ na sala, abra uma cena e entre como mestre. Carregue o encontro. No **Controle de fichas** do painel exclusivo do mestre, importe os JSONs, selecione um token de **Personagem** no mapa e associe a ficha e, quando for um PJ, o jogador conectado. A lista permite revisar ou trocar token e controlador de cada ficha. O botão **Configurar** do participante leva diretamente a esse vínculo. Uma mesma peça só pode pertencer a uma instância. Os jogadores abrem o painel da extensão no próprio navegador.

No menu de contexto de um token de Personagem, o segmento **La Arte · vincular ou abrir ficha** oferece as fichas ainda sem token quando a peça não possui vínculo. Depois de vinculada, permite retirar ou recolocar a ficha no combate, abrir diretamente sua ficha e editar os recursos. O painel mostra PV e todas as reservas declaradas no JSON, como mana, foco, Pontos de Feitiçaria, espaços de magia e usos especiais. Cada reserva possui uma barra entre zero e o máximo, além dos campos **Atual** e **Máximo**. Retirar do combate preserva ficha, vínculo, PV e recursos; durante um combate também libera o token, e recolocá-lo rola a iniciativa e volta a bloqueá-lo.

## Controle de fichas e do mestre

**Controle de fichas** mostra aos jogadores apenas fichas de jogadores; somente o dono pode alterar a sua. O mestre vê primeiro os jogadores e, ao final, uma seção recolhível de NPCs. A ficha possui três páginas: **Ficha de personagem**, **Inventário** e **Livro de Habilidades**. A primeira organiza identidade, classe e nível, atributos, PV, CA, deslocamento, salvaguardas, perícias, recursos, sentidos, idiomas e anotações no formato de uma ficha de D&D. **Salvar alterações** fica sempre no topo. ID, tipo, dono e token não podem ser trocados pelo editor.

O **Inventário** possui dez slots de equipamento, grade mínima 5×5 que cresce em novas linhas, pilhas, contador de PO e barra de carga. Passe o mouse para comparar um item com o equivalente equipado e use o botão direito para equipar, desequipar ou consumir. Em combate essas operações só podem ocorrer no turno do personagem e gastam uma ação. CA, PV máximo e deslocamento são recalculados; ataques de arma aparecem apenas enquanto o equipamento correspondente estiver ativo. Consumíveis também aparecem na aba **Itens** da HUD.

O **Livro de Habilidades** possui as páginas Classe, Comum e Reações. Ele separa ações de classe, truques, magias sempre preparadas, magias preparadas, círculos do maior para o menor, ações de arma, ações comuns e passivas. O botão direito prepara ou desprepara uma magia respeitando as vagas da ficha e ativa ou desativa passivas e reações. Essas configurações ficam travadas durante o combate; a HUD oferece somente habilidades atualmente preparadas, ativas e compatíveis com os equipamentos.

**Controle do mestre** é exclusivo do GM e separa duas áreas. **Controle do combate** mostra a lista inteira, tipo, iniciativa, PV e estado de cada participante, permite configurar seu vínculo, abrir a ficha, retirar ou recolocar um ator e iniciar ou parar o combate. **Controle de fichas** reúne importação JSON, token selecionado, vínculo entre fichas e tokens, vínculo dos PJs com jogadores online e a exclusão confirmada de uma ficha durante a preparação. Excluir retira a instância do encontro; não apaga o arquivo JSON original. Descansos e histórico permanecem junto ao controle do encontro.

### Valores-base, buffs e condições

CA, PV máximo e deslocamento conservam um valor-base editável. O campo curto imediatamente à direita mostra a soma dos bônus ativos; o cabeçalho mostra os totais usados pelo combate. Buffs e condições aparecem em uma seção própria da ficha e em ícones semitransparentes numa faixa invisível à esquerda da HUD. A faixa mantém uma grade de duas colunas por três linhas; do sétimo efeito em diante, use a roda do mouse para revelar os demais. Passe o mouse ou use foco de teclado para ler descrição, modificadores e duração.

O efeito estruturado aceita modificadores de `ca`, `pvMaximos` e `deslocamentoM`, requisitos como `semArmadura`, remoção em descanso e restrições de condições. Isso permite representar atordoado, congelado, envenenado e efeitos semelhantes sem reescrever os valores-base. Efeitos de PV podem aumentar também o PV atual quando `aumentaPVAtual` estiver habilitado.

Na ficha de exemplo, Nikki possui **CA 12 sem armadura** (10 + DES). **Armadura Arcana** pode ser usada dentro ou fora do combate, seleciona uma criatura sem armadura a até 1,5 m e concede o bônus necessário para chegar a `13 + DES`; em Nikki, isso aparece como `13 + 2 = CA 15`. O efeito termina no descanso longo.

O mestre consolida os comandos em segundo plano mesmo com seu painel fechado. Durante o combate as peças vinculadas são bloqueadas para arrasto normal. A movimentação passa pelo painel e o encerramento restaura os bloqueios anteriores. O tabuleiro no painel desenha células de um metro apenas como referência visual e acompanha as posições das peças quando o mestre processa um comando. O mestre que iniciou o encontro deve permanecer conectado, com o armazenamento do navegador disponível. O progresso fica no navegador desse mestre por sala e cena. Ao limpar os dados do navegador, perde-se o progresso. Consultas de NPC compartilhadas ocultam PV e CA. Atores ligados a peças invisíveis são omitidos da projeção do jogador.

### Decisão de arquitetura: distâncias contínuas

O sistema não usa as casas da grade para calcular alcance ou deslocamento. As posições são contínuas, medidas em metros com números de ponto flutuante, e a distância entre dois pontos é sempre euclidiana: `√(Δx² + Δy²)`.

Por isso, não existem passos diagonais, arredondamento por células nem uma regra especial para uma casa diagonal adjacente. Um ataque corpo a corpo alcança o alvo somente quando a distância real entre as peças é menor ou igual ao alcance declarado. Da mesma forma, um deslocamento consome o comprimento euclidiano real da trajetória. Esse comportamento é intencional e está registrado nas issues [#1](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/1) e [#2](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/2) como decisão do sistema, não como defeito da grade.

## Jogar com a ficha fechada

Ao iniciar a iniciativa, cada jogador vê somente a ficha vinculada a ele. O mestre vê todos os jogadores e NPCs pendentes, pode selecionar todos, limpar a seleção ou escolher um subconjunto. A confirmação conjunta mantém um ajuste independente por personagem, mas o botão **Rolar dados** envia todas as expressões ao Dice+ na mesma operação e mostra cada total em sua própria seção. Durante os turnos, o rodapé traz o retrato do token e PV à esquerda; os recursos ficam em botões quadrados acima da grade e podem filtrar diretamente as habilidades que os consomem. A grade central usa os filtros **Comum**, **nome da classe**, **Itens** e **Passivas**; **Personalizado** já aparece reservado, mas ainda está desativado. À direita ficam **Mover**, o saldo escrito e uma barra vertical de deslocamento. Escolha de uma a cinco linhas. A preferência fica salva no navegador. O mestre pode alternar entre participantes no carrossel. O jogador pode responder com uma reação assistida fora de seu turno.

Recursos gastos ficam esmaecidos e recursos com várias cargas mostram o saldo atual e máximo. Passe o mouse para ver nome, função e forma de recuperação; clique para exibir apenas as habilidades ligadas àquele recurso. **Perícias** e **Salva guarda** permanecem ao lado de **Linhas**. Buffs, condições e concentração flutuam numa grade transparente à esquerda do rodapé.

No filtro **Comum**, ataques das armas equipadas ocupam o início da grade. A ordem é mão forte, mão fraca e arma à distância. Quando uma arma pode ser arremessada, sua opção de arremesso aparece imediatamente depois do ataque normal da mesma arma.

O dano é resolvido por parcelas tipadas. O resultado distingue dano bruto, resistências/imunidades/vulnerabilidades, PV temporários e PV efetivamente perdidos; o valor principal é exatamente o removido da barra. Os 13 tipos oficiais possuem cores e símbolos próprios. Em efeitos de área, as defesas dos alvos permanecem ocultas durante o ajuste, mas são calculadas individualmente. Quando a bolsa do Dice+ possui modelos com os nomes dos tipos (`Fogo`, `Cortante`, `Frio` etc.), a extensão também solicita esses dados temáticos; a ausência deles não bloqueia a rolagem.

Clique numa habilidade e depois no alvo ou centro da área. O círculo dourado marca o alcance. A marca verde indica o alvo ou o raio de efeito. Confira o d20 e o ajuste na confirmação. Para mover, clique em **Mover**, marque o destino e confira a distância. Com a ferramenta da HUD ativa, também é possível arrastar o token do turno. **Cancelar** ou Esc descarta a prévia. O aviso de oportunidade considera o caminho, o lado dos participantes e o alcance informado na ficha (1,5 m por padrão). O mestre resolve a reação. Desengajar suprime o aviso. **Finalizar turno** fica à direita do rodapé. A HUD fecha ao encerrar o combate.

Enquanto o combate estiver parado, todas as ações e magias ficam liberadas. A extensão ignora ação, ação bônus e reação fora do combate, mas ainda desconta espaços de magia e outros recursos declarados. Se um token for movido pela ferramenta normal do Owlbear durante a escolha de uma habilidade, o centro do alcance acompanha a nova posição por evento da cena; não há varredura contínua do mapa.

### Deslocamento forçado

Agarrar, Derrubar e Empurrar são opções separadas. **Empurrar** seleciona uma criatura a até 1,5 m, usa a melhor salvaguarda dela entre FOR e DES contra CD 8 + FOR + proficiência de quem empurra (o Monge pode usar DES) e, em uma falha, move o alvo 1,5 m diretamente para longe do personagem. Antes da execução, uma seta branca nasce no alvo e termina exatamente no destino previsto. O movimento não consome o deslocamento do alvo.

O campo JSON `deslocamentoForcado` pode acompanhar ataques e salvaguardas. Em habilidades de alvo, o vetor parte do conjurador em direção ao alvo. Em habilidades de área, cada vetor parte do centro escolhido para a respectiva criatura. Depois de uma falha na salvaguarda ou de um ataque bem-sucedido, a posição da ficha e do token no Owlbear é atualizada automaticamente. Nesta versão o vetor é geométrico; colisões com paredes e bordas ainda ficam sob arbitragem do mestre.

Antes de um ataque, a confirmação permite escolher rolagem normal, vantagem ou desvantagem, acrescentar até quatro dados (`1d4 + 1d6`, por exemplo) e aplicar um modificador entre −20 e +20. O menu **Linhas** da barra aceita de uma a cinco linhas. Clique duas vezes no retrato para recolher a barra e deixar somente retrato e PV; repita para expandir. Clique duas vezes em qualquer participante do carrossel para centralizar e aproximar a câmera no token.

Ao lado de **Linhas**, as abas **Perícias** e **Salva guarda** abrem os testes rápidos no próprio rodapé. Perícias contém as 18 perícias; Salva guarda contém FOR, DES, CON, INT, SAB e CAR. Essas rolagens não consomem ação, ação bônus ou reação e ficam disponíveis na preparação, na iniciativa e durante qualquer turno, inclusive o turno de outro personagem.

## Reações e ataques de oportunidade

Ao marcar um deslocamento que saia do alcance corpo a corpo de um inimigo, a prévia desenha uma seta vermelha do inimigo até o ponto de saída. Depois da confirmação, o movimento fica pausado e o controlador desse inimigo recebe uma janela de 20 segundos. Ele pode não reagir ou escolher uma reação compatível com o gatilho, incluindo os mesmos ajustes de um ataque comum. O alvo da reação é sempre o personagem que iniciou o deslocamento.

O mesmo temporizador agora atende ao gatilho declarativo `sofrer_dano`. Depois que a fonte aplica o dano, a extensão oferece ao personagem atingido somente reações cujos custos estejam disponíveis. A reação pode fazer um ataque ou exigir uma salvaguarda da fonte; essa salvaguarda aparece para o controlador correto. Áreas que provocam várias reações criam uma fila, sem abrir janelas sobrepostas. Reações preventivas que precisam reduzir ou cancelar um dano antes de sua aplicação permanecem na próxima etapa do módulo.

Recusar ou errar permite que o deslocamento termine. Um acerto aplica o dano e interrompe o token no ponto exato em que deixou o alcance. A reação é gasta até o início do próximo turno do personagem; uma nova tentativa de movimento não provoca outra reação daquele mesmo inimigo. Se o tempo terminar, a extensão escolhe **Não fazer nada** e continua a ação. Desengajar impede a abertura desse gatilho.

Na ficha, as 18 perícias aparecem como botões com o bônus pronto. As salvaguardas ficam em uma seção separada. O botão direito sobre FOR, DES, CON, INT, SAB ou CAR abre diretamente a salvaguarda correspondente, com vantagem, desvantagem, dados extras e modificador disponíveis.

## Selecionar vários alvos

Mísseis Mágicos inicia uma seleção de três dardos. Cada clique acrescenta um dardo ao alvo e permite repetir a criatura. Use **Desfazer** para retirar a última escolha e **Executar seleção** para confirmar a distribuição. O círculo de 2º nível distribui quatro dardos e gasta o espaço correspondente. O ajuste reúne todos os dardos em uma janela, mas mantém fórmula, modo e alvo independentes para cada seta; **Rolar dados** envia a rajada inteira ao Dice+ de uma só vez. O resultado mostra a conta e o dano de cada seta separadamente. Rajadas com testes de ataque agrupam da mesma maneira os danos das setas que acertaram.

Bênção, quando presente na ficha, aceita de um a três alvos distintos no 1º círculo. Clique novamente numa criatura para desmarcá-la. A confirmação é liberada depois do primeiro alvo. O efeito soma 1d4 aos ataques e salvaguardas enquanto sua concentração estiver ativa. A duração termina no início do décimo turno seguinte do conjurador. Dano exige o teste de concentração. Os campos `selecao.min`, `selecao.max` e `selecao.repetirAlvo` configuram a seleção de outras magias e rajadas. Ataques múltiplos rolam por projétil, magias de salvaguarda rolam por alvo.

Ataques encadeados usam `requisitosUso` para exigir ataque ou acerto anterior, conferir tags do golpe, limitar um uso por turno e pedir um alvo diferente dentro de determinada distância. Uma ação que reúna dois ou mais golpes pode declarar `automacao.ataques`: cada perfil conserva bônus, dano, elemento, alcance e tags próprios, mas a economia de ação é cobrada somente uma vez. O motor registra cada tentativa e cada acerto para liberar a próxima habilidade no momento correto.

Magias de salvaguarda contra um alvo selecionam a criatura antes da execução e fazem o teste antes do dano. Cada jogador recebe na própria tela o ajuste da salvaguarda de seu personagem; testes de NPCs são apresentados em fila ao mestre. A janela mostra atributo, alvo e CD, e informa Sucesso ou Falha. Se um sucesso anular todo o dano, a rolagem de dano é omitida. Se reduzir, o dano é rolado e dividido conforme a ficha. Em magias de área, o centro define automaticamente todos os participantes atingidos: o dano é rolado primeiro e, em seguida, cada salvaguarda modifica a parcela aplicada ao respectivo alvo.

Encontros anteriores recebem a automação de Mísseis Mágicos e Bênção ao carregar as fichas reconhecidas pelo nome. A amostra da Nikki contém Mísseis Mágicos. Bênção foi testada em uma ficha temporária.

A aba **Controle de fichas** mostra o personagem selecionado no mapa ou uma ficha de jogador. **Controle do mestre** reúne a lista do combate, importação, vínculo, preparação e encerramento do encontro, descansos e ajustes. O botão Ficha da HUD abre o personagem exibido na barra. Os quadrados de habilidades exibem nomes e mostram descrição, custo, alcance, dano, teste e regras de seleção ao passar o mouse ou receber foco.

## Contrato de importação

[Esquema JSON versão 1](site/fichas/ficha.schema.json) · [Nikki Lauda](site/fichas/nikki.json) · [Soldado nível 3](site/fichas/soldado.json) · [Arquitetura](../Arquitetura.md)

O formato aceita classes e multiclasses cuja soma seja de 1 a 10. Recursos, espaços por círculo, preparação e progressão são declarados na própria ficha. O importador conserva campos adicionais de classe, equipamento ou campanha. O esquema descreve os grupos de variáveis; o importador também verifica limites de nível e saldo, IDs repetidos, custos e referências às magias preparadas. Os JSONs originais do Forge permanecem no acervo. As duas amostras desta versão já estão no formato próprio.

| Dados na ficha | Como funcionam nesta versão |
|---|---|
| Atributos, nível, CA, PV, deslocamento, resistências, imunidades, vulnerabilidades | Usados na resolução do turno, alcance e dano. CA é o valor de combate informado pela ficha. |
| Perícias e salvaguardas | Bônus explícitos e rolagens rápidas com vantagem, desvantagem e ajuste. |
| Recursos, custo, recuperação | Uma opção pode gastar simultaneamente ação ou bônus, reação e reservas. Recuperação integral por gatilho de descanso está automatizada. Recuperações seletivas e conversões usam o ajuste do mestre. |
| Ataques, dano, área, alcance, CD e elemento | `automacao` executa ataques contra CA, salvaguardas em alvo ou raio, dano, metade no sucesso, Disparada e Desengajar. O crítico acrescenta um dado de dano. O custo é confirmado quando a jogada inteira termina. |
| Escalonamento | O motor reconhece a sequência declarativa simples de ataque contra CA seguido de uma parcela de dano e a tabela `escalaPorNivelTotal`. Demais variantes podem ser descritas como opções separadas ou resolvidas pelo mestre. |
| Reações, preparação, concentração, duração, gatilhos, efeitos, equipamento e passivas | Preparação, ativação e equipamento filtram dinamicamente a HUD. Slots aplicam bônus e liberam ataques; troca e consumíveis gastam ação em combate. Reações automáticas e assistidas descontam seus custos fora do turno. |

O combate automático disponível para Nikki inclui adaga principal, lança, Raio de Fogo, Despedaçar, Mísseis Mágicos e Feitiçaria Inata. Os soldados têm lança e espada curta em corpo a corpo. A ficha mantém textos sobre arremesso, Feitiçaria Inata, metamagia, preparadas, equipamentos e demais habilidades. Inata usa a ação bônus, dura dez turnos e aumenta a CD de Despedaçar. Raio de Fogo é infernal nesta ficha e mantém seu bônus normal. Variações como espaço superior, concentração, oportunidade automática, terreno, linha de visão e gatilhos de equipamento ainda exigem arbitragem. O painel permite ajustes ao d20 e aos saldos. Para uma variação cujo custo ou efeito difira da opção automática, o mestre deve conferir o resultado e os saldos. O painel tático aceita destino e área por clique. Na sala do Owlbear, a HUD oferece seleção e confirmação diretamente no mapa.

## Verificação

Execute `node --test combate.test.mjs`. Os testes usam as fichas distribuídas. Cobrem vínculo, permissões, edição atômica da ficha, inventário, equipamento dinâmico, preparação de magias, ativação de passivas, intervenção do mestre, duas instâncias de soldado, transição de turno, ação, dano e crítico, área, metros, recurso de reação, descanso e importação até o nível 10. Um erro do Dice+ descarta a resolução pendente. Uma revisão antiga do turno é recusada.

No navegador foram exercitados um encontro local até a rodada 2, recarga do progresso e um mestre e um jogador com transporte e dados do Owlbear simulados. A validação final requer uma sala real com Dice+ habilitado para conferir hospedagem das peças, entrega dos resultados e visibilidade de rolagens. A extensão usa o SDK Owlbear 3.1.0 distribuído com sua licença em `site/vendor`.


# La Arte · Mesa de combate

## Jogar o encontro no navegador

Abra **Iniciar simulador.cmd** no Windows ou execute `node servir.mjs` nesta pasta com Node 22 ou superior. Acesse [o simulador local](http://127.0.0.1:4178/). O servidor atende somente neste computador. O ensaio usa dados locais e guarda o encontro no navegador.

1. Clique em **Carregar Nikki + 2 soldados**. As três peças são vinculadas automaticamente no ensaio. Nikki tem 20 PV e CA 15 conforme a ficha de origem. Cada soldado tem 24 PV e CA 16. A imagem dos soldados vem da pasta da guarda. Para Nikki, usamos a inicial no painel e um marcador genérico ao criar peça no Owlbear.
2. Clique em **Iniciar combate** e depois em **Testar como jogador**. Selecione Nikki e role sua iniciativa. Volte ao mestre e clique em **Rolar NPCs pendentes**. Também é possível rolar a iniciativa de Nikki como mestre mediante confirmação.
3. No turno de Nikki, selecione **Raio de Fogo**, escolha um soldado na lista ou no mapa e clique em **Executar**. Para testar uma área, selecione **Despedaçar** e marque o centro. O sistema gasta um espaço de 2º círculo, rola um único dano e uma salvaguarda por participante na área. A área pode atingir a própria Nikki.
4. No turno de um soldado, selecione **Lança** e Nikki. Se estiver fora do alcance, escolha **Marcar destino de movimento** no mapa tático e confirme o trajeto. O custo é a distância euclidiana em metros. Finalize o turno.
5. Para atuar por um PJ, o mestre seleciona sua ficha. A janela identifica em nome de quem a ação será feita. A confirmação vale apenas para aquele comando e o histórico registra a intervenção. O jogador continua vinculado.

Em preparação, **Importar ficha JSON** adiciona uma instância independente. Inclusive é possível importar o mesmo soldado várias vezes. Ao encerrar o combate os PV e recursos são preservados. O mestre pode ajustar saldos ou executar descansos. Para um ensaio novo, retire os participantes ou use outro perfil do navegador.

## Usar na sala do Owlbear

Hospede o conteúdo de `site` em HTTPS. Para GitHub Pages, coloque **o conteúdo desta pasta prototipo** na raiz de um repositório próprio, selecione GitHub Actions em Settings → Pages e envie para a branch `main`. O workflow executa os testes, configura o caminho do manifesto e publica somente `site`. A pasta publicada inclui a imagem do soldado e as duas fichas de exemplo. Revise esses arquivos antes de tornar o repositório público. A instalação usa o endereço publicado de `manifest.json`.

Instale e habilite a extensão e o Dice+ na sala, abra uma cena e entre como mestre. Carregue o encontro. Para cada participante, selecione um token de **Personagem** no mapa, use **Usar seleção do mapa** e **Salvar vínculo**. Também é possível escolher a peça pela lista ou usar **Criar token desta ficha**. Para Nikki, escolha o nome do jogador conectado em **Quem controla**. O menu de contexto da peça também abre o painel de vínculo. Uma mesma peça só pode pertencer a uma instância. Os jogadores abrem o painel da extensão no próprio navegador.

O mestre consolida os comandos em segundo plano mesmo com seu painel fechado. Durante o combate as peças vinculadas são bloqueadas para arrasto normal. A movimentação passa pelo painel e o encerramento restaura os bloqueios anteriores. O tabuleiro no painel usa células de um metro e acompanha as posições das peças quando o mestre processa um comando. O mestre que iniciou o encontro deve permanecer conectado, com o armazenamento do navegador disponível. O progresso fica no navegador desse mestre por sala e cena. Ao limpar os dados do navegador, perde-se o progresso. Consultas de NPC compartilhadas ocultam PV e CA. Atores ligados a peças invisíveis são omitidos da projeção do jogador.

## Jogar com a ficha fechada

Ao iniciar a iniciativa, a extensão mostra o botão de rolagem no centro e a ordem no topo. Durante os turnos, o rodapé traz o retrato do token, PV, movimento, recursos e as abas Ações, Bônus, Magias e Reações. Escolha de três a cinco linhas. A preferência fica salva no navegador. O mestre pode alternar entre participantes no carrossel. O jogador vê as fichas que controla e pode responder com uma reação assistida fora de seu turno.

Clique numa habilidade e depois no alvo ou centro da área. O círculo dourado marca o alcance. A marca verde indica o alvo ou o raio de efeito. Confira o d20 e o ajuste na confirmação. Para mover, clique em **Mover**, marque o destino e confira a distância. Com a ferramenta da HUD ativa, também é possível arrastar o token do turno. **Cancelar** ou Esc descarta a prévia. O aviso de oportunidade considera o caminho, o lado dos participantes e o alcance informado na ficha (1,5 m por padrão). O mestre resolve a reação. Desengajar suprime o aviso. **Finalizar turno** fica à direita do rodapé. A HUD fecha ao encerrar o combate.

Antes de um ataque, a confirmação permite escolher rolagem normal, vantagem ou desvantagem, acrescentar até quatro dados (`1d4 + 1d6`, por exemplo) e aplicar um modificador entre −20 e +20. O menu **Linhas** da barra aceita de uma a cinco linhas. Clique duas vezes no retrato para recolher a barra e deixar somente retrato e PV; repita para expandir. Clique duas vezes em qualquer participante do carrossel para centralizar e aproximar a câmera no token.

## Reações e ataques de oportunidade

Ao marcar um deslocamento que saia do alcance corpo a corpo de um inimigo, a prévia desenha uma seta vermelha do inimigo até o ponto de saída. Depois da confirmação, o movimento fica pausado e o controlador desse inimigo recebe uma janela de 20 segundos. Ele pode não reagir ou escolher uma reação compatível com o gatilho, incluindo os mesmos ajustes de um ataque comum. O alvo da reação é sempre o personagem que iniciou o deslocamento.

Recusar ou errar permite que o deslocamento termine. Um acerto aplica o dano e interrompe o token no ponto exato em que deixou o alcance. A reação é gasta até o início do próximo turno do personagem; uma nova tentativa de movimento não provoca outra reação daquele mesmo inimigo. Se o tempo terminar, a extensão escolhe **Não fazer nada** e continua a ação. Desengajar impede a abertura desse gatilho.

Na ficha, as 18 perícias aparecem como botões com o bônus pronto. As salvaguardas ficam em uma seção separada. O botão direito sobre FOR, DES, CON, INT, SAB ou CAR abre diretamente a salvaguarda correspondente, com vantagem, desvantagem, dados extras e modificador disponíveis.

## Selecionar vários alvos

Mísseis Mágicos inicia uma seleção de três dardos. Cada clique acrescenta um dardo ao alvo e permite repetir a criatura. Use **Desfazer** para retirar a última escolha, **Concluir seleção** para revisar a distribuição e **Executar** para gastar a ação e o espaço. O círculo de 2º nível distribui quatro dardos e gasta o espaço correspondente. Há uma rolagem de dano por dardo.

Bênção, quando presente na ficha, aceita de um a três alvos distintos no 1º círculo. Clique novamente numa criatura para desmarcá-la. A confirmação é liberada depois do primeiro alvo. O efeito soma 1d4 aos ataques e salvaguardas enquanto sua concentração estiver ativa. A duração termina no início do décimo turno seguinte do conjurador. Dano exige o teste de concentração. Os campos `selecao.min`, `selecao.max` e `selecao.repetirAlvo` configuram a seleção de outras magias e rajadas. Ataques múltiplos rolam por projétil, magias de salvaguarda rolam por alvo.

Encontros anteriores recebem a automação de Mísseis Mágicos e Bênção ao carregar as fichas reconhecidas pelo nome. A amostra da Nikki contém Mísseis Mágicos. Bênção foi testada em uma ficha temporária.

A aba **Ficha do personagem** mostra o personagem selecionado no mapa ou um personagem vinculado ao jogador. **Controle do mestre** reúne importação, vínculo, preparação e encerramento do encontro, descansos e ajustes. O botão Ficha da HUD abre o personagem exibido na barra. Os quadrados de habilidades exibem nomes e mostram descrição, custo, alcance, dano, teste e regras de seleção ao passar o mouse ou receber foco.

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
| Reações, preparação, concentração, duração, gatilhos, efeitos, equipamento e passivas | O formato guarda os dados e preserva descrições. Reações assistidas descontam seus custos fora do turno. O mestre verifica o gatilho, aplica consequências e ajusta PV ou recursos quando necessário. |

O combate automático disponível para Nikki inclui adaga principal, lança, Raio de Fogo, Despedaçar, Mísseis Mágicos e Feitiçaria Inata. Os soldados têm lança e espada curta em corpo a corpo. A ficha mantém textos sobre arremesso, Feitiçaria Inata, metamagia, preparadas, equipamentos e demais habilidades. Inata usa a ação bônus, dura dez turnos e aumenta a CD de Despedaçar. Raio de Fogo é infernal nesta ficha e mantém seu bônus normal. Variações como espaço superior, concentração, oportunidade automática, terreno, linha de visão e gatilhos de equipamento ainda exigem arbitragem. O painel permite ajustes ao d20 e aos saldos. Para uma variação cujo custo ou efeito difira da opção automática, o mestre deve conferir o resultado e os saldos. O painel tático aceita destino e área por clique. Na sala do Owlbear, a HUD oferece seleção e confirmação diretamente no mapa.

## Verificação

Execute `node --test combate.test.mjs`. Os testes usam as fichas distribuídas. Cobrem vínculo, permissões, intervenção do mestre, duas instâncias de soldado, transição de turno, ação, dano e crítico, área, metros, recurso de reação, descanso e importação até o nível 10. Um erro do Dice+ descarta a resolução pendente. Uma revisão antiga do turno é recusada.

No navegador foram exercitados um encontro local até a rodada 2, recarga do progresso e um mestre e um jogador com transporte e dados do Owlbear simulados. A validação final requer uma sala real com Dice+ habilitado para conferir hospedagem das peças, entrega dos resultados e visibilidade de rolagens. A extensão usa o SDK Owlbear 3.1.0 distribuído com sua licença em `site/vendor`.


# Versão 0.8.65 — perícias e coluna de rolagens

Perícias e salvaguardas exibem suas artes com opacidade integral e textos sem fundo. O modo de texto antes reduzia o recorte a 25% de opacidade, criando o véu visto no rodapé, balão e carta. A identificação desses testes no componente compartilhado corrige os três lugares sem mudar outras habilidades. Nomes, bônus, moldura e fallback sem imagem continuam disponíveis.

Rolagens ficam acima da instância de habilidade, com 10 px entre as caixas. Ambas têm margem de 75 px à direita. Em telas baixas, a altura é dividida entre os dois painéis, que conservam rolagem interna. A carta permanece visível durante ajuste, dados em trânsito e resultado; recursos continuam em custo/recursos atuais, conforme a 0.8.64.

O verificador de layout passa pela fila própria do layout, sem esperar a fila do comando que aguarda resposta humana. Assim, redimensionar a tela durante uma jogada pendente atualiza margens e alturas. Layouts continuam sendo serializados pelo controle existente e alterações geométricas ainda aguardam a liberação do ponteiro.

Sem novo pacote de imagens ou alteração mecânica. Fix de Sopro de Dragão e conteúdos anteriores preservados. Atividades continua acima do rodapé.

Validação com SDK/Dice+ simulados: seis contextos de arte (perícia/salvaguarda × barra/balão/carta), opacidade 1 e fundos transparentes; 12 layouts de 1920×1080 a 480×380, incluindo resize durante espera, margem 75 e rolagem acima da carta; execução completa de perícia e salvaguarda. Regressões de ataque/salvaguarda com GM, jogador e observador e custo/recursos atuais também conferidas. 426 testes de regras/protocolo/arte e validadores de versão/catálogo. Capturas revisadas e cliente Playwright da skill executado. Sem homologação autenticada em sala real.

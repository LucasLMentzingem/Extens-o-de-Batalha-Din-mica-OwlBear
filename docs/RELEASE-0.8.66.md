# Versão 0.8.66 — atalhos da ficha e buffs compactos

O cabeçalho do rodapé oferece Ficha, Inventário e Livro de habilidades. Todos usam o fluxo existente: compactam a HUD, selecionam o token e abrem o painel da extensão na aba do personagem atual. Ficha leva explicitamente a Ficha de personagem, mesmo depois de visitar outra aba. Destinos recebidos são limitados às três páginas conhecidas; chamadas antigas sem página abrem Personagem.

O símbolo D&D do cabeçalho da ficha foi substituído pela imagem do token vinculado, com inicial do nome quando não há token disponível. As URLs são lidas localmente pelo SDK, sem ampliar o estado/broadcast da mesa. Mudanças de imagem atualizam somente o retrato, conservando os campos em edição; movimentos sem mudança de URL não recriam a imagem. Falha na leitura inicial do token mantém o restante da ficha funcionando.

A área de efeitos tem espaço reservado para duas colunas e a barra vertical. No rodapé compacto, duas linhas de quatro efeitos cabem sem precisar rolar. Acima disso, só a lista de efeitos rola verticalmente; o documento do iframe e a grade não transbordam horizontalmente. A altura e a largura do popover foram ajustadas; efeitos completos continuam acessíveis na lista.

Validação em navegador com SDK simulado: mestre e jogador, dez aberturas de abas pelos novos botões, retorno explícito a Personagem, retrato carregado e mudança de imagem sem perder texto digitado. Vinte e quatro combinações de efeitos (1/3/4/5/8/12, expandido/compacto, GM/P1), sem overflow horizontal; quatro efeitos cabem no modo compacto e os seguintes permanecem alcançáveis com rolagem vertical. Capturas revisadas e cliente Playwright da skill executado. Suíte completa, catálogo e versão verificados antes da publicação. Sem homologação autenticada em sala real.

Perícias nítidas, rolagem acima da carta, margem direita de 75 px, custo/recursos atuais, permanência da instância, Sopro de Dragão e conteúdos anteriores preservados. Nenhuma nova arte gerada.

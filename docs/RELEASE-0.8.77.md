# Versão 0.8.77 — espaços livres na HUD e tema dos carrosséis

O fundo transparente do popover único continuava bloqueando as ferramentas do mapa: o iframe permanecia sobre toda a caixa do rodapé. CSS transparente não removia sua área de entrada.

Aplicado o plano B aprovado: identidade, nome, atalhos, recursos, ferramentas, grade, movimento, medidor, saldo, categorias e finalizar usam janelas ajustadas aos respectivos grupos. Os espaços grandes entre eles ficam sem iframe sobre o mapa. Não há janela por habilidade. A grade e cada grupo continuam capturando a entrada dentro de sua própria caixa, inclusive os pequenos intervalos entre seus botões.

A disposição virtual mantém o máximo de **1120 px** da 0.8.76; viewport e carta podem impor um limite menor. A largura considera a linha completa de recursos, a grade e os controles. Atividades da mesa continua acima do rodapé virtual, expandido ou recolhido. Compactar conserva somente o grupo de identidade. Nenhum ícone, ordem de habilidades ou regra de combate foi alterado.

Carrossel de turnos e ferramentas do mestre usam fundo externo transparente, botões escuros flutuantes, realce dourado do turno e do botão Iniciar combate. Tempos, turnos, descansos, recolhimento e confirmações conservam sua ordem e comportamento.

## Renderização e recuperação

Os dois renderizadores existentes medem o layout em uma faixa técnica invisível de 1 px na borda inferior, em vez de ocupar a área útil do rodapé. As janelas visíveis novas carregam apenas SDK, estilos, helper de grupos e helper de tooltip; não importam motor, catálogo, bridge ou fichas. Recebem HTML renderizado e metadados mínimos por canais locais isolados por sala, conexão e grupo. O HTML não é gravado nem transmitido aos outros jogadores.

Sessão/documento, revisão, ator, origem, dimensões e nomes conhecidos dos grupos são conferidos antes de aplicar a medição. Presença recupera janelas fechadas ou órfãs. Cliques e arrastes em andamento continuam adiando a troca da janela. Fontes e medidas sensíveis à viewport são preservadas para que cada janela pequena não aplique o layout de celular ao seu conteúdo.

Filtros, Aa e confirmações reutilizam os handlers originais. Dicas mantêm a arte e o texto em janela própria; o scroll de cada grade/lista é preservado nas atualizações de HTML. Nenhuma ficha precisa ser reimportada.

## Validação

- **494 testes automatizados aprovados**, incluindo limites de geometria, rejeição de grupos desconhecidos, isolamento de canais e mensagens inválidas/antigas.
- Versão/cache e catálogo runtime conferidos.
- **19 verificações de navegador**, com GM e jogador: clique, arraste e roda atingem o documento do mapa no intervalo livre; linhas 1/2/3/5; viewports 620/900/1440/2560 px; máximo de largura e limites da tela; Atividades acima dos grupos; filtros, Aa, Token, tooltip, instância, compactação e F5.
- Carrossel transparente; avanço de 10 minutos persistindo exatamente 600 segundos; confirmação/cancelamento de descanso; confirmação de início e checkbox PvP.
- Sem erros de execução no ensaio; janela leve sem módulos de ficha e sem reabrir durante ociosidade.

O ensaio usa SDK simulado e popovers como iframes reais no navegador. Demonstra a ausência do iframe sobre o intervalo e a entrega dos eventos ao documento abaixo. O comportamento das ferramentas nativas no Owlbear autenticado deve ser validado pelo usuário na mesa; não foi apresentado como teste de sala real.

# Retomada do trabalho — La Arte / Owlbear

Atualizado em 17/11/2026. Este documento transfere o contexto do chat longo para um novo chat.

## Continuação atual — 0.8.58

Por pedido explícito do usuário, Animar Mortos é imediato ao executar: ação em combate e espaço, sem espera nem concentração; preserva a ficha original, loot e troca do token. Não usar Avançar tempo para esta magia. Prece continua em dez minutos. 391 testes e ensaio de HUD com SDK simulado, com imagem atualizada. Consulte `docs/RELEASE-0.8.58.md`.

## Continuação anterior — 0.8.57

O mestre pode excluir fichas/modelos antigos e grupos importados pela mesma lista de Adicionar unidade, sem afetar unidades em cena ou JSONs. 390 testes aprovados; captura de teste local com SDK simulado registra a exclusão e o uso posterior de Animar Mortos, com troca do token e sobreposição preservando original/loot. Veja `docs/RELEASE-0.8.57.md`. Nenhuma sala real foi alterada neste ensaio.

## Continuação anterior — 0.8.56

Drow e Padre Quevedo receberam habilidades protótipo integradas ao motor e à HUD. Animar Mortos agora seleciona o corpo pela skill, exige um minuto e preserva a sobreposição/token/loot. Consulte `docs/RELEASE-0.8.56.md` e `docs/PROTOTIPOS-HABILIDADES-CEMITERIO.md`. Zumbis da aventura e reanimados: radiante ×2, necrótico ×¼. 384 testes e ensaio de HUD com SDK simulado. Fichas individuais e grupo ZIP atualizados. O fix de Sopro de Dragão e decisões das adagas continuam preservados.

## Publicação histórica da continuação — 0.8.53

As artes e o protótipo da aventura no cemitério foram integrados à versão 0.8.53. Consulte `docs/RELEASE-0.8.53.md` e `docs/PROTOTIPO-SOBREPOSICAO-CEMITERIO.md`. Os apontamentos abaixo são históricos.

## Atualização da continuação — 17/11/2026

Revisões visuais anotadas concluídas: sete associações recuperadas das fontes existentes; Religião e Saquear corretos; duas conversões de Fonte de Magia refeitas com homem tiferino. As 14 pendências de Skimi e as 11 de Zurich foram geradas, revisadas e integradas. Índice atual: **173 disponíveis / zero pendentes**; todas as sete fichas estão cobertas. Regra visual: uma figura humanoide por arte; cenas de dois personagens foram refeitas. Fontes e prompts: arquivos `docs/arte/LOTE-*.json`. 310 testes passaram na etapa anterior; esta etapa visual não rodou testes. Alterações apenas locais, ainda sem commit ou publicação; versão publicada permanece 0.8.52. Código e definições de Sopro de Dragão intactos. As contagens e a instrução de começar por Skimi abaixo são o registro histórico anterior.

## Pedido atual e próximo trabalho

O usuário pediu este arquivo para continuar em outro chat. O trabalho principal em andamento é **concluir as imagens individuais de habilidades das sete fichas, por personagem**, integrando cada imagem ao catálogo central. Começamos por Loteria (Monge), depois Draven, depois Nikki; esses três estão sem pendências no índice. **Continuar por Skimi**, depois Zurich, Dragoberto e Hannah, aproveitando artes compartilhadas sem gerar duplicatas.

O último pedido funcional foi implementar o fix de Sopro de Dragão e publicar todas as imagens já geradas. Isso foi concluído e publicado na **0.8.52**. Não há geração de imagens em execução conhecida nem mudança funcional local pendente. Não iniciar outro grande módulo por conta própria.

## Checkout e publicação

- Diretório de trabalho real: `D:\Documents\Codex\2026-11-09\os-ogros-de-dnd-s-o\work\publicacao-owlbear`.
- Diretório inicial da conversa: `D:\Documents\Codex\2026-11-09\os-ogros-de-dnd-s-o`. Não confundir com o checkout acima.
- Repositório: https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear
- Branch local utilizada: `feat/luva-boxeador`; apesar do nome antigo, contém o progresso atual.
- Último commit publicado: `762f12ca148889ee23d88ebe08ab0d4287d2cd9d` (`fix: escolher elemento do Sopro de Dragao e publicar artes na 0.8.52`). Está em `origin/main`.
- Workflow confirmado como sucesso: https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/actions/runs/44105348734
- Manifesto da versão, conferido via HTTP: https://lucaslmentzingem.github.io/Extens-o-de-Batalha-Din-mica-OwlBear/manifest-0.8.52.json
- Manifesto usual: https://lucaslmentzingem.github.io/Extens-o-de-Batalha-Din-mica-OwlBear/manifest.json
- Estado ao preparar este documento: somente `?? work/` no status; é uma pasta de ferramentas, capturas e rascunhos locais dentro do checkout. Não adicionar essa pasta inteira ao Git.
- O presente documento é novo e local; não houve nova publicação para entregá-lo.

Antes de mudar/publicar: conferir `git status`, buscar `origin`, verificar divergências e preservar contribuições de terceiros. O checkout foi reutilizado; não criar outro automaticamente. Os pushes anteriores foram feitos com `git push origin HEAD:main`, sempre após confirmar que `origin/main` era ancestral de HEAD. Não usar force push.

## Preferências e regras do usuário

- Português do Brasil. Preferência por executar e avançar com atualizações curtas.
- Evitar usar o computador/interface do usuário. O trabalho de código, geração e publicação foi feito por ferramentas e shell. Não abrir/operar as abas pessoais dele.
- Versionamento travado em **0.8.x até 0.8.99**; somente o último número avança, salvo pedido explícito. Próxima publicação normal: 0.8.53, após conferir o remoto. Ver `VERSIONING.md`.
- Para publicar, sincronizar todos os parâmetros `?v=` dos arquivos do site com a versão do manifesto, atualizar README e notas/estado do projeto. O workflow cria o manifesto específico automaticamente.
- Não gerar imagens com tema ou marca Owlbear. Não confundir o nome da plataforma com a criatura.
- **Nikki Lauda é homem; Skimi é homem; Hannah Montana é mulher.** Loteria é o monge; Draven é o guerreiro. Seguir classe/raça e visual das fichas ao representar os personagens.
- Distâncias do sistema são contínuas, euclidianas, com ponto flutuante. Grade apenas visual; conversão comum: uma célula = 1,5 m. Não introduzir regras de passos diagonais.

## Artes: padrão e integração

- Cada habilidade distinta deve ter uma arte própria. Mesma habilidade em várias fichas/círculos/bônus compartilha a mesma identidade visual.
- Somente **fundo + moldura** são compartilhados entre Comum, Raça e Classe.
- Recortes PNG **500×500, com transparência real**, sem texto, fundo, moldura ou interface dentro da ilustração. A interface combina arte, fundo e moldura em camadas.
- Ataques físicos usam a imagem do item com tema Comum; arremessos acrescentam símbolo separado. Não gerar arte independente de arma quando ela deve reutilizar o item.
- Habilidades de itens usam tema Comum e priorizam a imagem própria da habilidade, quando configurada; caso contrário usam a imagem do item.
- Perícias e salvaguardas têm texto claro renderizado pela interface. Salvaguardas mostram só o atributo no título curto.
- Balões e instâncias não sobrepõem nomes à imagem. Pós-acertos mostram o nome como elemento separado abaixo do ícone.
- Saquear: o usuário pediu uma **bolsa em evidência, com uma mão retirando algo dela**. A imagem nova está publicada em `site/assets/habilidades/habilidade-saquear.png`.
- Registro: `site/catalogos/artes-habilidades.mjs` (`artesHabilidades`). Arquivos: `site/assets/habilidades/`.
- Resolução visual compartilhada: `site/ability-art.mjs` / `site/ability-art.css`. Integração já existe no rodapé, livro, balões, instâncias e compositor; em geral basta registrar a imagem.
- Documentação: `docs/ARQUITETURA-ICONES-DE-HABILIDADES.md`.
- Índice regenerável e fonte da fila: `docs/arte/habilidades-sete-fichas.json` e `docs/arte/HABILIDADES-A-GERAR.md`.
- Comando: `node scripts/listar-artes-habilidades.mjs`.

### Estado da fila na 0.8.52

173 identidades mapeadas: **132 disponíveis, 41 pendentes**, mais 20 variantes baseadas em itens. Contagens por ficha se sobrepõem por habilidades compartilhadas:

| Ficha | Pendências |
| --- | ---: |
| Loteria | 0 |
| Draven Thorne | 0 |
| Nikki Lauda | 0 |
| Skimi | 14 |
| Zurich | 11 |
| Dragoberto | 9 |
| Hannah Montana | 13 |

Skimi: Encerrar Mente Desperta; Imobilizar Pessoa; Inspiração Heroica; Invisibilidade; Magias Psíquicas; Máscara de Muitas Faces; Mensagem; Mente Desperta; Pacto do Tomo; Ponto de Sorte; Rajada Agonizante; Rajada Mística; Riso Histérico de Tasha; Sugestão.

Zurich: Destruidor de Hordas; Elfo Silvestre; Emaranhar; Explorador Hábil; Falar com Animais; Iniciado em Magia (Druida); Maestria em Arma; Marca do Predador; Orientação; Palavra Curativa; Passos Largos.

Dragoberto: Cimitarra; Destruidor de Hordas; Escudo da Fé; Golpe Certeiro; Golpe Constritor; Herança Dracônica; Marca do Predador; Presa do Caçador; Proficiências e Explorador Hábil. **Cimitarra deve ser investigada como arte derivada do item antes de gerar uma imagem nova.**

Hannah: Elfo Silvestre; Especialista; Falar com Animais; Fogo das Fadas; Ilusão Menor; Inspiração de Bardo; Manto de Inspiração; Músico; Palavra Curativa; Passos Largos; Pau pra Toda Obra; Reflexos; Zombaria Perversa.

### Geração e arquivos de origem

Usamos a skill `imagegen` e a ferramenta de geração integrada, uma chamada por arte, em lotes. Ler a skill disponível na sessão antes de usar. Não usar API paga/CLI como fallback sem autorização.

Fontes geradas deste chat: `C:\Users\Lucas Mentzingem\.codex\generated_images\01a1c286-ff46-7b93-8048-8c66dd71c676\`. As fontes têm nomes `exec-UUID.png`. Preservar as fontes e copiar/redimensionar os resultados para o projeto.

Sharp está disponível em `C:/Users/Lucas Mentzingem/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp`. Foi usado `.resize(500,500,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(destino)`. Redimensionar não corrige um fundo opaco que a geração tenha desenhado; revisar a transparência visualmente.

Guardar o mapeamento ID da habilidade → arquivo retornado imediatamente em cada lote. Alguns lotes antigos perderam a associação explícita após saídas truncadas; não inferir a associação apenas pela ordem dos timestamps. Usar uma folha de contato para conferir antes de registrar.

### Conferências visuais que merecem atenção

O índice sem pendências indica arquivo registrado, não aprovação visual de cada imagem. A geração inicial de Nikki usou prompts neutros e produziu feiticeiras; seis imagens foram refeitas com homens. **Revisar especialmente as duas artes Fonte de Magia que convertem espaço em pontos**, pois os primeiros recortes mostravam figura feminina e não foram refeitos naquela correção.

Também revisar a correspondência semântica de alguns arquivos compartilhados integrados em lotes anteriores. Há indícios no histórico das saídas de que **Natureza/Percepção** e algumas artes do conjunto **Preparar, Prestidigitação, Religião, Saquear, Sobrevivência, Usar Magia, Usar Objeto** podem ter sido associadas por ordem incorreta ao salvar. Saquear já recebeu uma substituição explícita correta. Conferir as imagens antes de afirmar cobertura visual completa. Não gerar outra arte se bastar corrigir a associação entre arquivos existentes.

## Fix Sopro de Dragão publicado na 0.8.52

Decisão aprovada pelo usuário, baseada em D&D 2024:

1. Conjuração por Ação Bônus + espaço de 2º círculo ou superior; toque em criatura voluntária, inclusive em si.
2. No compositor, selecionar **um elemento** (ácido, frio, fogo, elétrico ou veneno) e **um beneficiário**. Elemento permanece fixo até o efeito terminar.
3. Beneficiário recebe uma única habilidade de sopro: 1 Ação, cone ancorado de 4,5 m, salvaguarda de DES, 3d6 do elemento e metade no sucesso. CD vem da origem, incluindo Feitiçaria Inata. Cada círculo acima do segundo acrescenta 1d6.
4. Em si: habilidade concedida em Classe imediatamente após a magia original. Em outro: habilidade em Comum. Em ambos também em Usos gratuitos; sem novo espaço, mas ainda cobra 1 Ação.
5. Concentração pertence ao conjurador. Acabar/perder a concentração ou duração remove a concessão. Até 1 minuto = dez rodadas; fora de combate o mestre avança o tempo/turnos.
6. Efeito legado sem elemento salvo tinha cinco opções; agora só expõe a primeira variante existente (ácido na definição antiga). Conjurar novamente permite escolher outro elemento.

Regra oficial: https://www.dndbeyond.com/spells/2619150-dragons-breath

Implementação principal em `site/engine.mjs`:

- `configurarSoproDragao`: normaliza definições centrais e legadas e cria composição de tipo `efeito`, uma única instância, cinco modos.
- Validação passou a aceitar modo `efeito` apenas na composição de efeito com uma instância.
- Execução resolve o modo antes de cobrar custo/concentrar e usa o fluxo existente de aplicar efeito ao alvo.
- `opcoesConcedidasPorEfeitos`: define Classe/Comum segundo origem e beneficiário e usa `usoGratuito:{enquantoEfeito:true}` para a concessão temporária.
- `custosGratuitos` / `usoGratuitoDisponivel`: suportam concessão enquanto o efeito estiver ativo, sem inventar um recurso numérico; custo de Ação mantido.
- `ordenarOpcoesRodape`: usa `aposOpcaoId` para colocar o sopro em si logo após sua origem.
- `site/hud-ui.mjs`: balão informa disponibilidade durante o efeito e custo de Ação.
- Definição central incrementada em `site/catalogos/habilidades.json`; runtime regenerado em `site/catalogos/catalogo-gerado.mjs`.
- Não foi necessário apagar/reimportar as fichas para normalizar a magia.

O compositor já tinha seleção por modo/alvo na HUD, então o fix reutiliza esse fluxo. A interface em sala real ainda não foi validada nesta entrega; os testes automatizados passaram.

## Verificação e publicação

Última execução completa: **310 testes passaram**, incluindo fix de Sopro, regressões de fichas, inventário/saque/trocas, conexão, histórico e HUD. O workflow repetiu os checks e publicou com sucesso.

Comandos no checkout:

```powershell
node scripts/listar-artes-habilidades.mjs
node validar-versao.mjs
node gerar-catalogo-runtime.mjs --check
node --test combate.test.mjs ability-art.test.mjs recipientes.test.mjs loot-sync.test.mjs activity-feed.test.mjs monk-composition.test.mjs initiative-choices.test.mjs master-groups.test.mjs damage-visibility.test.mjs room-sync.test.mjs state-recovery.test.mjs
git diff --check
```

Ao alterar `habilidades.json` ou itens do catálogo, rodar `node gerar-catalogo-runtime.mjs` sem `--check` para regenerar; alterações mecânicas exigem aumentar a revisão da entrada. As imagens não precisam ser copiadas para fichas JSON.

O executável `gh` não estava no PATH. Git push funciona com as credenciais já instaladas. Para consultar o deploy público, usar PowerShell `Invoke-RestMethod` na API GitHub, sem imprimir credenciais: endpoint `/repos/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/actions/runs`. Consultar `head_sha`, `status` e `conclusion` e depois fazer GET no manifesto específico. Downloads de logs via API anônima retornaram 403; falhas de teste foram reproduzidas localmente.

## Documentos de contexto adicional

- `docs/ESTADO-DO-PROJETO.md` — progresso geral e notas de entregas antigas.
- `docs/RELEASE-0.8.52.md` — última publicação.
- `docs/MODULOS-PENDENTES.md` e `docs/mapeamento-nivel-3/` — roadmap mecânico (não confundir com fila de imagens).
- `docs/MANUAL-CRIACAO-FICHAS.md` — fichas e catálogo central.
- `docs/ARQUITETURA-M04-COMPOSITOR-ACOES.md` e `docs/MODULO-GAVETA-COMPOSICAO.md` — compositor.
- `docs/arte/HABILIDADES-A-GERAR.md` e JSON adjacente — usar como fonte atual das artes pendentes.

Não marcar issues mecânicas como concluídas só porque suas imagens foram geradas. Não prometer que todos os cenários estão validados em sala real com base somente na suíte automatizada.

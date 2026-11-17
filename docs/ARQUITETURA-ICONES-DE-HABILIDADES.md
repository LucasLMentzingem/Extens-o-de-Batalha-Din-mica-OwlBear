# Ícones de habilidades — arquitetura e artes

Estado: conjunto base de artes integrado à entrega 0.8.43. Consulte [Revisão 0.8.43](REVISAO-0.8.43.md) para os testes e os limites de cobertura. A biblioteca usa emblemas de origem nas habilidades sem arte exclusiva.

## Estrutura entregue

- `site/ability-art.mjs`: resolução de origem, arma equipada, variantes, testes e composição HTML compartilhada, com fallback e tratamento de falha de imagem.
- `site/ability-art.css`: camadas de fundo/arte/moldura, nomes, bônus, miniaturas, dimensões e estados.
- `site/catalogos/artes-habilidades.mjs`: registro central dos arquivos de arte e dos fundos/molduras das três famílias.
- Integração no rodapé, Livro, balões de consulta, instância, modos de composição, reações, adicionais e rerrolagens. Ataques de arma e consumíveis reutilizam recortes de itens existentes.
- Prévia compartilhada inclui os metadados visuais resolvidos, preservando a imagem da arma para espectadores sem enviar o inventário inteiro.
- `ability-art.test.mjs`: cobertura de origem, arma, observador, soco, testes, metadados, escape e renderização sem mutar as sete fichas.
- `site/assets/habilidades/`: 16 fontes transparentes de 500 × 500. Inclui três emblemas de origem, soco, perícias, seis salvaguardas, símbolo de arremesso e artes próprias para Saraivada de Espinhos, Mísseis Mágicos, Raio de Fogo e Torrente de Golpes; seis fundos/molduras SVG formam as famílias Comum, Raça e Classe.
- Habilidades sem ilustração exclusiva usam o emblema da família. Ataques arremessáveis conservam a arte da arma e exibem o símbolo de voo sobreposto.

## Como ampliar a coleção de artes

1. Salvar cada recorte aprovado em `site/assets/habilidades/`, com fonte 500 × 500 transparente e derivado de exibição quando adequado.
2. Em `artesHabilidades`, registrar o ID estável com `{arquivo, autoria, alt}`. Pode usar diretamente o `catalogoRef` da habilidade como ID; não é necessário editar fichas.
3. Para compartilhar um recorte entre várias definições, colocar `visual.arteId` no catálogo central. `visual.familia` só precisa existir para exceção; a origem é resolvida automaticamente.
4. Em `temasHabilidades`, ficam os fundos e molduras das três famílias; novas versões aprovadas podem substituir os SVGs mantendo os mesmos caminhos.
5. Reservado `comum.soco` para golpes desarmados. Perícias usam `pericia.<nome-sem-acentos-em-slug>`; salvaguardas usam `salvaguarda.for`, `.des`, `.con`, `.int`, `.sab`, `.car`.
6. Ampliar a biblioteca com artes individuais para habilidades que precisem de identidade própria, sem gerar cópias para variações de bônus, círculo ou arma.
7. Não guardar arte/base64 nas fichas. O catálogo mantém a definição e a concessão mantém a referência e ajustes opcionais.

A resolução da arte é somente visual: não altera classificação mecânica, preparo, custos, acerto, dano ou permissões. O exame ampliado de habilidades continua fora do escopo aprovado.

## Objetivo

Usar a mesma arte em rodapé, Livro de Habilidades, balões e instância de ação. O catálogo central é a fonte da arte; fichas continuam referenciando habilidades e itens sem copiar arquivos ou definições.

## Composição visual

- Canvas mestre de 500 × 500 px para cada arte e composição, preservando proporção.
- Camadas separadas: fundo, arte transparente e moldura. Fundos e molduras têm três famílias: Comum, Raça e Classe.
- Não aplicar raridade de item à moldura de uma habilidade. Ataques de arma usam o recorte do item equipado com fundo/moldura Comum.
- Uma mesma magia pode compartilhar recorte entre personagens, com moldura determinada pela origem da concessão.
- Autorais, exceções e origem não identificada usam Comum, com possibilidade de metadado explícito no catálogo.
- Ataques desarmados usam arte própria de um soco. Variantes podem reutilizar a arte e ter marcações de cura/elemento separadas; ataques arremessáveis reutilizam a arma e recebem símbolo sobreposto.
- Texto, contadores e estados são elementos da interface, nunca gravados no recorte. Isso mantém legibilidade, atualização dinâmica e reutilização futura.

## Origem visual

1. Ataque físico gerado por arma: imagem da instância equipada e família Comum.
2. Habilidade autoral ou exceção visual explicitamente configurada: Comum.
3. Concessão racial: Raça.
4. Concessão de classe/subclasse: Classe.
5. Ação comum, talento sem origem de classe/raça, perícia, salvaguarda ou origem ausente: Comum.

Família visual não modifica filtros, custos ou regras. Uma habilidade dada por equipamento pode continuar em Itens e usar arte Comum. Metadados de origem prevalecem sobre inferências pelo nome.

## Metadados propostos

Definição central de habilidade:

```json
{
  "visual": {
    "arteId": "magia.bencao",
    "familia": "origem",
    "layout": "ilustracao",
    "textoCurto": "Bênção"
  }
}
```

Registro de arte resolve `arteId` para arquivo, autoria e texto alternativo. `familia` aceita `origem`, `comum`, `raca`, `classe`; `layout` aceita `ilustracao` ou `texto`. Referência `origemItem` existente resolve a arte do ataque sem duplicá-la na definição da habilidade. Overrides individuais devem continuar opcionais e explícitos.

## Aplicação nas interfaces

| Local | Apresentação |
| --- | --- |
| Grid do rodapé | Arte ocupa o quadrado existente; nome curto e estados legíveis sobrepostos. Preservar tamanho das células e configuração de linhas. |
| Livro de Habilidades | Mesmo componente visual e tamanho de quadrado do rodapé; manter bordas/indicadores de preparo, ativação e indisponibilidade. |
| Balão de habilidade | Miniatura entre 72 e 96 px junto ao nome; informações completas ao lado/abaixo sem clipping e com limites da viewport. |
| Instância de habilidade | Título; abaixo, imagem de até 112 px e ícones de recursos à direita. Em telas menores, custos podem quebrar para a próxima linha. |
| Gaveta de Composição | Reutilizar artes dos modos e adicionais, preservando seleção, limite por uso e ordem. |

Na instância, custos continuam refletindo composição/círculo e reaparecem na linha de execução. A imagem permanece visível durante ajuste e resultado, acompanhando o recolhimento já definido. Participantes espectadores recebem referências visuais na prévia pública sem depender de possuir a ficha completa.

## Perícias e salvaguardas

- Fundo ilustra a atividade da perícia; contraste reduzido atrás do texto. O título é o foco principal.
- Nome completo fica em texto real, com quebra controlada e tamanho mínimo legível; não truncar nomes importantes nem confiar somente no balão.
- Moldura Comum em todos os testes. Bônus numérico separado do nome, calculado pela ficha.
- Seis artes-base de salvaguarda, uma por atributo, com título explícito (por exemplo, “Salva de Destreza”) e bônus da ficha. No balão/instância, usar “Salvaguarda de Destreza”.
- Perícias longas usam até três linhas no quadrado; fonte e margens são definidas pelo componente e validadas no tamanho real do rodapé.

## Estados e variantes

Preparada, sempre preparada, ativa, selecionada, assistida pelo mestre e recurso esgotado mantêm indicadores próprios além da moldura de origem. Não usar somente cor. Não escurecer o texto ao ponto de impedir a leitura.

Ataques corpo a corpo, arremesso e mão secundária reutilizam a arte da arma com pequenas marcações e nome acessível. Subir círculo não exige gerar outra arte. Consumíveis mantêm a arte do item. Passivas, reações, modos do compositor, aprimoramentos e rerrolagens também devem ter referência visual para evitar versões só com texto desconectadas do padrão.

## Arquivos e desempenho

- Fontes transparentes em PNG, derivados de exibição em WebP com alpha quando adequado.
- Molduras/fundos em SVG com viewBox 500 × 500, seguindo o padrão atual dos itens.
- Manifesto central associa IDs estáveis a caminhos; não armazenar base64 nas fichas ou no estado da sala.
- Carregamento sob demanda, dimensões fixas e cache; não baixar todos os arquivos ao iniciar o HUD.
- Placeholder Comum e nome legível enquanto carrega ou em falha. Nenhuma habilidade perde funcionalidade por falta de imagem.

## Ordem de execução proposta

1. Fechar o desenho das três famílias e o tratamento de texto de testes em uma amostra real do HUD.
2. Inventariar habilidades das sete fichas e conteúdo comum, agrupando artes reutilizáveis por ID e registrando origem.
3. Criar compositor visual compartilhado, registro central e fallback; integrar rodapé, livro, balões, instância e gaveta.
4. Gerar amostras 500 × 500: soco, uma magia, uma racial, uma perícia longa e uma salvaguarda; reutilizar imagem existente de arma.
5. Aplicar a coleção completa após revisão visual das amostras.
6. Conferir troca de armas, custos dinâmicos, observadores, nomes longos, estados, responsividade e falha de carregamento.

## Pontos a fechar no desenho

- Manter o nome curto visível em todas as habilidades, além da imagem, como recomendado; perícias e salvaguardas têm sempre texto em destaque.
- As três famílias são compartilhadas entre classes e raças; ícones da própria habilidade distinguem o conteúdo. Variações exclusivas por classe/raça podem ser adicionadas depois.
- Exame ampliado de habilidade pode reutilizar o padrão de itens se solicitado; não é requisito desta proposta.

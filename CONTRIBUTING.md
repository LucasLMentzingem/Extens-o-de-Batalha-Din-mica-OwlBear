# Contribuindo com conteúdo

Para criar personagens importáveis, consulte o [manual de criação de fichas](docs/MANUAL-CRIACAO-FICHAS.md). O [estado atual do projeto](docs/ESTADO-DO-PROJETO.md) registra entregas recentes, validação e pendências.

O catálogo central é a fonte oficial das regras reutilizáveis. Não copie a definição completa de uma habilidade ou item para uma ficha.

## Estrutura

- `site/catalogos/habilidades.json`: definições de ações, magias, reações e passivas.
- `site/catalogos/itens.json`: definições de armas, armaduras, consumíveis e demais objetos.
- `site/catalogos/catalogo.schema.json`: contrato básico das entradas do catálogo.
- `site/catalogos/catalogo-gerado.mjs`: artefato de runtime; não editar manualmente.
- `site/fichas/*.json`: personagens no formato 2, com concessões e instâncias por referência.
- `site/fichas/ficha.schema.json`: contrato dos formatos de ficha aceitos.

## Adicionando uma habilidade

1. Inclua uma entrada em `site/catalogos/habilidades.json`.
2. Use um ID permanente, legível e com namespace, como `magia.passo-nebuloso`.
3. Comece com `revisao: 1`. Aumente a revisão ao alterar a mecânica publicada.
4. Adicione à ficha apenas uma concessão:

```json
{
  "id": "passo-nebuloso-recompensa-aventura",
  "ref": "magia.passo-nebuloso",
  "tipo": "habilidade",
  "origem": {
    "tipo": "recompensa_aventura",
    "nome": "Recompensa de aventura"
  }
}
```

A definição responde **o que a habilidade faz**. A concessão responde **por que e em quais condições o personagem a possui**.

## Adicionando um item

Defina o item em `site/catalogos/itens.json`. O inventário guarda apenas sua instância:

```json
{
  "id": "nikki-adaga-01",
  "ref": "item.adaga",
  "quantidade": 1,
  "equipado": true,
  "equipadoSlot": "mao_forte"
}
```

O `id` identifica aquela cópia concreta e deve sobreviver a transferências, saques e furtos. A referência determina peso, propriedades, dano, tipo e efeitos.

## Exceções

Use `ajustes` somente para diferenças daquela concessão ou instância, como um nome próprio ou bônus exclusivo. Conteúdo inteiramente particular de uma campanha pode usar `definicaoLocal`, mas isso é uma exceção e não recebe correções do catálogo central.

Um uso gratuito individual pertence à concessão, não à definição da magia. Use `usoGratuito` junto de `somenteUsoGratuito` quando a recompensa não autorizar o custo normal.

## Gerando e validando

Depois de editar os catálogos ou fichas:

```text
node gerar-catalogo-runtime.mjs
node gerar-catalogo-configurado.mjs
node gerar-catalogo-runtime.mjs --check
node --test combate.test.mjs
node --test ability-art.test.mjs recipientes.test.mjs
```

O validador recusa IDs duplicados, referências inexistentes, recursos de uso gratuito ausentes e artefato de runtime desatualizado. O GitHub Actions executa essas verificações antes de publicar.

O padrão de arte das habilidades está em [Ícones de habilidades](docs/ARQUITETURA-ICONES-DE-HABILIDADES.md). Registre arquivos em `site/catalogos/artes-habilidades.mjs`; mantenha arte transparente, fundo, moldura e símbolo de variante separados. Reutilize a imagem do item para ataques físicos. Custos e nomes continuam como texto da interface.

`migrar-fichas-v2.mjs` documenta e reproduz a migração inicial das fichas históricas; não é o fluxo normal para adicionar conteúdo novo.

## Compatibilidade

O importador ainda aceita fichas do formato 1. Conteúdo conhecido é convertido em referências na próxima persistência; conteúdo desconhecido é preservado como definição local. Encontros salvos são hidratados pelo catálogo atual sem apagar PV, recursos, preparação, equipamentos, vínculos ou efeitos.

## Versionamento

Siga [VERSIONING.md](VERSIONING.md). Enquanto não houver instrução expressa do responsável pelo projeto, altere somente o último número de `0.8.x`.

# Versão 0.8.72 — CA base, extra e total dinâmicas (#77)

Revisa o trabalho da PR #78, publicado no run 44436889484 como 0.8.71. A ficha apresenta **CA base + CA extra = CA total** com a mesma função usada pelo combate. Atributos permitidos pela fórmula, escudos, encantamentos, luvas condicionais, traços aditivos, efeitos e ajustes manuais entram em CA extra. A linha identifica a origem da base.

Sem armadura corporal, vale a fórmula sem armadura da ficha ou um traço/efeito válido. Com armadura corporal, vale a base da armadura e somente seu atributo permitido, com o limite configurado. Traços que fornecem fórmulas alternativas não se somam entre si. Desativar o traço retira sua fórmula. Armadura Arcana continua dinâmica; Fé e Escudo Arcano continuam bônus, sem duplicar o delta antigo.

## Correções encontradas na revisão

1. A migração da 0.8.71 fabricava um ajuste permanente para conservar o total antigo. Esse ajuste automático não representa uma fonte de CA: agora é removido. Ajustes explicitamente editados, sem a marca `ajusteLegado`, são preservados.
2. A 0.8.71 também podia congelar a base de um aventureiro importado já sem armadura. As sete fichas canônicas com essa assinatura são reparadas. Fórmulas particulares explícitas não são substituídas por coincidência numérica em outras fichas.
3. Fichas v1 só tinham o inventário normalizado depois da primeira tentativa de migração. Agora recebem a defesa ainda na primeira validação, sem voltar ao cálculo antigo com piso em `caBase`.
4. A CA extra exibida antes excluía o ajuste manual. Agora contém todos os bônus; o ajuste é editado em um detalhe recolhível e não é contado duas vezes. Editar atributos ou ajuste atualiza a prévia e o total da ficha antes de salvar, sem gravar no estado.
5. Salvar pelo jogador enviava a ficha expandida. Na simulação com Hannah, o comando tinha 31.230 bytes e ultrapassava o limite de 16.384 bytes. O cliente agora envia a ficha compacta: 8.160 bytes no mesmo cenário, sem perder atributos, equipamento, recursos ou ajuste.
6. Itens mágicos legados das oito variantes conhecidas podem conservar a base antiga em uma definição expandida ou em `ajustes`. A migração reconhece essa assinatura, separa o encantamento e corrige os metadados de compactação, evitando duplicá-lo ao reabrir.
7. Defesa sem Armadura do Monge foi declarada também na fonte do catálogo; a descrição usa a fórmula, sem total fixo 14. A consulta não depende do nome da classe para uma fórmula já configurada.

## Exemplos de referência

| Ficha/cenário | CA base | CA extra | Total |
|---|---:|---:|---:|
| Hannah com couro | 11 | +2 DES | 13 |
| Hannah sem couro | 10 | +2 DES | 12 |
| Draven com cota | 16 | 0 | 16 |
| Draven sem cota | 10 | +1 DES | 11 |
| Loteria com Defesa sem Armadura ativa | 10 | +3 DES +1 SAB | 14 |
| Nikki com Armadura Arcana e Fé | 13 | +2 DES +2 Fé | 17 |
| Dragoberto com o couro atualmente cadastrado | 13 | 0 | 13 |
| Dragoberto sem armadura | 10 | +3 DES | 13 |

**Dragoberto:** seu item é `item.armadura-couro-batido`, cadastrado como base 13 sem atributo habilitado. A 0.8.71 inventou +3 para conservar 16; esse bônus foi retirado. Não houve troca para o item de Zurich, nem ativação silenciosa de DES na armadura. O mesmo total 13 nos dois estados tem decomposição diferente e correta. Alterar a regra autoral da armadura é uma decisão de conteúdo separada.

As CAs intrínsecas/naturais já cadastradas de criaturas e objetos são preservadas, incluindo mortos-vivos e o saco de pancadas CA 1 / 500 PV. A regra de escudo sem proficiência e as condições reais das luvas permanecem. Nenhuma ficha canônica foi encontrada com dois pares equipados; a compatibilidade com dados antigos permanece como proteção, sem exigir uma interface nova para esse caso inexistente nas fichas atuais.

## Fichas existentes e reimportação

**Não é necessário reimportar as fichas desta campanha.** O reparo é aplicado ao carregá-las/validá-las e também reconhece fichas já migradas na 0.8.71. Fontes v1/v2, cópias dos downloads e pacotes históricos continuam sendo lidos. Não foram reescritos ZIPs históricos, inventários, identidades ou loot original. A ficha sobreposta será validada pelas mesmas regras quando restaurada.

Por isso não há uma pasta de JSONs para substituir fichas manualmente. A migração não cobra ações, recarrega recursos ou duplica itens. A revisão é idempotente. Uma execução com dependências de ficha alteradas continua sujeita à revalidação existente; resultados não são rerrolados automaticamente.

## Verificação

- Baseline da PR #78: **461 testes** aprovados.
- Suíte desta revisão: **472 testes** aprovados; 11 testes adicionais cobrem decomposição, migração, preservação e variantes antigas. O teste histórico que exigia conservar 16 em Dragoberto foi substituído pela regra explícita pedida pelo usuário.
- **29 arquivos de fichas / 24 IDs**, três entidades embutidas e os modelos de reanimação permanecem compatíveis com o carregamento e a suíte.
- **18 cenários de navegador** com UI/bridge reais e SDK simulado: GM e jogador em sessões isoladas; dentro/fora do combate; equipar/desequipar; prévia; salvar; F5 de ambos; traço de Loteria; reparo de Dragoberto; larguras 890 e 560 px. Sem erros ou mensagens acima do limite após compactar.
- Versão e catálogo conferidos. Sopro de Dragão, hitboxes, movimento dinâmico, recursos e sobreposição/loot cobertos pela regressão existente.

A verificação de duas sessões usa um SDK simulado, sem operar uma sala autenticada do usuário. A publicação deve ser confirmada pelo workflow e pelo conteúdo HTTP do manifesto/arquivos antes de encerrar a issue.

# Caixas e loot no chão — implementação

Estado: integrado à entrega 0.8.43. A revisão, os testes e as limitações estão em [Revisão 0.8.43](REVISAO-0.8.43.md). O texto abaixo preserva a arquitetura e distingue implementação de propostas futuras.

## Implementado nesta etapa

- Estado persistente de recipientes por cena, com caixas e loot no chão, revisão e vínculo ao token de prop.
- Botão do GM para criar um baú no centro da cena; opção contextual para vincular uma imagem existente como caixa e ajustar nome/capacidade.
- Menus contextuais para GM gerenciar e para jogadores/GM abrir o saque de uma prop. O saque valida alcance de 1,5 m, turno e ação, peso e quantidade no servidor.
- A caixa tem capacidade fixa de slots e aceita itens/PO do catálogo. O loot no chão usa um slot, não aceita depósitos e a prop some ao ficar vazia.
- A janela de saque reutilizada permite selecionar itens e quantidades, mostra carga antes/depois e confirma as transferências juntas. Em caixas, clicar seleciona para retirar; botão direito em item próprio seleciona para depositar.
- Equipamento obtido pode ser equipado diretamente na confirmação. Slot vazio não custa ação; substituir equipamento cobra ação bônus. A tela compara equipamento compatível atual e mostra os slots livres da caixa.
- Largar itens da ficha cria uma prop no token do personagem. Arremessar uma arma equipada remove uma instância e cria loot junto ao alvo, acerte ou erre.
- Equipar em espaço vazio não gasta ação. Substituir ou desequipar em combate gasta uma ação bônus; usar consumível gasta uma ação. Largar equipamento em uso também cobra ação bônus.

Ainda falta validar visualmente e em multiplayer dentro do Owlbear, comparação visual rica lado a lado (a janela mostra a peça equivalente equipada por texto) e tratar reações pendentes durante arremesso. A entrega segue local até nova solicitação de publicação.

## Regras solicitadas

- Saquear aceita inimigos derrotados, caixas e itens caídos; alcance contínuo de 1,5 m. Em combate usa 1 ação; fora dele a ação não é limitada.
- A caixa tem inventário com quantidade fixa de slots, editável pelo mestre no menu contextual da prop. Recebe e entrega itens.
- Um item no chão é uma prop com a arte transparente do item e exatamente um slot. Pode conter uma pilha; não aceita depósitos. Desaparece quando todo o conteúdo é retirado.
- Comparação com equipamento atual, descrição, raridade e exame usam os componentes de itens existentes.
- Equipar em slot vazio é gratuito. Trocar equipamento custa 1 ação bônus em combate. A regra é da mesa e substitui o custo anterior de 1 ação para equipamento.
- Pegar do chão e equipar custa 1 ação de Saquear; substituir arma equipada custa essa ação mais 1 ação bônus. A arma antiga permanece na mochila do portador, e a nova passa ao slot equipado da mesma ficha. Nenhum dos dois itens some.
- Arremessar uma arma física retira uma unidade real do inventário/equipamento e a deixa no chão aos pés do alvo, tanto no acerto quanto na falha. Seu ataque usa o custo normal; não há custo adicional de Saquear para o lançamento.

## 1. Três origens, uma janela de saque

Criar uma interface de origem com `tipo: personagem | caixa | chao` e `id`, sem transformar props em fichas de combate. Personagens continuam usando o inventário atual e o requisito de inimigo derrotado. Caixas e chão usam registros próprios da cena.

Saquear seleciona o alvo no mapa, valida o alcance, abre o inventário do saqueador e recolhe sua HUD. À direita aparece a grade de conteúdo da origem. Equipamentos do personagem derrotado vêm primeiro; caixas mostram slots vazios reais; chão mostra somente um slot.

O jogador seleciona itens e quantidades, vê o peso final e confirma. Na caixa, botão direito no item da própria mochila oferece **Colocar na caixa**, com quantidade para pilhas. Isso entra na mesma seleção pendente; **Confirmar transferências** aplica retiradas e depósitos juntos. Permite retirar um item e colocar outro em uma caixa cheia, se o resultado final couber. Cancelar descarta a seleção.

Em loot de equipamento, a janela permite **Pegar e equipar** no slot padrão compatível. Slot ocupado mostra o item substituído e cobra ação bônus em combate. A confirmação revalida tudo antes de mover qualquer item.

O exame e a comparação têm a mesma aparência da loja. Uma arma compara com mão forte, mão fraca e arma à distância conforme compatibilidade. Para duas mãos, mostrar todos os slots afetados. A arte do chão usa somente `icone`, sem a moldura temática da interface.

## 2. Slots e pilhas da caixa

- Uma entrada não empilhável ocupa um slot. Uma pilha compatível ocupa um slot, inclusive PO (peso zero por regra da mesa).
- Duas armas físicas equipáveis permanecem instâncias separadas. Nunca usar uma única pilha como duas mãos equipadas.
- Só juntar pilhas quando referência, ajustes, estado e regras de empilhamento forem iguais. Equipamentos com cargas, propriedades individuais ou estado próprio não devem ser unidos automaticamente.
- Uma arma de duas mãos ocupa um slot de armazenamento e dois slots de equipamento, conforme o modelo atual.
- Capacidade de caixa significa slots; o peso limita a ficha que recebe itens. Peso máximo de caixa não faz parte desta etapa.
- A grade pode ter até cinco colunas e quantas linhas precisar, mas contém exatamente a capacidade configurada. A última linha não cria slots extras; rolagem vertical não aumenta capacidade.
- Mestre não pode salvar capacidade abaixo da ocupação atual. Mostrar quantos slots precisa liberar. A caixa vazia permanece no mapa.

## 3. Configuração pelo mestre

No contexto de uma prop: **La Arte → Configurar caixa**. Permitir converter uma imagem de caixa existente ou criar com a arte padrão.

Painel: nome, quantidade inteira positiva de slots, indicador `ocupados / capacidade`, **Salvar**. Conteúdo é gerido pelo mestre com adicionar item/PO e pelas transferências permitidas. Apenas o mestre altera capacidade e conteúdo administrativo. Players não alteram metadados para aumentar capacidade.

O token no Owlbear só referencia `recipienteId`; estado e conteúdo pertencem ao host da extensão. Não adicionar CA, PV, iniciativa ou habilidades a caixas. Prop oculta não deve revelar seu conteúdo aos jogadores; apenas uma sessão autorizada recebe o inventário necessário.

Proposta: duplicar uma caixa pelo mestre cria novo registro e novas instâncias de conteúdo, com cópia independente. Nunca dois tokens apontando acidentalmente para o mesmo inventário. Apagar uma prop de recipiente não deve destruir silenciosamente seu conteúdo: reconciliação preserva o registro órfão para recuperação pelo mestre.

## 4. Custos unificados de saque e equipamento

| Operação | Custo em combate |
| --- | --- |
| Equipar item da mochila sem desalojar equipamento | Grátis |
| Equipar item da mochila desalojando equipamento | 1 ação bônus |
| Saquear para guardar na mochila | 1 ação |
| Saquear e equipar sem desalojar equipamento | 1 ação, total |
| Saquear e equipar desalojando equipamento | 1 ação + 1 ação bônus, total |
| Lançar uma arma arremessável | Custo do ataque correspondente |

O custo de 1 ação já pago ao abrir a habilidade Saquear é o custo de coleta: não cobrar de novo ao confirmar. A sessão pertence a uma execução de Saquear. Cancelar depois de executá-la não devolve a ação. Depois da confirmação, nova retirada exige nova execução em combate; não deixar uma janela antiga funcionando como saque ilimitado nos próximos turnos.

Fora de combate, essas operações não são limitadas por ação/bônus, preservando alcance, peso, slots e permissões. Em combate exigem turno do personagem e recursos disponíveis.

O custo depende dos slots fisicamente ocupados. Duas mãos só é grátis se ambas estiverem livres; se houver um ou dois equipamentos incompatíveis, a substituição custa uma única ação bônus pela operação. Escudo conflita com a mão fraca. Recalcular CA, buffs condicionais e ataques equipados depois da operação completa.

Não cobrar recursos se falhar validação de quantidade, carga, slot ou revisão concorrente. Para itens de carga e bônus de capacidade, calcular o estado final completo antes de aceitar: remover equipamento que aumenta carga também pode causar excesso.

Propostas a confirmar: **Desequipar/guardar** em combate custa 1 ação bônus, coerente com substituir. **Largar no chão** item da mochila é grátis, mas largar equipamento em uso custa 1 ação bônus; isso evita contornar o custo de troca soltando uma arma gratuitamente. Depositar equipamento em uso segue esse mesmo custo. Retirar do chão continua custando Saquear. São propostas para completar casos não explicitados pelo mestre.

A descrição histórica do Desarme diz que reequipar custa 1 ação. Atualizar para a regra aprovada de equipar slot vazio gratuitamente e registrar o impacto no balanceamento; não deixar custos contraditórios em textos antigos.

## 5. Dropar e arremessar

No menu contextual: **Largar no chão**, com quantidade da pilha e prévia do custo se equipado. Criar prop próxima à posição do personagem, sem permitir que o clique a coloque longe. Cada drop é um recipiente de um slot; drops próximos continuam independentes nesta etapa.

No arremesso, capturar a instância física e os parâmetros completos do ataque antes de removê-la. Separar exatamente uma unidade; uma arma de duas mãos libera os dois slots. A arma que sai da mão deixa de gerar ataques, CA ou bônus de equipamento imediatamente após o lançamento ser efetivado. Não reequipar automaticamente outra da mochila.

Reservar a unidade ao iniciar a execução para impedir duas ações simultâneas usando a mesma arma. Se cancelar antes de efetivar o ataque, liberar reserva e não criar loot. Quando o ataque é efetivado, transferir a unidade para um registro de chão no ponto do alvo daquele lançamento; terminar dano e efeitos com o retrato do ataque já capturado. Mesmo falhando, a unidade permanece lá. Caso a resolução pause para reação/rolagem, guardar os dados necessários à retomada.

O ponto de queda usa a posição do alvo capturada no lançamento, com um pequeno deslocamento visual só para o ícone ficar visível, sem aumentar alcance de coleta. Não seguir o alvo depois. Arremesso não é disparo: arcos não são descartados; munição exige regra própria futura. Habilidades mágicas que imitam armas sem instância física não criam cópias saqueáveis. Armas de retorno configuradas futuramente poderão substituir a política de queda.

O conteúdo preserva referência de catálogo, ajustes autorais, quantidade, cargas, propriedades e identidade física. Transferência integral conserva ID de instância; uma divisão de pilha cria novo ID só para a parte separada. Sem rerrolar propriedades ou recarregar itens no caminho.

## 6. Estrutura de dados proposta

```json
{
  "id": "recipiente-uuid",
  "tipo": "caixa",
  "nome": "Baú de madeira",
  "tokenId": "owlbear-id",
  "posicaoM": {"x": 12.5, "y": 8.2},
  "capacidadeSlots": 12,
  "permiteDeposito": true,
  "removerAoEsvaziar": false,
  "revisao": 1,
  "itens": [{"id": "instancia-uuid", "ref": "item.adaga", "quantidade": 1}]
}
```

No tipo `chao`, impor no motor `capacidadeSlots: 1`, `permiteDeposito: false` e `removerAoEsvaziar: true`. Estas propriedades não são opções de player. Guardar registros em `estado.recipientes`, com índices por ID/token para evitar varrer todo o mapa.

Sessão: `id`, `atorId`, `origem: {tipo,id}`, revisão de origem, execução de Saquear/custo já pago e seleção pendente. Comando de confirmação carrega quantidades por ID e destinos de equipamento; nunca aceita definições arbitrárias enviadas pelo player.

Identidade física pertence à instância; definição mecânica continua no catálogo. Criar objetos auxiliares próprios para recipientes, não fichas falsas de NPC. JSON aqui é contrato proposto, ainda não aceito pelo schema atual.

## 7. Consistência multiplayer e persistência

Reutilizar o host do mestre como autoridade de comandos. Ler origem e ficha atuais, validar controle, turno, ação/bônus, sessão, distância euclidiana, revisão, quantidades, ocupação, carga final e compatibilidade. Simular toda a transferência, depois aplicar em uma única alteração de estado. Nunca tirar da caixa primeiro e falhar depois ao adicionar à ficha.

Dois jogadores podem ver a mesma caixa. A primeira confirmação muda sua revisão; a segunda recebe conteúdo atualizado e revisa a seleção, sem consumir bônus nem duplicar itens. Cair de conexão antes da confirmação não move nada. IDs de operação tornam confirmação e eventos de arremesso idempotentes.

O estado de recipientes e suas instâncias já é preservado pela compactação/backup da cena. As props usam IDs estáveis, e o host sincroniza tokens faltantes quando carrega a cena. A sincronização é sequencial pelo host do mestre; ainda não existe uma fila durável de operações pendentes, então uma falha da API do Owlbear deve ser recuperada por uma nova sincronização/reabertura.

Selecionar objetos não dá acesso ao inventário sem Saquear. Diminuir ou aumentar o ícone no mapa não altera o alcance; distância usa metros contínuos e a escala da cena já existente. Revalidar ao confirmar se o ator/objeto mudou de lugar. Não publicar conteúdo inteiro de todas as caixas no estado público: enviar somente o de sessões autorizadas, respeitando visibilidade da prop.

## 8. Implementação local

- `site/engine.mjs`: validações de alcance, ação, carga, slots, depósitos, saque e arremesso de instância física.
- `site/saque.mjs` e `site/recipiente.mjs`: janela de transferência, exame, equipamento direto, configuração da caixa e seleção de personagem.
- `site/ui.mjs`: criação de baú no painel do mestre e ação contextual para largar itens.
- `site/bridge.mjs`: token da prop, menus de contexto e sincronização da cena sem observar cada quadro do arraste.
- `site/catalog.mjs`: catálogo de itens continua como fonte das definições; o estado do recipiente guarda somente instâncias.

## 9. Pendências conhecidas antes da publicação

- Fazer smoke test visual e multiplayer no Owlbear com GM e dois jogadores; não foi executado nesta etapa.
- Melhorar a comparação de itens para mostrar os dois cartões lado a lado, como na loja. Hoje o inventário mostra o nome do item equipado compatível.
- Tratar falhas transitórias da API Owlbear com uma fila durável de sincronização.
- Tratar reações/pausas durante ataques arremessáveis e validar a posição final da prop em sala.
- Revisar privacidade por destinatário de inventários de saque que já estejam abertos; o conteúdo das caixas fechadas não é incluído no estado público, mas a sincronização atual de sessões abertas é compartilhada pela sala.
- Atualizar textos de equipamento, Desarme e manual: há cobranças antigas de 1 ação que precisam ser substituídas juntas.

## 10. Fix aprovado: gerenciamento de baús e recipientes

Esta seção registra o fix de gerenciamento aplicado localmente.

- **Criar baú**, no Controle do mestre, cria um único baú com a imagem padrão no centro da área da mesa atualmente visível para o mestre. A posição considera a câmera e o zoom do mestre, convertendo o centro da tela em coordenadas da cena. O nome inicial é “Baú” e a capacidade inicial é 12 slots, ambos editáveis.
- No botão direito de uma imagem na camada de props, somente o mestre vê **Transformar em recipiente**. A conversão preserva imagem, posição e tamanho. Uma prop já vinculada oferece **Abrir recipiente** e **Configurar recipiente**, sem criar um segundo registro.
- Na lista de fichas, imediatamente após **NPCs carregados**, incluir **Baús e recipientes (quantidade)**. A seção é exclusiva do mestre, começa recolhida e pode ser expandida/recolhida. Lista caixas e compartimentos; itens soltos no chão não entram nessa lista.
- Selecionar um recipiente abre sua própria ficha administrativa com duas páginas: **Ficha** e **Inventário**, sem Livro de Habilidades, atributos ou controles de combate.
- A página **Ficha** contém nome, capacidade em slots, ocupação atual e seletor **Trancado / Destrancado**, com **Salvar alterações** acima. Não permitir capacidade menor que a ocupação. O estado inicial é destrancado.
- A página **Inventário** exibe exatamente os slots configurados e permite ao mestre adicionar itens/PO e excluir conteúdo com as confirmações existentes. A administração do mestre não consome recursos de personagem.
- **Trancado** bloqueia abertura, retirada e depósito pelos jogadores, inclusive a confirmação de sessões abertas antes da tranca. O mestre mantém acesso administrativo. A confirmação da transferência deve revalidar a tranca no motor autoritativo.
- Nome, capacidade e estado da tranca persistem com o recipiente. Jogadores não recebem acesso à ficha administrativa; o inventário continua condicionado à permissão de saque e à visibilidade da prop.
- Quando destrancado, manter alcance de 1,5 m, custo de 1 ação em combate e validações de quantidade, peso e espaços. Chaves e testes de arrombamento ficam para uma etapa posterior.

## 11. Ordem recomendada de implementação futura

1. Cálculo unificado de custo/ocupação e transferência preservando instâncias e carga final.
2. Registro de recipientes, menu GM e capacidade fixa.
3. Janela compartilhada de saque e depósitos em caixas.
4. Drop de pilhas, props transparentes e limpeza de recipientes vazios.
5. Pegar/equipar com custos e comparação em todas as origens.
6. Arremesso físico, retomada após reações e sincronização idempotente.
7. Regressão de inventário, lojas/trocas, fichas, arremessos, reconexão e dois players simultâneos.

Critérios: caixa lotada rejeita excedente; troca simultânea de conteúdos cabe no resultado final; não reduzir slots abaixo da ocupação; divisões conservam quantidades/cargas; dois players não pegam a mesma unidade; peso nunca excede capacidade; PO têm peso zero; mãos e armas de duas mãos respeitam ocupação; custo de saque não duplica; cancelar não move itens; drop parcial não apaga o restante; chão rejeita depósito e some só vazio; arremesso que acerta ou erra consome uma unidade física; cancelamento pré-execução não; prop não vai à iniciativa; reabrir cena mantém todos os itens.

## Prop entregue

- PNG mestre transparente: `site/assets/props/bau-madeira-saque-75graus.png`.
- WebP para uso futuro: `site/assets/props/bau-madeira-saque-75graus.webp`.
- Cópia na pasta de campanha: `outputs/aventura DnD/Asset/Tokens/Props/Bau-Madeira-Saque-75graus.png` (caminho relativo ao workspace).
- Perspectiva solicitada: câmera alta, cerca de 75° acima do plano horizontal. Arte de madeira/ferro, sem moldura de moeda.
- Prompt e origem: `docs/arte/bau-madeira-saque-prompt.md`.

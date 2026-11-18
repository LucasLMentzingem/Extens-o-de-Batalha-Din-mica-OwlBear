# Versão 0.8.61 — HUD, descansos e atividades

## Correções dos dois bugs

O rodapé compacto e o expandido passam pelo mesmo commit de DOM/cache. Antes, a versão compacta substituía o HTML sem atualizar o cache e a expansão podia conservar somente o retrato. O comando informa o estado desejado, evitando inversões repetidas.

Há um controlador de HUD por sala/conexão, com Web Locks entre documentos do mesmo perfil e guarda local. Vistas não são interpretadas como comandos; mensagens de gerações antigas e sinais de entrada de documentos substituídos são ignorados. Assinaturas e temporizadores próprios são descartados ao encerrar o documento.

A barra usa âncora inferior e redimensionamento pelo SDK para preservar o iframe. Mudanças geométricas aguardam a liberação do ponteiro. Cancelamento de arrasto, Escape e troca de ferramenta limpam a mira não executada, respeitando o Move selecionado e preservando a operação aceita. Uma janela saudável é consultada antes de ser recriada. Diagnóstico local mantém somente os últimos 128 eventos de ciclo.

O botão **Reabrir HUD** fica no painel da extensão para mestre e jogadores. Remove janelas órfãs e recompõe a apresentação sem apagar o diário, rerrolar dados ou cancelar jogadas aceitas.

## Ajustes locais incluídos

- Aa também alterna títulos curtos nos recursos; os saldos continuam visíveis com Aa desligado.
- Atividades da mesa abre no centro; botão recolhido no canto inferior direito. Filtros independentes por estado e por tipo: Todos os tipos, Salvaguardas e Ataque. Ataque reúne as demais atividades.
- Descanso curto/longo usa a mesma seleção no motor e nos dois painéis: apenas PJs vivos, inclusive os retirados da iniciativa. NPCs não são afetados, mesmo com a flag antiga de descanso. Descanso individual permanece disponível; os comandos continuam restritos à fase de preparação.
- Fix publicado de Sopro de Dragão, artes, tokens, sobreposição, loot e protótipos anteriores preservados.

## Validação e limites

426 testes de regras/protocolo passaram. No navegador: 26 cenários GM/P1/P2; cinco de descanso; centro/filtros e conclusão de salvaguarda; sete combinações de Zurich e uma pela interface; seis regressões de HUD. Estas incluem 200 alternâncias do renderer, 60 ciclos físicos de compactar/expandir sem trocar o documento, duplicidade induzida de controladores, entrada pressionada, cancelamento de mira, recuperação pelo jogador durante resultado pendente e reposição automática de iframe perdido. Capturas revisadas; cliente Playwright da skill executado.

SDK Owlbear e Dice+ simulados. O bloqueio exato de cliques sobre a HUD na sala real não foi reproduzido; as mudanças corrigem causas confirmadas e riscos identificados no ciclo de janelas/entrada. A validação simulada não comprova a resolução de toda falha nativa do host.

Baseline, análises anteriores e evidências de desempenho da 0.8.60 permanecem históricas, sem sobrescrita. Esta versão não repete a comparação ampla de desempenho da 0.8.60.

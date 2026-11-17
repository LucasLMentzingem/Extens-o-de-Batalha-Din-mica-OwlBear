# Páginas do Controle do Mestre

Alteração local preparada após a 0.8.50; ainda não publicada.

O painel possui quatro páginas: Controle do combate, Controle de fichas, Lojas e Restante. A última reúne baús/loot, avanço de tempo, descansos, amanhecer e histórico. Configurar na lista de combate abre a página de fichas e expande o grupo correspondente.

As listas de combate, vínculos de fichas e seleção de iniciativa usam grupos recolhíveis, fechados por padrão, com nome e quantidade. A expansão é conservada por página durante a sessão. Todos os PJs aparecem em Aventureiros, sempre primeiro. NPCs seguem seu grupo de origem; fichas antigas são associadas às listas existentes pelo ID, com os soldados legados em Soldados do Reino. Invocações e personagens sem origem possuem listas próprias.

Ao importar um grupo, o ator conserva grupoFicha: {id, nome}. Isso pertence à instância do encontro; não altera a definição da ficha. Compactar/reabrir preserva o campo; duplicar um token NPC copia o grupo do ator de origem. Reordenar visualmente não altera a iniciativa.

Validação: 305 testes passaram, incluindo origem importada, persistência, cópia NPC e prioridade de Aventureiros. Navegador com SDK simulado confirmou as quatro páginas, grupos recolhíveis, estado de expansão e navegação por Configurar. Conferência na sala real permanece pendente.

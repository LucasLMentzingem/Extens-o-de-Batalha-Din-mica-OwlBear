# Favoritos e status compactos

Implementação sobre 0.8.81, preparada para publicação na 0.8.82 após autorização do responsável, em 21/11/2026.

## Status

- Ícones com lado máximo de 32 px; janela de uma linha com até 44 px de altura, incluindo o espaço de scroll. Dez efeitos visíveis, rolagem horizontal acima disso, sem deformar as artes ou baixar sua resolução.
- Reserva inferior do rodapé permanece 48 px com ou sem efeitos. Adicionar um status não eleva o rodapé nem altera seu limite de altura.
- Na faixa inferior esquerda, a barra termina 4 px antes da borda inferior. Quando a largura não comporta os efeitos entre as ferramentas nativas, a barra fica acima do rodapé, sem elevá-lo ou cobrir o centro das ferramentas.
- Nome, contador, moldura e dica mantidos. Sem novas imagens, fichas ou tráfego compartilhado de preferências.

## Favoritos

- Personalizado passa a Favoritos, habilitado na mesma posição, após as categorias existentes.
- Botão direito sobre a habilidade abre um menu pequeno: Pôr no favorito; dentro de Favoritos: Tirar do favorito. Fora da aba, uma referência já salva mostra Já está nos favoritos. Botão direito deixa de executar a habilidade.
- Funciona também com habilidades temporariamente bloqueadas, passivas, consumíveis, perícias e salvaguardas. As passivas continuam passivas; o menu não gasta ações ou recursos.
- Favoritos guardam apenas referências e são renderizados com os dados atuais. Custos, requisitos, ações e restrições seguem o mesmo caminho das outras abas. Uso gratuito explicitamente favoritado mantém seu modo, separado do uso automático normal.
- Ordem de inclusão preservada; inclusão idempotente. Referências temporariamente indisponíveis ficam guardadas e reaparecem quando a opção estiver disponível novamente.
- Preferências locais por sala, usuário e unidade/personagem, persistidas em localStorage. Sobrevivem a F5; mestre e jogador têm listas independentes. Não entram no JSON da ficha, não requerem reimportação e não são sincronizadas entre dispositivos/navegadores.
- Limite de 256 referências por personagem, validação de dados legados/corrompidos, falha de gravação reportada sem anunciar sucesso. A lista também participa da identidade do cache do rodapé, impedindo restaurar HTML antigo após alteração.
- Menu fecha por ×, Escape, perda de foco ou interação com outro grupo da HUD. Ao recolher ou trocar de personagem, é encerrado. Usa a janela pequena já existente de dica, sem superfície transparente extra sobre o mapa.

## Validação local

- 517 testes Node aprovados: cinco novos para referências, isolamento, persistência, idempotência, normalização, limites e falha de armazenamento; testes de geometria atualizados para a nova altura.
- 11 verificações de interface específicas: favoritar sem executar, aba e referência, isolamento GM/jogador, F5, remoção, passiva bloqueada, perícia, modo gratuito/custo automático, status sem mover o rodapé, fechamento e Escape.
- Regressões: oito de A com 160 cliques no canvas/arrastes; sete de estabilidade; 24 gerais de HUD; seis de expansão do retrato. Barra B conferida novamente com 1/10/11/25 efeitos, mestre/jogador, scroll, Aa, duração e viewports.
- SDK/host simulados em navegador headless local. Sem controle do navegador do responsável. Versão e catálogo runtime válidos; a disposição nativa na sala autenticada ainda depende da validação do responsável após publicação.

Arquivos principais: `site/hud-favorites.mjs`, `site/effect-layout.mjs`, `site/hud-controller.mjs`, `site/hud-ui.mjs`, `site/hud-part.mjs`, `site/hud-protocol.mjs`, `site/hud.css`, `hud-favorites.test.mjs`, `effects-hud.test.mjs`.

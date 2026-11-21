# Versão 0.8.82 — Favoritos e status compactos

Personalizado passa a Favoritos. Botão direito na grade do rodapé abre Pôr no favorito; na aba Favoritos, Tirar do favorito. A lista guarda referências atuais de habilidades, passivas, itens, perícias e salvaguardas, sem executar ações ao abrir o menu. Custos, requisitos e modo de uso gratuito são preservados. Preferências locais por sala, usuário e personagem sobrevivem a F5; não alteram fichas nem sincronizam entre dispositivos.

Ícones de status têm lado máximo de 32 px e janela de uma linha até 44 px. A reserva inferior do rodapé permanece 48 px com ou sem status, sem subir ao receber um efeito. Em telas estreitas, a barra de efeitos fica acima do rodapé, mantendo-o na posição. Scroll horizontal após dez efeitos, nomes/contadores, molduras e dicas preservados; nenhuma imagem nova.

## Validação

- 517 testes Node aprovados, incluindo persistência/idempotência/isolamento/validação/limites dos favoritos e geometria dos status.
- 11 verificações específicas de interface com mestre/jogador, F5, remoção, passiva bloqueada, perícia, custos automático/gratuito, menu/Escape e status sem elevar o rodapé.
- 21 verificações de efeitos com 1/10/11/25 estados, 24 gerais de HUD, sete de estabilidade, seis de expansão e oito de A; A inclui 160 cliques no canvas e arrastes.
- Versão/cache e catálogo runtime válidos. Ensaios locais com SDK/host simulados e SDK verdadeiro nos medidores internos. Disposição final na sala autenticada depende da validação do responsável. Nenhum navegador do responsável foi controlado.

[Implementação completa e limites](FAVORITOS-E-STATUS-COMPACTOS-2026-11-21.md).

A arquitetura de descanso curto permanece guardada para implementação futura. Sem alteração de fichas ou regras de combate nesta versão.

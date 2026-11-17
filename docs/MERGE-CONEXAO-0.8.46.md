# Integração local da conexão e recuperação — 0.8.46

Base publicada: PR #74, merge `832c72d`, contribuição `d1cfe64` do ramo `conexao-sync`, versão 0.8.45. O responsável confirmou que essa publicação resolveu a entrada do jogador. Manifesto alternativo consultado com HTTP 200 e versão 0.8.45.

## O que a contribuição corrigiu

A 0.8.44 reenviava consultas a cada 2 s mesmo com a anterior aguardando resposta. Cada consulta transmitia novamente toda a mesa em fatias fixas de 2000 caracteres. Isso podia congestionar o canal de broadcast e atrasar a própria confirmação da consulta. A contribuição reduz as mensagens com fatias medidas em bytes, limita a uma tentativa pendente e reaproveita uma difusão em andamento ou recém-concluída na mesma revisão.

Também evita que consultas locais do mestre retransmitam o estado para os jogadores, aumenta o prazo individual de consulta para 15 s e conserva o último erro real no diagnóstico.

Essas mudanças foram preservadas integralmente na integração. A falha de ficha inválida investigada localmente é uma proteção adicional reproduzida em testes; não foi confirmada como causa do incidente real que a contribuição resolveu.

## Acréscimos locais preservados

- Ficha inválida isolada sem impedir entrega das válidas, com backup bruto e original recuperável.
- Seção do mestre para exportar e excluir ficha isolada com duas confirmações.
- Limpeza de metadados e bloqueios de vínculo ao excluir ficha; tokens manuais preservados.
- Dados brutos isolados não enviados aos jogadores.
- Erro explicitamente recebido do controlador apresentado imediatamente; falhas de transporte continuam no reenvio serial da contribuição.
- Arquitetura de reset com backup, dupla confirmação, escopo de cena e geração para rejeitar respostas antigas. Reset ainda não implementado.

## Conflitos resolvidos

`bridge.mjs`: importar juntos o fatiador da contribuição e o recuperador local; manter prazo de 15 s e identificação de erros respondidos pelo controlador. Reaproveitamento da difusão e consulta local sem broadcast continuam ativos.

`room-sync.mjs`: manter `emAndamento`, sem tentativas sobrepostas, acrescentando somente a saída imediata quando `controladorRespondeu` está marcado. O último erro continua disponível para falhas não definitivas.

## Validação e entrega

275 testes automatizados passaram, incluindo os testes da contribuição para limite de bytes, remontagem, tentativa única pendente e diagnóstico, além dos testes de isolamento e exclusão. Versão e catálogo runtime válidos. Simulações em duas sessões verificam controlador atrasado, consulta durante ajuste de ataque e recuperação/exclusão pelo painel do mestre.

Integração mantida como 0.8.46 local. A publicação 0.8.45 funcional permanece no GitHub Pages. As imagens em revisão continuam fora da entrega.

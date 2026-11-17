# Conexão de jogadores ao entrar na sala — 0.8.44

Sintoma relatado: ao entrar, o usuário recebe “Sem resposta do controlador da sala”, com cena aberta e mestre conectado. A captura não identifica sozinha a causa exata, mas a revisão encontrou falhas que reproduzem o comportamento.

- A consulta inicial era enviada uma única vez e expirava após 10 segundos. Mensagens anteriores à inicialização do controlador ou à atualização da lista de participantes eram perdidas.
- Consultas de estado aguardavam a mesma fila das ações. Um ataque aguardando ajuste/resultado de dados podia bloquear a entrada de novos participantes.
- A HUD instalava sua recuperação periódica somente depois da primeira consulta bem-sucedida. Uma falha nessa consulta interrompia sua inicialização.
- A recepção de fichas exigia fragmentos estritamente ordenados, com apenas um pacote em montagem; vistas intercaladas podiam ser descartadas.

## Correção

`room-sync.mjs` reenvia somente consultas de estado, por até 30 segundos, e monta pacotes independentes mesmo quando chegam intercalados ou fora de ordem. A confirmação inicial exige uma vista completa. Ações que gastam recursos não são repetidas.

O controlador responde a consultas fora da fila de ações, lendo o último estado persistido. Essa consulta não altera fichas, não sincroniza cópias de NPC e não reinicia timers de reação. Fragmentos menores mantêm as mensagens dentro do limite de 16 KB, inclusive com caracteres Unicode e escapes JSON.

HUD e painel continuam instalando os observadores após uma falha inicial. A HUD tenta recuperar enquanto ainda não recebeu estado; mudanças nos participantes ou abertura da cena também solicitam sincronização.

## Evidências

- 266 testes automatizados passaram, incluindo reenvio quando o mestre ainda não está pronto, encerramento por ausência do mestre e montagem de fragmentos intercalados/incompletos.
- Simulação em navegador sem interface, com duas sessões e SDK simulado: jogador antes do controlador recupera a conexão; consulta durante um ataque aguardando ajuste recebe as duas fichas sem resolver ou repetir o ataque.
- Versão e catálogo runtime válidos.

O teste com SDK simulado não substitui uma conferência de rede em uma sala real do Owlbear. Correção incluída na publicação 0.8.44.

Referência da API de broadcast: https://docs.owlbear.rodeo/extensions/apis/broadcast/

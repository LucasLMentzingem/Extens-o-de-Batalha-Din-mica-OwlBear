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

## Ajuste da 0.8.45

Relato em sala real com a 0.8.44: o painel mostra "Conectando..." e, cerca de 30 segundos depois, "Sem resposta do controlador da sala", com o mestre na cena.

Problemas encontrados na 0.8.44, que podem explicar o sintoma (não foi possível reproduzir numa sala real):

- **Muitas mensagens:** partes fixas de 2000 caracteres levavam uma mesa típica (7 fichas e 5 NPCs, cerca de 259 mil caracteres) a 130 mensagens de broadcast por sincronização.
- **Reenvios empilhados:** o reenvio a cada 2 s não esperava a tentativa anterior. Cada reenvio fazia o controlador transmitir a mesa inteira de novo para todos.
- **Resposta atrasada:** o controlador só respondia depois de terminar a transmissão. Com o canal congestionado, a resposta passava do prazo de 10 s e todas as tentativas expiravam.
- **Erro real escondido:** um erro real do controlador ("Abra uma cena primeiro", "O encontro pertence ao mestre que o preparou") era descartado. Ao fim dos 30 s aparecia só a mensagem genérica.

Correção:

- `fatiarParaBroadcast` mede bytes reais (UTF-8 e escapes JSON) e mantém cada mensagem abaixo de 16 KB. A mesma mesa passa a usar 26 mensagens.
- Uma consulta por vez: o reenvio só acontece depois que a anterior termina.
- O controlador reaproveita a mesma transmissão para consultas repetidas da mesma revisão (em andamento ou concluída há menos de 3 s).
- A consulta do próprio mestre (canal local) não retransmite a mesa para os jogadores.
- O prazo de cada consulta passou de 10 s para 15 s.
- A mensagem final inclui o último erro informado pelo controlador.

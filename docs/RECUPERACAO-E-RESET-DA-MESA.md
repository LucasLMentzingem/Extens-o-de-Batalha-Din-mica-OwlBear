# Recuperação e reset da mesa — proposta 0.8.45 local

Atualização: integrada à 0.8.46 local com a correção de conexão publicada na 0.8.45 pelo contribuidor. Ver `MERGE-CONEXAO-0.8.46.md`. O responsável confirmou que o fix de excesso de broadcast resolveu o relato real; a recuperação de ficha inválida permanece como proteção adicional.

Estado: correção de recuperação implementada localmente; botão de reset especificado para revisão, sem implementação destrutiva e sem publicação. Não houve acesso à mesa real nem exclusão de dados do usuário.

## O novo relato e a causa possível

A captura contém o texto novo da 0.8.44: a versão chegou ao jogador. Ela não permite concluir que o problema está no cache ou identificar a ficha responsável.

A revisão reproduziu uma falha adicional: `carregar()` validava todas as fichas antes de responder à conexão ou aceitar qualquer comando. Um inventário antigo inválido ou referência inexistente no catálogo derrubava o carregamento de toda a mesa. A exclusão dependia do mesmo carregamento e também ficava bloqueada. O cliente recebia um erro do mestre, descartava sua causa durante as tentativas e mostrava “sem resposta” no fim.

O vínculo antigo do jogador pode apontar para a ficha inválida, mas não é evidência suficiente por si só. Há outros casos que a versão local agora permite distinguir: autoridade de outro mestre, estado JSON inválido e ausência real de controlador.

## Fix local implementado

1. Validar os atores individualmente, usando cópias; isolar somente os inválidos em `quarentenaFichas` com erro, nome e registro original completo.
2. Antes da primeira gravação de recuperação, guardar a string original da mesa em uma chave própria de backup. Se a cópia falhar, não sobrescrever o estado.
3. Caso apareça ficha inválida, interromper o combate afetado e limpar resoluções/movimentos pendentes; não continuar uma ação com participantes incompletos. A recuperação não avança durações nem gasta recursos.
4. Continuar entregando as fichas válidas. O mestre vê “Fichas em recuperação” no Controle de fichas, baixa o original e pode excluir o registro isolado com duas confirmações.
5. Não enviar originais e detalhes de recuperação aos jogadores. O dono de uma ficha isolada fica aguardando o mestre importar uma ficha corrigida e vinculá-la novamente.
6. A exclusão remove marcadores desta extensão e restaura o bloqueio anterior do token, se ele ainda existir. O token manual continua no mapa. Ficha comum continua sendo excluída fora de combate; a interface informa essa restrição.
7. Se o controlador responder com erro, mostrar sua mensagem real imediatamente. Reenvio continua reservado às consultas sem resposta; comandos de exclusão não são reenviados automaticamente.

O isolamento é reversível pelo backup e não tenta adivinhar atributos, valores ou habilidades ausentes. O reset não é condição para tentar recuperar uma ficha.

## Botão proposto: Resetar dados da mesa

Local normal: `PAINEL EXCLUSIVO DO MESTRE → Manutenção da mesa`.

Local de emergência: painel de recuperação ao lado de “Baixar backup local da mesa”. Esse botão deve funcionar mesmo se a validação das fichas ou o JSON do encontro falhar. Exibir somente após confirmar a identidade GM pelo SDK; a autorização é verificada novamente pelo controlador.

Texto da primeira confirmação: “Esta operação remove fichas, vínculos e configurações da La Arte nesta cena. Mapa, desenhos e tokens manuais ficam preservados.” Mostrar contagens de fichas, recipientes e invocações quando os dados forem legíveis; se ilegíveis, declarar que não foi possível contar.

Fluxo:

1. Ler o estado bruto sem chamar `validar`, `aplicar` nem compactar fichas. Coletar a chave da cena, autoridade e identificadores de recursos gerados.
2. Criar e oferecer para download um backup JSON com os registros brutos da cena e os metadados que serão limpos. Guardar também cópia local datada. Falha no backup bloqueia a limpeza.
3. Segunda confirmação exige digitar `RESETAR`. Cancelar em qualquer etapa não altera a mesa.
4. O controlador confirma GM, cena e identificador exclusivo da solicitação; invalida a geração atual de comandos/rolagens antes de limpar.
5. Criar um novo encontro vazio para esta cena com novo identificador e mestre atual. Gravar primeiro o novo estado, então publicar os metadados da nova sessão. Manter o encontro anterior no backup; ele deixa de ser selecionado pelo carregamento normal.
6. Limpar os recursos de cena da La Arte e fechar as interfaces transitórias. Confirmar o resultado para todos. Se a limpeza gráfica falhar, registrar as IDs restantes e permitir retomá-la sem reabrir o estado antigo.

## O que o reset deve limpar

| Dados | Tratamento |
| --- | --- |
| Fichas carregadas e isoladas | Remover do novo encontro; conservar no backup |
| Donos, vínculos a tokens, grupos importados na cena | Limpar |
| Combate, iniciativas, PvP, tempo da mesa e resoluções pendentes | Voltar ao estado inicial |
| Efeitos, concentrações, zonas persistentes e habilidades temporárias | Limpar estado e desenhos gerados |
| Invocações e tokens gerados de invocação | Remover usando IDs/metadados desta extensão |
| Baús, loot e áreas auxiliares gerados pela extensão | Remover peças geradas e seus inventários, todos incluídos no backup |
| Prop manual convertida em recipiente | Preservar a imagem manual, retirar o vínculo e sua área auxiliar |
| Lojas ativas/descontos/recompras, trocas e sessões de saque | Voltar ao padrão inicial e fechar painéis |
| Tokens manuais de personagens | Preservar imagem, posição e identidade; retirar metadados La Arte e restaurar bloqueio anterior |
| Mapa, fog, desenhos manuais e dados de outras extensões | Preservar |
| Catálogos compartilhados, sete fichas originais e grupos padrão | Preservar; disponíveis para nova importação |
| Outros encontros/cenas e backups | Preservar |

Nunca usar `localStorage.clear()` ou apagar indiscriminadamente metadados e props. Guardar a origem de cada recipiente (`gerado`/`prop_convertida`) para distinguir com segurança o que pode ser removido. Os registros legados ambíguos devem preservar a imagem e apenas retirar a configuração da extensão.

## Contrato proposto e concorrência

Comando `resetarMesa`: `pedidoId`, `cenaId`, `geracaoEsperada`, `backupId`, `confirmado: true`, `confirmacaoFinal: true`. O cliente nunca fornece uma lista arbitrária de itens a apagar. O controlador constrói essa lista a partir do estado e de metadados reconhecidos.

Uma geração de sessão identifica todas as consultas, ações e rolagens. Respostas de uma geração anterior ao reset são descartadas e não podem restaurar o estado antigo. O receptor de vistas reinicia seu controle de revisão ao trocar a geração, para aceitar o novo encontro em revisão zero.

O caminho de emergência é independente da fila de combate. Precisa cancelar pedidos pendentes e impedir que uma ação já aguardando dados grave seu estado depois do reset. Apenas redefinir o identificador da cena sem essa proteção é insuficiente.

## Critérios de aceite do reset ainda a implementar

- GM consegue resetar com ficha inválida, referência ausente e JSON ilegível; jogador não consegue chamar o comando.
- Cancelamento nas duas confirmações e falha de backup não apagam nada.
- Mapa, fog, tokens manuais e metadados de outra extensão permanecem iguais.
- Baús/loot/invocações gerados desaparecem; prop manual convertida permanece.
- Reset durante rolagem rejeita respostas antigas, não gasta recursos e não recria fichas após reload.
- Repetir o mesmo pedido não repete exclusão nem cria sucessivos encontros.
- Player conectado recebe a mesa nova; player entrando depois não recupera vínculos antigos.
- Cadastro padrão e importação das sete fichas continuam disponíveis.

## Validação da correção local

Testes reproduzem quantidade inválida e referência de habilidade ausente, conservação do original, persistência idempotente, privacidade dos registros isolados, autorização/revisão/dupla confirmação e exclusão de ficha saudável após isolamento. Simulação com duas sessões confirmou que o jogador recebe as fichas válidas enquanto sua ficha antiga inválida fica preservada exclusivamente para o mestre, com backup automático.

Sala real ainda precisa confirmar a causa exata do caso relatado. A versão 0.8.45 permanece local.

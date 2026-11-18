# 0.8.60 — atividades e execução recuperável

Publicação autorizada pelo responsável em 18/11/2026. Base: 0.8.59, commit `9e32614126bf216dd774627a85721a07c00b4cc9`. Implementa o plano consolidado aprovado e preserva a baseline congelada em 18/11/2026 antes das alterações.

## Comportamento

- Dados públicos de jogadores usam a audiência `everyone` no Dice+. Rolagens privadas do mestre conservam audiência restrita.
- Atividades da mesa funciona como gaveta de pendências e histórico. Fechada, acompanha o andamento ao vivo; a própria ação tem prioridade na ordem, com um painel de jogada por vez. A consulta manual preserva o foco e oferece Voltar ao vivo.
- Cada salvaguarda tem atividade própria, personagem/token de quem responde e vínculo à ação original. Fechar a gaveta atende respostas em fila; uma resposta necessária ao pai pode assumir o foco. O contador mostra o progresso das salvaguardas descobertas.
- GM pode retomar, assumir, registrar resultado desconhecido e cancelar. Antes dos dados, o dono pode cancelar; após os dados, solicita o cancelamento ao mestre. Continuar confirma cada resultado; os efeitos são aplicados após resolver as dependências.
- Recarga restaura pedidos e resultados registrados. Um dado em trânsito cujo resultado não foi persistido exige intervenção; não é rerrolado automaticamente. Troca de cena suspende janelas e conserva o diário na cena anterior.
- Heartbeat restaura um popover perdido sem criar outra execução. O fechamento visual não apaga uma pendência.

## Execução e transporte

Aceite durável separado da conclusão, IDs de intenção, versão de etapa, diário de rolagens, contexto determinístico de IDs/tempo e aplicação atômica do mundo com recibo. Etapas paralelas têm identidade por pedido e ocorrência. Respostas antigas, conclusões duplicadas e resultados posteriores a cancelamento são recusados.

Perícias de personagens diferentes avançam independentemente. Habilidades reservam personagens/alvos; áreas reservam os participantes; comandos gerais usam reserva de mesa. A aplicação revalida turno, controlador, ficha, recursos e posições relevantes. A fila toma sua base ao iniciar, evitando a rejeição pela revisão global de quando o comando foi enviado.

Estado público usa deltas quando compensam, fragmentação UTF-8 e confirmação de sequência/revisão por destinatário. Nova conexão sem a sequência confirmada recebe snapshot. PV ocultos são removidos dos eventos públicos antes do envio.

O mestre que preparou a cena permanece controlador. Um segundo GM encaminha comandos a ele. Web Locks evita backgrounds concorrentes na mesma origem/perfil; geração e conexão do controlador filtram eventos antigos. Não há transferência automática de estado entre aparelhos: outro navegador precisa do backup da cena, e o controlador anterior precisa estar desconectado.

Limites: 256 execuções vivas, 30 encerradas no histórico, 512 recibos terminais e marca temporal contra reenvio de intenções já expiradas. Apresentação limita rascunhos e IDs descartados a 128. Pendências vivas não são apagadas por idade. Bases de execução e índices de avaliação são liberados após uso.

## Fontes de dano e artes

Marca do Predador e Saraivada preservam identidade, valor e tipo por parcela, independentemente da ordem de seleção. O histórico distingue dano direto já incluído e dano bruto da área antes das salvaguardas, evitando a aparência de soma duplicada.

176 originais PNG foram preservados byte a byte em `conteudo/arte-originais/habilidades`. Publicação usa miniaturas WebP de 128 px, detalhe de 256 px sob demanda e PNG menor nos caminhos antigos de compatibilidade. Manifesto compacto usa hashes de conteúdo. Tokens de mapa não foram reduzidos.

## Validação e limites

A suíte existente e os testes novos, os cenários GM/P1/P2, a espera real, Zurich e os benchmarks têm evidências no relatório comparativo entregue em `outputs/fix-mesa`. SDK Owlbear e Dice+ foram simulados; não houve teste autenticado em uma sala real. Publicação autorizada após a validação local e comparação de desempenho. O comportamento real de cache, reconexão e audiência Dice+ permanece sujeito à homologação em sala.

Inventário: comandos normais de `sala.enviar` passam pelo registro, incluindo usar, testes, movimento e respostas de reação. Exclusão de ficha isolada, criação de peça/recipiente e vínculo usam o caminho direto existente, sem espera humana. A resposta automática de reação sem opção também permanece direta. As mecânicas especiais continuam cobertas pela suíte; isso não equivale a testar recarga em cada fronteira de cada habilidade especial.

O relatório registra ganhos e regressões: tamanho e tráfego caíram; persistência/controle têm custo de memória e inicialização. Amostras locais não prometem a mesma latência em todos os computadores.

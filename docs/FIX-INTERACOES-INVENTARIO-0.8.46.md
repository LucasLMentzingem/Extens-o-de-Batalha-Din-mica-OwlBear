# Arremesso, saque e troca — revisão local 0.8.46

Relato: armas arremessadas permanecem no inventário, baús/loot não abrem por Saquear e solicitações de troca não aparecem, fora de combate, tanto para mestre quanto para jogadores. Publicação atual permanece 0.8.45; estas alterações integram a 0.8.46 local.

## Problemas corrigidos

- O caminho simples de arremesso já transferia a arma, mas a composição não o fazia. Os dois caminhos agora usam a mesma transferência de uma unidade equipada ao chão, inclusive quando o ataque erra.
- Em Ágil, o laço de alternativas sobrescrevia a composição anterior ao encontrar a versão de arremesso. Agora preserva corpo a corpo e acrescenta arremesso como alternativa da segunda etapa, sem aumentar o máximo de dois ataques.
- Se a criação visual da peça falhasse no SDK após o ataque, o estado resolvido não era persistido. O controlador agora preserva o ataque concluído e o loot pendente e tenta sincronizar as peças novamente sem repetir ataque/dano. Erros anteriores à resolução do ataque continuam impedindo a gravação.
- Saque e solicitação recebida de troca dependiam do painel da ficha estar carregado para abrir sua janela. O background acompanha as sessões e abre essas janelas mesmo quando o painel está fechado. O saque também solicita a abertura da ficha no inventário.
- Abrir janelas marcava os identificadores locais antes de a API confirmar o sucesso. Os marcadores passam a ser gravados após abrir, e uma proteção curta compartilhada evita abertura concorrente pelo painel e background.
- A ficha selecionada podia impedir foco em outra ficha com saque pendente. O painel prioriza o saque controlado ativo ao receber o estado.
- O script da janela de troca usava `OBR` para fechar sem importar o SDK. A importação foi acrescentada.

## Ordem do filtro Comum

Armas equipadas na ordem atual, com variantes adjacentes; depois Saquear, Desengajar, Correr/Disparada, Ajudar, Esconder-se, Empurrar e Derrubar. O restante conserva a ordem anterior, incluindo ações assistidas ao final. Outros filtros mantêm sua ordenação.

## Verificação

Testes do motor: arremesso simples e composto em acerto/erro, conservação da unidade transferida, alternativas Ágil e ordem do Comum; a regressão da Adaga do Último Rito também passou, conservando o dano necrótico na arma correta.

Navegador sem interface, SDK e rede simulados:

- Saquear pela HUD abre a janela e transfere o loot com painel da ficha fechado.
- Jogador destinatário recebe e aceita a solicitação de troca com o painel fechado; solicitante consegue iniciar pelo inventário. A confirmação não movimenta itens antecipadamente.
- Falha injetada na primeira criação da prop após arremesso mantém arma fora da mão e loot persistido; segunda tentativa cria imagem/hitbox sem repetir o ataque.
- Configuração de baú no menu e saque de loot vazio continuam funcionando.

Os testes com SDK simulado não identificam sozinhos todas as causas da sessão real do usuário. A publicação e conferência em sala real ainda estão pendentes. Geração de artes segue pausada durante a correção.

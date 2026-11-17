# Revisão da publicação 0.8.43

## Entrega

- Ícones de habilidades em camadas no rodapé, Livro, balões, instância, modos do compositor, reações e adicionais de rolagem.
- Fundos e molduras separados para Comum, Raça e Classe. Armas conservam a arte do item; arremessos recebem um símbolo sobreposto. Texto e custos continuam dinâmicos.
- Biblioteca inicial: 16 PNGs transparentes 500 × 500 e seis SVGs. Quatro habilidades têm arte exclusiva; as demais usam a arma, o soco ou o emblema da origem. Perícias compartilham uma arte de investigação, com nome completo em texto; salvaguardas têm seis artes próprias.
- Baús e loot no chão persistentes, criação pelo mestre no centro da câmera, configuração de props existentes, slots e tranca, inventário administrativo e transferências com validação de carga.
- Troca de equipamento usa ação bônus em combate quando desalojar equipamento; equipar espaço vazio é gratuito. Saquear continua custando uma ação em combate.

## Correções da revisão

- Largar item no inventário não referencia mais a confirmação do GM antes de inicializá-la.
- Depósito parcial calcula o peso final sem contar duas vezes a pilha restante; a simulação não altera antecipadamente os equipamentos reais.
- Dividir uma pilha ao largar gera um novo ID físico para a parcela no chão.
- Uma prop não pode ganhar dois registros de recipiente.
- Sessões de saque usam o conteúdo atual e revalidam tranca, distância e visibilidade da prop ao confirmar.
- Baú vazio abre para depósito; a ficha administrativa ocupa o painel direito, inclusive em cenas sem personagens. Sua grade possui exatamente o número configurado de slots.
- Símbolo de arremesso não mistura texto com a imagem sobreposta. Nomes longos de testes quebram dentro da célula.

## Evidência

- 258 testes automatizados: combate, catálogo, sete fichas, lojas/trocas, ícones e recipientes.
- Validação do catálogo: 260 habilidades e 120 itens em duas lojas; versão e parâmetros de cache sincronizados em 0.8.43.
- Navegador headless com SDK Owlbear simulado: HUD completa de ataque/dano, PV e ação; navegação nos quatro separadores dos livros das sete fichas; administração do baú; largar item; carregamento das artes e do marcador de arremesso. Sem erros de página nos fluxos concluídos.
- Fontes PNG conferidas em 500 × 500 com canal alfa; arquivos referenciados permanecem no projeto.

## Limites e próximos passos

Não foi feita uma sessão real multiplayer no Owlbear. O SDK simulado não comprova comportamento de rede, câmera e menus em todos os clientes. A arte individual de todas as habilidades/perícias continua como expansão da biblioteca; a representação visual por origem já cobre as sete fichas.

Permanecem a comparação rica lado a lado no saque, a fila durável para falhas transitórias de sincronização de props e o isolamento por destinatário do conteúdo de sessões de saque abertas. Não tratar essas melhorias como concluídas. Também ampliar os testes de arremessos em composição e reações; os testes desta entrega cobrem o ataque simples no acerto/erro.

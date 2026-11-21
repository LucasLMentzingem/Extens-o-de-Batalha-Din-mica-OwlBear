# B — barra flutuante de buffs e debuffs

Implementada na **0.8.80**, depois da confirmação do responsável de que A e a estabilidade da 0.8.79 funcionaram. [Inventário completo, reutilização e arquitetura](INVENTARIO-EFEITOS-B.md) · [Entrega e validação](RELEASE-0.8.80.md).

- Levar a barra de efeitos para o canto inferior esquerdo, no espaço vermelho da primeira captura: entre o botão Extras do Owlbear e a barra central de ferramentas/ativos, respeitando ambos.
- Mesmo tema flutuante da nova HUD; nenhuma placa externa grande.
- Ícones dimensionados para caberem **10 efeitos em uma linha** nesse espaço. Acima de 10, scroll horizontal igual ao da grade de habilidades. Ajustar responsivamente sem cobrir ferramentas nativas.
- Levantar todos os status e efeitos configurados no sistema, incluindo condições, concentração, buffs, debuffs e variações relevantes.
- Quando houver ligação direta, reutilizar o ícone da habilidade de origem. Identificar explicitamente os efeitos sem arte reutilizável.
- Listar todas as novas artes necessárias. Criar bordas e fundos distintos por tipo: buff, debuff e variações de efeitos; manter a linguagem visual e a composição em camadas já usadas no sistema.
- A pedido do responsável, fornecer esse inventário e as referências a um subagente **GPT 6 Luna** para produzir as artes pendentes, quando a etapa B começar.
- Seguir a otimização existente: ícones pequenos, arquivos WebP, camadas compartilhadas quando possível e ausência de imagens grandes nos pacotes de estado.

Resultado: inventário das 14 condições e dos efeitos configurados, artes de origem reutilizadas, 25 ícones inéditos produzidos com GPT 6 Luna, cinco fundos/cinco molduras nativos, nova posição e scroll. A e os mecanismos de estabilidade foram mantidos e testados novamente.

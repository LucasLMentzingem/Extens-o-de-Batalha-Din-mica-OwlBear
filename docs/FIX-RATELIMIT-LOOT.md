# Revisão de arremesso, loot e RateLimitHit

Data: 17/11/2026. Continuação da issue #76, após reprodução pelo usuário na 0.8.47.

## Causa identificada

O reconciliador antigo percorria todos os recipientes e chamava updateItems repetidamente para cada imagem e área de seleção, mesmo sem alterações. Cada ação, inclusive equipar, disparava essa rotina. Com vários loots acumulados, isso multiplicava chamadas e podia esgotar o limite do Owlbear. As retentativas então repetiam a mesma carga.

## Correções

- Novo módulo loot-sync.mjs: uma leitura da cena por sincronização; adições, alterações e exclusões em lotes; nenhuma gravação para peças que já estão corretas. Imagem e proxy continuam juntos, com chão em ATTACHMENT e baú em PROP. Movimento do proxy continua atualizando a posição lógica sem regravar a cena.
- Após RateLimitHit, aguardar 15 segundos e aplicar espera progressiva até 60 segundos. Uma única fila de recuperação e avisos limitados a um por minuto; comandos respeitam a pausa. Os dados salvos não são descartados.
- Mão fraca não mostra simultaneamente o ataque normal e o extra: alterna a opção exibida quando os requisitos do extra estiverem presentes. Azagaia e outras armas sem Leve não recebem o ataque adicional dessa propriedade. Ágil mantém o extra dentro do compositor.
- Pegar e equipar conclui a transferência imediatamente na mão escolhida e fecha a janela ao receber o estado confirmado. Erros de capacidade/custo mantêm a janela aberta e mostram a causa.

## Evidência

285 testes automatizados passaram. Os três testes novos do reconciliador cobrem:

1. 1.000 recipientes (2.000 peças) criados em uma chamada de adição; 50 sincronizações estáveis sem nenhuma gravação; renomear todos usa uma atualização em lote; remover todos usa uma exclusão em lote.
2. Erro simulado RateLimitHit preserva estado e a recuperação não duplica peças.
3. Peça parcial é reconstruída; mover o proxy preserva a posição lógica sem gravações redundantes.

Regressões adicionais verificam alternância normal/extra, azagaia na mão fraca, saque e equipar uma unidade de pilha. Testes headless confirmaram saque/equipar imediato e erro SDK no formato aninhado RateLimitHit seguido de recuperação, sem repetir ataque nem restaurar arma. Os testes headless usam SDK simulado; não medem limites ou desempenho reais dos servidores do Owlbear. Ainda requer verificação na sala real com vários usuários.

Código preparado para o próximo pacote; não altera o manifesto publicado nesta etapa.

# 0.8.57 — excluir fichas antigas dos grupos importados

- Na mesma lista que oferece Adicionar unidade, o mestre agora pode **Excluir ficha** de um grupo importado. O cabeçalho também oferece **Excluir grupo**.
- A confirmação informa o que será removido da biblioteca. Unidades já adicionadas à cena, tokens, inventário e arquivos JSON originais são preservados. Excluir o último modelo também remove o grupo vazio.
- Comandos são exclusivos do mestre, exigem confirmação e revisão atual do estado; índice e identidade da ficha são conferidos antes de remover. A exclusão persiste ao salvar/reabrir a mesa. Grupos fornecidos com a extensão permanecem como bibliotecas originais.
- Seis regressões novas cobrem persistência, cancelamento por falta de confirmação, autorização, concorrência, modelos com IDs repetidos e preservação de unidades/ordem de combate. Suíte completa: **390 testes**.
- Ensaio de navegador com SDK simulado: cancelar/confirmar exclusão individual, excluir grupo preservando a unidade e, em seguida, usar Animar Mortos pela HUD nessa unidade e avançar **1 Min** pelo controle do mestre. Verificados: mesma peça e posição, imagem trocada para Zumbigoblin, ficha sobreposta com 15 PV/CA 8, original resguardada, loot inalterado e apenas um espaço consumido. Captura visual e registro JSON entregues ao usuário; não houve acesso a uma sala real do Owlbear.
- Preservados os protótipos do drow/padre, defesas autorais dos zumbis, Sopro de Dragão e decisões das adagas da 0.8.56.

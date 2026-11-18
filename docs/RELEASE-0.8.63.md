# Versão 0.8.63 — recursos legíveis e atividades acima do rodapé

Removidas as faixas escuras atrás dos nomes e saldos dos recursos. Os ícones já eram quadrados; as duas faixas deixavam apenas 1 px livre entre os textos, causando a aparência de imagem achatada. A sombra das letras conserva o contraste e a imagem fica descoberta.

Os indicadores de custo nas instâncias de habilidades usam a mesma arte, moldura, nome curto e saldo da barra de combate, no cabeçalho e junto ao botão Executar. Quantidade exigida e saldo completo continuam na dica e na descrição acessível. Sem custo conserva seu indicador próprio. Aa sincroniza os nomes entre as janelas da mesma conexão e sempre conserva os saldos.

Atividades da mesa, tanto botão quanto gaveta aberta, fica acima do topo do rodapé, com 10 px de separação. A gaveta continua centralizada horizontalmente; altura e posição acompanham o viewport, as linhas e a compactação do rodapé. Em telas baixas, a gaveta pode rolar sem invadir o rodapé.

As 37 imagens WebP otimizadas da 0.8.62 são reutilizadas, sem novas imagens ou aumento do pacote de artes. Regras mecânicas e dados do catálogo preservados.

Validação: 426 testes de regras/protocolo; testes em navegador com SDK simulado para 12 combinações (1440×1000 e 900×600, linhas 1/3/5, compacto/expandido), cada uma conferindo botão e gaveta acima do rodapé. Astúcia Mágica no cabeçalho/execução, imagens quadradas, Aa sincronizado e saldo preservado, sem erros de página. Capturas revisadas e cliente Playwright da skill executado. Versão e catálogo verificados antes de publicar. Sem homologação autenticada em sala real.

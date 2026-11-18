# Versão 0.8.62 — artes dos recursos

Os quadrados de recursos usam ícone ao fundo com título curto no topo e saldo maior na parte inferior. Aa alterna os títulos; saldo permanece visível e legível, inclusive zerado. As imagens não capturam cliques. Filtros, dicas e compactação da HUD preservados.

A moldura e o fundo universais são camadas compartilhadas. O registro contém 35 ícones (30 IDs de fichas, Ação/Bônus/Reação/Truques e Última Palavra) e as duas camadas comuns. Oito ícones usam artes existentes de habilidades ou item. Espaços de magia foram refeitos sem moldura/fundo embutidos. A reserva Última Palavra reconhece o ID da instância do item; recursos futuros sem arte usam o ícone genérico.

Produção: 37 WebP de 100×100, 168.080 bytes (~164 KiB). Redução de 93,51% sobre as fontes de 2.589.296 bytes usadas na conversão. Originais preservados em conteudo/arte-originais/recursos, fora de site. Cada arquivo possui hash de conteúdo para cache; a HUD referencia apenas artes dos recursos presentes, reutilizando fundo/moldura. Nenhuma imagem é enviada no estado/broadcast da mesa. Os números medem arquivos, sem novo benchmark de FPS ou latência.

Para regenerar: instalar sharp no ambiente de desenvolvimento e executar node gerar-artes-recursos.mjs; SHARP_MODULE permite apontar para uma instalação existente. O conversor atualiza assets/recursos e catalogos/artes-recursos.mjs.

Validação em navegador com SDK simulado: carregamento das imagens em 100 px, Aa, saldo persistente, seleção de filtro, compactar/expandir e cobertura dos recursos das fichas. Capturas revisadas. Verificação adicional do ID de Última Palavra e de versão/catálogo. Suíte completa executada antes da publicação e pelo workflow. Regras mecânicas e conteúdos anteriores não foram alterados.

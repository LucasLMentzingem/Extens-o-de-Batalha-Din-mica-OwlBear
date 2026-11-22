# Versão 0.8.84 — fechar Dados de Vida e ocultar zero pendentes

O painel de Dados de Vida passa a ter um botão **Fechar**. Fechar conserva as escolhas pendentes, sem gastar recursos nem dispensar o personagem.

Quando não há mais pendências para o usuário, a janela e o indicador recolhido desaparecem. Não são recriados por atualização da mesa, Restaurar janelas ou F5. O mestre acompanha as pendências da mesa; cada jogador acompanha seus personagens. Um descanso sem PJs elegíveis não abre nenhum desses elementos.

O histórico continua em Atividades da mesa. O mestre pode usar **Reabrir escolha** no registro elegível para criar uma nova participação no mesmo descanso, sem recarregar recursos novamente.

Validação: oito cenários headless de fechamento, indicador, conclusão, dispensa, F5, atualizações, reabertura e descanso sem elegíveis; suíte de 558 testes Node. Publicação autorizada em 22/11/2026.

Manifesto normal: https://lucaslmentzingem.github.io/Extens-o-de-Batalha-Din-mica-OwlBear/manifest.json

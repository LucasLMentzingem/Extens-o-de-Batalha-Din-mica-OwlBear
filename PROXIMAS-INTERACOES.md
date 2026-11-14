# Próximas interações

## Parte A — rodapé e áreas originadas no personagem

- Criar o filtro **Truques** antes de **Magias** na classificação da grade do rodapé.
- Implementar um módulo genérico de cone ancorado no personagem:
  - origem no centro do token do conjurador;
  - direção definida pelo ponteiro;
  - distância e ângulo declarados pela habilidade;
  - primeiro clique trava a direção e libera o ponteiro para confirmar/executar;
  - clicar novamente no cone destrava a direção;
  - o próprio conjurador não pode ser alvo;
  - confirmação de área e alvos segue o fluxo das demais magias de área.
- Conferir no livro de regras os ângulos e comprimentos aplicáveis a cones.
- Revisar as sete fichas e migrar todas as magias e habilidades em cone ou em área originada no personagem para os novos módulos.

## Parte B — ataques de oportunidade na trajetória

- Detectar a entrada e a posterior saída do alcance corpo a corpo em qualquer trecho do movimento, mesmo quando o personagem começa fora do alcance.
- Encontrar todas as interseções da trajetória com alcances hostis.
- Permitir vários ataques de oportunidade no mesmo deslocamento, um por inimigo elegível e respeitando a reação disponível de cada um.
- Mostrar previamente as setas e os pontos da trajetória em que cada reação pode ocorrer.
- Preservar as regras já implementadas de Desengajar, reação gasta e interrupção do movimento no ponto de um acerto.

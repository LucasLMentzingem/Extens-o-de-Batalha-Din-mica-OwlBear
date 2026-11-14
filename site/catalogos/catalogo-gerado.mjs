// Gerado por gerar-catalogo-runtime.mjs. Não edite manualmente.
export default {
  "versaoCatalogo": 1,
  "habilidades": [
    {
      "id": "habilidade.1-armadura-arcana-defesa-classe",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Armadura Arcana · defesa · classe",
        "categoria": "magia",
        "descricao": "Ação · Toque · 8 h. Criatura voluntária sem armadura recebe CA 13 + DES. Em Nikki, CA 15. Ao conjurar, marque o gasto e a hora de término.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-1"
          }
        ],
        "circuloBase": 1,
        "origem": "feiticeiro",
        "foraCombate": true,
        "automacao": {
          "tipo": "efeito",
          "alcanceM": 1.5,
          "efeito": {
            "nome": "Armadura Arcana",
            "tipo": "buff",
            "descricao": "A CA do alvo passa a ser no mínimo 13 + DES enquanto ele estiver sem armadura.",
            "removeEm": "descanso_longo",
            "caMinima": 13,
            "requisitos": {
              "semArmadura": true
            },
            "modificadores": {}
          }
        }
      }
    },
    {
      "id": "habilidade.1-bracos-de-hadar-salva-de-for-aberrante",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Braços de Hadar · salva de FOR · aberrante",
        "categoria": "magia",
        "descricao": "Ação · Emanação de 3 m · Cada alvo rola FOR, CD 13 (14 com Inata). Falha: dano necrótico e perde reações até o início do próximo turno dele. Sucesso: metade do dano.\n1º [2d6] · 2º [3d6]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-1"
          }
        ],
        "circuloBase": 1,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "salva",
          "atributo": "for",
          "cd": 13,
          "dano": "2d6",
          "alcanceM": 0,
          "raioM": 3,
          "origemArea": "conjurador",
          "excluirConjurador": true,
          "metade": true,
          "elemento": "necrotico",
          "efeitoFalha": {
            "nome": "Sem reações",
            "turnos": 1,
            "consomeReacao": true
          }
        }
      }
    },
    {
      "id": "habilidade.1-compreender-idiomas",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Compreender Idiomas",
        "categoria": "magia",
        "descricao": "Ritual · 10 minutos adicionais · pessoal · 1 h. Compreenda o sentido literal de idiomas falados e, por toque, escritos. Não gasta Espaço de Magia de Pacto.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 1
      }
    },
    {
      "id": "habilidade.1-curar-ferimentos",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Curar Ferimentos",
        "categoria": "magia",
        "descricao": "Ação; toque; V,S; instantânea. Cura [2d8+2] PV. Gasta 1 espaço de 1º círculo. Nesta conversão pertence às magias preparadas da classe, conforme o texto recebido.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "automacao": {
          "tipo": "cura",
          "formula": "2d8+2",
          "alcanceM": 1.5
        }
      }
    },
    {
      "id": "habilidade.1-curar-ferimentos-77c1a63d",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Curar Ferimentos",
        "categoria": "magia",
        "descricao": "Ação, toque: cura [2d8+3] PV. +2d8 por círculo acima.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "automacao": {
          "tipo": "cura",
          "formula": "2d8+3",
          "alcanceM": 1.5
        }
      }
    },
    {
      "id": "habilidade.1-curar-ferimentos-bb7ae130",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Curar Ferimentos",
        "categoria": "magia",
        "descricao": "Ação, toque: cura [2d8+2] PV. +2d8 por círculo acima.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "automacao": {
          "tipo": "cura",
          "formula": "2d8+2",
          "alcanceM": 1.5
        }
      }
    },
    {
      "id": "habilidade.1-detectar-magia-ritual-concentracao",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Detectar Magia · Ritual, Concentração",
        "categoria": "magia",
        "descricao": "Ação ou ritual, 10 min: sente magia a até 9 m e vê a aura e a escola.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "concentracao": true
      }
    },
    {
      "id": "habilidade.1-detectar-magia-ritual-concentracao-classe",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Detectar Magia · ritual · concentração · classe",
        "categoria": "magia",
        "descricao": "Ação · Pessoal · Concentração até 10 min · Detecta magia em 9 m. Como ritual, acrescente 10 min à conjuração e preserve o espaço.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-1"
          }
        ],
        "circuloBase": 1,
        "origem": "feiticeiro",
        "concentracao": true
      }
    },
    {
      "id": "habilidade.1-disfarcar-se",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Disfarçar-se",
        "categoria": "magia",
        "descricao": "Ação · pessoal · 1 h. Pela Máscara de Muitas Faces, conjure à vontade sem espaço. Muda rosto, corpo e roupas; quem tocar sente o corpo real e a voz não muda. Teste de Investigação contra CD 13 revela a ilusão. Silenciosa.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 1
      }
    },
    {
      "id": "habilidade.1-emaranhar-concentracao",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Emaranhar · Concentração",
        "categoria": "magia",
        "descricao": "Ação, 27 m, quadrado de 6 m de terreno difícil por 1 min. Criaturas na área: salvaguarda de FOR CD 12 ou ficam Contidas (ataques contra elas com Vantagem). Uma ação e teste de FOR (Atletismo) CD 12 para se soltar.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "automacao": {
          "tipo": "salva",
          "atributo": "for",
          "cd": 12,
          "alcanceM": 18,
          "area": {
            "forma": "quadrado",
            "tamanhoM": 6
          },
          "efeitoFalha": {
            "nome": "Contido por Emaranhar",
            "condicao": "contido",
            "turnos": 10
          }
        },
        "concentracao": true
      }
    },
    {
      "id": "habilidade.1-encontrar-familiar",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Encontrar Familiar",
        "categoria": "magia",
        "descricao": "Ritual · 1 h + 10 min · 3 m. Consome componentes de 10 PO, mas não gasta Espaço de Magia de Pacto. Invoca familiar. Ação bônus para usar os sentidos dele.",
        "custo": [],
        "circuloBase": 1,
        "requisitosUso": {
          "somenteForaCombate": true
        }
      }
    },
    {
      "id": "habilidade.1-enfeiticar-pessoa",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Enfeitiçar Pessoa",
        "categoria": "magia",
        "descricao": "Ação · 9 m, salvaguarda de SAB CD 13, até 2 alvos (2º círculo), 1 hora, sem concentração; o alvo sabe que foi enfeitiçado quando acaba; silenciosa.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-2",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "automacao": {
          "tipo": "salva",
          "atributo": "sab",
          "cd": 13,
          "alcanceM": 9,
          "efeitoFalha": {
            "nome": "Enfeitiçado",
            "condicao": "enfeiticado",
            "turnos": 100
          }
        },
        "selecao": {
          "tipo": "alvos",
          "min": 1,
          "max": 2,
          "repetirAlvo": false,
          "alcanceM": 9
        },
        "escalaAplicada": 2
      }
    },
    {
      "id": "habilidade.1-enfeiticar-pessoa-glamour-sempre",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Enfeitiçar Pessoa · Glamour, sempre",
        "categoria": "magia",
        "descricao": "Ação, 9 m, 1 h. Humanoide faz salvaguarda de SAB CD 13 (com Vantagem se você ou aliados lutam com ele) ou fica Enfeitiçado e amigável. Sabe que foi enfeitiçado quando acaba. +1 alvo por círculo acima. Encantamento: ativa a Magia Fascinante.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "automacao": {
          "tipo": "salva",
          "atributo": "sab",
          "cd": 13,
          "alcanceM": 9,
          "efeitoFalha": {
            "nome": "Enfeitiçado",
            "condicao": "enfeiticado",
            "turnos": 100
          }
        }
      }
    },
    {
      "id": "habilidade.1-escudo-da-fe",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Escudo da Fé",
        "categoria": "magia",
        "descricao": "Magia informada como Iniciado em Magia. ação bônus; 18 m; V,S,M (pergaminho de oração); concentração até 10 minutos. Alvo recebe +2 CA. Confirmar origem e recursos antes de usar.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "concentracao": true,
        "automacao": {
          "tipo": "efeito",
          "alcanceM": 18,
          "efeito": {
            "nome": "Escudo da Fé",
            "tipo": "buff",
            "descricao": "+2 na Classe de Armadura.",
            "modificadores": {
              "ca": 2
            },
            "duracao": {
              "turnos": 100,
              "expira": "inicio_origem"
            }
          }
        }
      }
    },
    {
      "id": "habilidade.1-falar-com-animais-ritual",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Falar com Animais · Ritual",
        "categoria": "magia",
        "descricao": "Ação ou ritual, 10 min: entende e conversa com feras.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1
      }
    },
    {
      "id": "habilidade.1-falar-com-animais-ritual-ad0805c7",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Falar com Animais · Ritual",
        "categoria": "magia",
        "descricao": "Ação ou ritual (+10 min), 10 min: entende e conversa com feras. Informações sobre a área, perigos e o que viram recentemente.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1
      }
    },
    {
      "id": "habilidade.1-fogo-das-fadas-concentracao",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Fogo das Fadas · Concentração",
        "categoria": "magia",
        "descricao": "Ação, 18 m, cubo de 6 m, até 1 min. Salvaguarda de DES CD 13: quem falhar emite luz, não pode ficar Invisível, e jogadas de ataque contra ele têm Vantagem.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "automacao": {
          "tipo": "salva",
          "atributo": "des",
          "cd": 13,
          "alcanceM": 18,
          "area": {
            "forma": "quadrado",
            "tamanhoM": 6
          },
          "efeitoFalha": {
            "nome": "Iluminado por Fogo das Fadas",
            "turnos": 10,
            "restricoes": {
              "vantagemAtaquesContra": true,
              "anulaInvisivel": true
            }
          }
        },
        "concentracao": true
      }
    },
    {
      "id": "habilidade.1-golpe-constritor",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Golpe Constritor",
        "categoria": "magia",
        "descricao": "Ação bônus imediatamente após acertar com arma; V; concentração até 1 minuto. Alvo faz resistência de FOR CD 12, com vantagem se Grande ou maior. Falha: Contido; sofre [1d6] perfurante no início dos turnos. Alvo ou criatura ao alcance pode usar ação e teste de Atletismo CD 12 para encerrar. Gasta 1 espaço.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "concentracao": true,
        "automacao": {
          "tipo": "salva",
          "atributo": "for",
          "cd": 12,
          "alcanceM": 18,
          "efeitoFalha": {
            "nome": "Contido (Golpe Constritor)",
            "condicao": "contido",
            "turnos": 10,
            "danoInicioTurno": {
              "formula": "1d6",
              "elemento": "perfurante"
            }
          }
        },
        "requisitosUso": {
          "aposAcerto": true,
          "tagsAtaqueAnterior": [
            "arma"
          ],
          "alvoIgualAoAnterior": true
        }
      }
    },
    {
      "id": "habilidade.1-marca-do-predador",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Marca do Predador",
        "categoria": "magia",
        "descricao": "Ação bônus; 27 m; V; concentração até 1 hora. Ataques que acertem o alvo marcado causam +[1d6] energético (Force). Vantagem em Percepção e Sobrevivência para encontrá-lo. Após cair a 0 PV, pode transferir a marca com ação bônus em turno posterior. Sempre preparada; 2 conjurações gratuitas por descanso longo ou gasto de espaço.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "usoGratuito": {
          "recursoId": "marca-do-predador",
          "quantidade": 1,
          "nome": "Conjuração gratuita de Marca do Predador"
        },
        "circuloBase": 1,
        "concentracao": true,
        "automacao": {
          "tipo": "efeito",
          "alcanceM": 18,
          "efeito": {
            "nome": "Marca do Predador",
            "tipo": "debuff",
            "descricao": "A origem causa 1d6 energético adicional ao acertar este alvo com arma.",
            "danoAoSerAtingido": {
              "formula": "1d6",
              "elemento": "energetico",
              "tagsAtaque": [
                "arma"
              ]
            }
          }
        }
      }
    },
    {
      "id": "habilidade.1-marca-do-predador-sempre-concentracao",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Marca do Predador · sempre, Concentração",
        "categoria": "magia",
        "descricao": "Ação Bônus, 27 m, até 1 h: +[1d6] energético por acerto no alvo. Se o alvo cair, pode mudar a marca para outro com Ação Bônus. 2x grátis por descanso longo.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "usoGratuito": {
          "recursoId": "marca-do-predador",
          "quantidade": 1,
          "nome": "Conjuração gratuita de Marca do Predador"
        },
        "circuloBase": 1,
        "concentracao": true,
        "automacao": {
          "tipo": "efeito",
          "alcanceM": 18,
          "efeito": {
            "nome": "Marca do Predador",
            "tipo": "debuff",
            "descricao": "A origem causa 1d6 energético adicional ao acertar este alvo com arma.",
            "danoAoSerAtingido": {
              "formula": "1d6",
              "elemento": "energetico",
              "tagsAtaque": [
                "arma"
              ]
            }
          }
        }
      }
    },
    {
      "id": "habilidade.1-misseis-magicos-acerto-automatico-classe",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Mísseis Mágicos · acerto automático · classe",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Distribua 3 dardos entre criaturas visíveis. Dano por dardo [1d4+1] energético. Com espaço de 2º, distribua 4 dardos.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-1"
          }
        ],
        "circuloBase": 1,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "projeteis",
          "alcanceM": 18,
          "dano": "1d4+1",
          "elemento": "energetico"
        },
        "selecao": {
          "tipo": "alvos",
          "min": 3,
          "max": 3,
          "repetirAlvo": true
        }
      }
    },
    {
      "id": "habilidade.1-palavra-curativa",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Palavra Curativa",
        "categoria": "magia",
        "descricao": "Ação Bônus, 18 m: cura [2d4+3] PV. +2d4 por círculo acima.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "automacao": {
          "tipo": "cura",
          "formula": "2d4+3",
          "alcanceM": 18
        }
      }
    },
    {
      "id": "habilidade.1-palavra-curativa-iniciado",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Palavra Curativa · Iniciado",
        "categoria": "magia",
        "descricao": "Ação Bônus, 18 m: cura [2d4+2] PV. 1x grátis por descanso longo; depois com espaço de magia. +2d4 por círculo acima.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "usoGratuito": {
          "recursoId": "palavra-curativa-do-talento",
          "quantidade": 1,
          "nome": "Conjuração gratuita do talento"
        },
        "circuloBase": 1,
        "automacao": {
          "tipo": "cura",
          "formula": "2d4+2",
          "alcanceM": 18
        }
      }
    },
    {
      "id": "habilidade.1-passos-largos-elfo",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Passos Largos · Elfo",
        "categoria": "magia",
        "descricao": "Ação, toque, 1 h: +3 m de Deslocamento. 1x grátis por descanso longo.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "usoGratuito": {
          "recursoId": "passos-largos-da-linhagem",
          "quantidade": 1,
          "nome": "Conjuração gratuita da linhagem"
        },
        "circuloBase": 1,
        "automacao": {
          "tipo": "efeito",
          "alcanceM": 1.5,
          "efeito": {
            "nome": "Passos Largos",
            "tipo": "buff",
            "descricao": "+3 m de deslocamento.",
            "modificadores": {
              "deslocamentoM": 3
            },
            "removeEm": "descanso_longo"
          }
        }
      }
    },
    {
      "id": "habilidade.1-passos-largos-elfo-0cb98763",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Passos Largos · Elfo",
        "categoria": "magia",
        "descricao": "Ação, toque, 1 h: +3 m de Deslocamento. 1x grátis por descanso longo; também na lista do Guardião.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "usoGratuito": {
          "recursoId": "passos-largos-da-linhagem",
          "quantidade": 1,
          "nome": "Conjuração gratuita da linhagem"
        },
        "circuloBase": 1,
        "automacao": {
          "tipo": "efeito",
          "alcanceM": 1.5,
          "efeito": {
            "nome": "Passos Largos",
            "tipo": "buff",
            "descricao": "+3 m de deslocamento.",
            "modificadores": {
              "deslocamentoM": 3
            },
            "removeEm": "descanso_longo"
          }
        }
      }
    },
    {
      "id": "habilidade.1-queda-suave-reacao-classe",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Queda Suave · reação · classe",
        "categoria": "magia",
        "descricao": "Quando você ou uma criatura a até 18 m cai, escolha até 5 criaturas em queda nesse alcance. Por até 1 min, descem 18 m por rodada e, se pousarem antes do fim, aterrissam sem dano de queda.",
        "custo": [
          {
            "tipo": "reacao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-1"
          }
        ],
        "circuloBase": 1,
        "origem": "feiticeiro"
      }
    },
    {
      "id": "habilidade.1-repreensao-diabolica-reacao-salva-de-des-infernal",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Repreensão Diabólica · reação · salva de DES · infernal",
        "categoria": "magia",
        "descricao": "Ao sofrer dano de uma criatura visível a até 18 m, ela rola DES, CD 13. Falha: dano ígneo. Sucesso: metade. Um uso gratuito de 1º por descanso longo ou gaste espaço.\n1º [2d10] · 2º [3d10]",
        "custo": [
          {
            "tipo": "reacao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-1"
          }
        ],
        "usoGratuito": {
          "recursoId": "repreensao",
          "quantidade": 1,
          "nome": "Repreensão gratuita da linhagem infernal"
        },
        "circuloBase": 1,
        "origem": "infernal",
        "gatilho": "sofrer_dano",
        "automacao": {
          "tipo": "salva",
          "atributo": "des",
          "cd": 13,
          "dano": "2d10",
          "metade": true,
          "elemento": "fogo",
          "alcanceM": 18
        }
      }
    },
    {
      "id": "habilidade.1-riso-histerico-de-tasha",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Riso Histérico de Tasha",
        "categoria": "magia",
        "descricao": "Ação · 9 m · concentração até 1 min. Com espaço de Pacto de 2º círculo, até 2 alvos rolam SAB CD 13. Na falha, ficam caídos e incapacitados, rindo. Repetem a salvaguarda ao fim de cada turno e ao sofrer dano (com vantagem nesse último caso).",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-2",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "concentracao": true,
        "automacao": {
          "tipo": "salva",
          "atributo": "sab",
          "cd": 13,
          "alcanceM": 9,
          "efeitoFalha": {
            "nome": "Rindo no chão",
            "turnos": 10,
            "restricoes": {
              "semAcoes": true,
              "semBonus": true,
              "caido": true
            },
            "salvaRepetida": {
              "atributo": "sab",
              "quando": "fim_turno",
              "aoSofrerDano": true
            }
          }
        },
        "selecao": {
          "tipo": "alvos",
          "min": 1,
          "max": 2,
          "repetirAlvo": false,
          "alcanceM": 9
        },
        "escalaAplicada": 2
      }
    },
    {
      "id": "habilidade.1-saraivada-de-espinhos",
      "revisao": 2,
      "definicao": {
        "nome": "1º | Saraivada de Espinhos",
        "categoria": "magia",
        "descricao": "Ação Bônus logo após acertar com arma à distância: alvo e criaturas a 1,5 m dele fazem salvaguarda de DES CD 12; [1d10] perfurante, metade se passar. +1d10 por círculo acima.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "gatilho": "apos_acerto",
        "aprimoramento": {
          "dano": "1d10",
          "elemento": "perfurante",
          "critico": false,
          "requisitos": {
            "tagsAtaque": [
              "arma",
              "distancia"
            ]
          },
          "salvaArea": {
            "atributo": "des",
            "cd": 12,
            "raioM": 1.5,
            "metade": true
          }
        }
      }
    },
    {
      "id": "habilidade.1-sussurros-dissonantes",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Sussurros Dissonantes",
        "categoria": "magia",
        "descricao": "Ação · 18 m · espaço de Pacto de 2º círculo. O alvo rola SAB CD 13. Falha: [4d6] psíquico e usa a reação disponível para se afastar pela rota mais segura. Sucesso: metade do dano.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-2",
            "quantidade": 1
          }
        ],
        "circuloBase": 1,
        "automacao": {
          "tipo": "salva",
          "atributo": "sab",
          "cd": 13,
          "dano": "4d6",
          "alcanceM": 18,
          "metade": true,
          "elemento": "psiquico",
          "efeitoFalha": {
            "nome": "Fuga Dissonante",
            "turnos": 1,
            "consomeReacao": true
          }
        },
        "escalaAplicada": 2
      }
    },
    {
      "id": "habilidade.1-sussurros-dissonantes-salva-de-sab-aberrante",
      "revisao": 1,
      "definicao": {
        "nome": "1º | Sussurros Dissonantes · salva de SAB · aberrante",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Alvo rola SAB, CD 13 (14 com Inata). Falha: dano psíquico e usa a reação disponível para se afastar pela rota mais segura. Sucesso: metade do dano.\n1º [3d6] · 2º [4d6]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-1"
          }
        ],
        "circuloBase": 1,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "salva",
          "atributo": "sab",
          "cd": 13,
          "dano": "3d6",
          "alcanceM": 18,
          "metade": true,
          "elemento": "psiquico",
          "efeitoFalha": {
            "nome": "Fuga Dissonante",
            "turnos": 1,
            "consomeReacao": true
          }
        }
      }
    },
    {
      "id": "habilidade.2-acalmar-emocoes-salva-de-car-concentracao-aberrante",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Acalmar Emoções · salva de CAR · concentração · aberrante",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Esfera de 6 m de raio · Concentração até 1 min. Cada humanoide na área rola CAR, CD 13 (14 com Inata). Na falha, escolha por alvo: imunidade a enfeitiçado e amedrontado (suprime essas condições existentes), ou indiferença diante de criaturas que ele hostiliza. A indiferença termina se ele sofrer dano ou vir aliados sofrerem dano.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-2"
          }
        ],
        "circuloBase": 2,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "salva",
          "atributo": "car",
          "cd": 13,
          "alcanceM": 18,
          "raioM": 6,
          "efeitoFalha": {
            "nome": "Emoções acalmadas",
            "turnos": 10
          }
        },
        "concentracao": true
      }
    },
    {
      "id": "habilidade.2-arrombar",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Arrombar",
        "categoria": "magia",
        "descricao": "Ação, 18 m: abre uma fechadura, tranca, cadeado ou corrente (ou suprime Tranca Arcana por 10 min). Faz um barulho alto ouvido a até 90 m.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-2",
            "quantidade": 1
          }
        ],
        "circuloBase": 2
      }
    },
    {
      "id": "habilidade.2-despedacar-salva-de-con-classe",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Despedaçar · salva de CON · classe",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Esfera de 3 m de raio. Cada alvo rola CON, CD 13 (14 com Inata). Constructos rolam com desvantagem. Dano [3d8] trovejante, metade no sucesso.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-2"
          }
        ],
        "circuloBase": 2,
        "automacao": {
          "tipo": "salva",
          "atributo": "con",
          "cd": 13,
          "dano": "3d8",
          "alcanceM": 18,
          "raioM": 3,
          "metade": true,
          "elemento": "trovejante"
        },
        "origem": "feiticeiro"
      }
    },
    {
      "id": "habilidade.2-detectar-pensamentos",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Detectar Pensamentos",
        "categoria": "magia",
        "descricao": "Ação · pessoal · concentração até 1 min. Detecte pensamentos em 9 m ou leia os superficiais. Em turno posterior, use Usar Magia para sondar mais fundo. O alvo faz salvaguarda de SAB CD 13 e percebe a sondagem. No sucesso, a magia termina.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-2",
            "quantidade": 1
          }
        ],
        "circuloBase": 2,
        "concentracao": true
      }
    },
    {
      "id": "habilidade.2-detectar-pensamentos-sondagem-concentracao-aberrante",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Detectar Pensamentos · sondagem · concentração · aberrante",
        "categoria": "magia",
        "descricao": "Ação · Pessoal · Concentração até 1 min. Detecte pensamentos em 9 m ou leia pensamentos superficiais. Para sondar mais fundo, use a ação Usar Magia em turno posterior. O alvo rola SAB, CD 13 (14 com Inata). No sucesso, a magia termina. Ao ser sondado, o alvo percebe a intrusão.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-2"
          }
        ],
        "circuloBase": 2,
        "origem": "feiticeiro",
        "concentracao": true
      }
    },
    {
      "id": "habilidade.2-forca-fantasmagorica",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Força Fantasmagórica",
        "categoria": "magia",
        "descricao": "Ação · 18 m, salvaguarda de INT CD 13, ilusão que o alvo acredita ser real, concentração; silenciosa. Até 1 min. Quando a ilusão pode logicamente ferir o alvo, pode causar [2d8] psíquico por turno.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-2",
            "quantidade": 1
          }
        ],
        "circuloBase": 2,
        "concentracao": true
      }
    },
    {
      "id": "habilidade.2-imobilizar-pessoa",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Imobilizar Pessoa",
        "categoria": "magia",
        "descricao": "Ação · 18 m, salvaguarda de SAB CD 13, paralisa um humanoide, concentração 1 min (repete a salvaguarda a cada turno); silenciosa.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-2",
            "quantidade": 1
          }
        ],
        "circuloBase": 2,
        "concentracao": true,
        "automacao": {
          "tipo": "salva",
          "atributo": "sab",
          "cd": 13,
          "alcanceM": 18,
          "efeitoFalha": {
            "nome": "Paralisado",
            "condicao": "paralisado",
            "turnos": 10,
            "salvaRepetida": {
              "atributo": "sab",
              "quando": "fim_turno"
            }
          }
        }
      }
    },
    {
      "id": "habilidade.2-invisibilidade",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Invisibilidade",
        "categoria": "magia",
        "descricao": "Ação · toque, concentração até 1 h, acaba ao atacar, causar dano ou conjurar; silenciosa.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-2",
            "quantidade": 1
          }
        ],
        "circuloBase": 2,
        "concentracao": true,
        "automacao": {
          "tipo": "efeito",
          "alcanceM": 1.5,
          "efeito": {
            "nome": "Invisível",
            "tipo": "condicao",
            "condicao": "invisivel",
            "descricao": "Invisível até atacar, causar dano ou conjurar.",
            "duracao": {
              "turnos": 100,
              "expira": "inicio_origem"
            },
            "encerraAoAgir": true
          }
        }
      }
    },
    {
      "id": "habilidade.2-reflexos-glamour-sempre",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Reflexos · Glamour, sempre",
        "categoria": "magia",
        "descricao": "Ação, 1 min, sem Concentração: 3 cópias ilusórias suas. Quando um ataque o atingiria, ele pode atingir uma das cópias, que some. Ilusão: ativa a Magia Fascinante.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-2",
            "quantidade": 1
          }
        ],
        "circuloBase": 2,
        "concentracao": true
      }
    },
    {
      "id": "habilidade.2-sopro-de-dragao-salva-de-des-concentracao-classe",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Sopro de Dragão · salva de DES · concentração · classe",
        "categoria": "magia",
        "descricao": "Ação bônus · Toque · Concentração até 1 min. O beneficiário pode usar a ação Usar Magia para soprar um cone de 4,5 m. Cada alvo rola DES, CD 13 (14 com Inata). Dano [3d6], metade no sucesso. Escolha ácido, elétrico, gélido, ígneo ou venenoso ao conjurar.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-2"
          }
        ],
        "circuloBase": 2,
        "origem": "feiticeiro",
        "concentracao": true,
        "automacao": {
          "tipo": "efeito",
          "alcanceM": 1.5,
          "efeito": {
            "nome": "Sopro de Dragão",
            "tipo": "buff",
            "descricao": "Pode usar uma ação para soprar um cone ancorado de 4,5 m. Escolha ácido, elétrico, gélido, ígneo ou venenoso.",
            "duracao": {
              "turnos": 10,
              "expira": "inicio_origem"
            },
            "opcoesConcedidas": [
              {
                "id": "sopro-dragao-acido",
                "nome": "Sopro de Dragão · ácido",
                "categoria": "magia",
                "origem": "feiticeiro",
                "filtroHud": "Classe",
                "descricao": "Ação · Cone ancorado de 4,5 m · Salvaguarda de DES. Dano 3d6 ácido, metade no sucesso.",
                "custo": [
                  {
                    "tipo": "acao",
                    "quantidade": 1
                  }
                ],
                "automacao": {
                  "tipo": "salva",
                  "atributo": "des",
                  "cd": 13,
                  "dano": "3d6",
                  "metade": true,
                  "elemento": "acido",
                  "alcanceM": 4.5,
                  "origemArea": "conjurador",
                  "excluirConjurador": true,
                  "area": {
                    "forma": "cone",
                    "comprimentoM": 4.5,
                    "larguraM": 4.5
                  }
                }
              },
              {
                "id": "sopro-dragao-raio",
                "nome": "Sopro de Dragão · elétrico",
                "categoria": "magia",
                "origem": "feiticeiro",
                "filtroHud": "Classe",
                "descricao": "Ação · Cone ancorado de 4,5 m · Salvaguarda de DES. Dano 3d6 elétrico, metade no sucesso.",
                "custo": [
                  {
                    "tipo": "acao",
                    "quantidade": 1
                  }
                ],
                "automacao": {
                  "tipo": "salva",
                  "atributo": "des",
                  "cd": 13,
                  "dano": "3d6",
                  "metade": true,
                  "elemento": "raio",
                  "alcanceM": 4.5,
                  "origemArea": "conjurador",
                  "excluirConjurador": true,
                  "area": {
                    "forma": "cone",
                    "comprimentoM": 4.5,
                    "larguraM": 4.5
                  }
                }
              },
              {
                "id": "sopro-dragao-frio",
                "nome": "Sopro de Dragão · gélido",
                "categoria": "magia",
                "origem": "feiticeiro",
                "filtroHud": "Classe",
                "descricao": "Ação · Cone ancorado de 4,5 m · Salvaguarda de DES. Dano 3d6 gélido, metade no sucesso.",
                "custo": [
                  {
                    "tipo": "acao",
                    "quantidade": 1
                  }
                ],
                "automacao": {
                  "tipo": "salva",
                  "atributo": "des",
                  "cd": 13,
                  "dano": "3d6",
                  "metade": true,
                  "elemento": "frio",
                  "alcanceM": 4.5,
                  "origemArea": "conjurador",
                  "excluirConjurador": true,
                  "area": {
                    "forma": "cone",
                    "comprimentoM": 4.5,
                    "larguraM": 4.5
                  }
                }
              },
              {
                "id": "sopro-dragao-fogo",
                "nome": "Sopro de Dragão · ígneo",
                "categoria": "magia",
                "origem": "feiticeiro",
                "filtroHud": "Classe",
                "descricao": "Ação · Cone ancorado de 4,5 m · Salvaguarda de DES. Dano 3d6 ígneo, metade no sucesso.",
                "custo": [
                  {
                    "tipo": "acao",
                    "quantidade": 1
                  }
                ],
                "automacao": {
                  "tipo": "salva",
                  "atributo": "des",
                  "cd": 13,
                  "dano": "3d6",
                  "metade": true,
                  "elemento": "fogo",
                  "alcanceM": 4.5,
                  "origemArea": "conjurador",
                  "excluirConjurador": true,
                  "area": {
                    "forma": "cone",
                    "comprimentoM": 4.5,
                    "larguraM": 4.5
                  }
                }
              },
              {
                "id": "sopro-dragao-veneno",
                "nome": "Sopro de Dragão · venenoso",
                "categoria": "magia",
                "origem": "feiticeiro",
                "filtroHud": "Classe",
                "descricao": "Ação · Cone ancorado de 4,5 m · Salvaguarda de DES. Dano 3d6 venenoso, metade no sucesso.",
                "custo": [
                  {
                    "tipo": "acao",
                    "quantidade": 1
                  }
                ],
                "automacao": {
                  "tipo": "salva",
                  "atributo": "des",
                  "cd": 13,
                  "dano": "3d6",
                  "metade": true,
                  "elemento": "veneno",
                  "alcanceM": 4.5,
                  "origemArea": "conjurador",
                  "excluirConjurador": true,
                  "area": {
                    "forma": "cone",
                    "comprimentoM": 4.5,
                    "larguraM": 4.5
                  }
                }
              }
            ]
          }
        }
      }
    },
    {
      "id": "habilidade.2-sugestao",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Sugestão",
        "categoria": "magia",
        "descricao": "Ação · 9 m, salvaguarda de SAB CD 13, ordem razoável de até 25 palavras, concentração até 8 h; silenciosa.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "espaco-2",
            "quantidade": 1
          }
        ],
        "circuloBase": 2,
        "concentracao": true,
        "automacao": {
          "tipo": "salva",
          "atributo": "sab",
          "cd": 13,
          "alcanceM": 9,
          "efeitoFalha": {
            "nome": "Sob Sugestão",
            "condicao": "enfeiticado",
            "turnos": 100
          }
        }
      }
    },
    {
      "id": "habilidade.adaga-4-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga +4 | ação",
        "categoria": "acao",
        "descricao": "Corpo a corpo ou arremesso 6/18 m · perfurante.\nNormal [1d20+4]\nDano [1d4+2] · Crítico [2d4+2]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4+2",
          "elemento": "perfurante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "d7ccb7f2-8ed8-57ce-913a-400e40f3c6c8",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.adaga-4-acao-29d943d2",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga +4 | ação",
        "categoria": "acao",
        "descricao": "Corpo a corpo 1,5 m ou arremesso 6/18 m · Perfurante.\nNormal [1d20+4]\nDano [1d4+2] · Crítico [2d4+2]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4+2",
          "alcanceM": 1.5,
          "elemento": "perfurante"
        },
        "requerItemEquipado": "71b23b93-2133-553f-824a-d9667fa2929d",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.adaga-4-acao-c122f856",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga +4 | ação",
        "categoria": "acao",
        "descricao": "Corpo a corpo ou arremesso 6/18 m · perfurante.\nNormal [1d20+4]\nDano [1d4+2] · Crítico [2d4+2]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4+2",
          "elemento": "perfurante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "82ce2b66-29ce-4ca9-a248-7101d18d4b94",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.adaga-4-arremesso-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga +4 · arremesso | ação",
        "categoria": "acao",
        "descricao": "Arremesso 6/18 m. Além de 6 m, o ataque tem desvantagem.\nCorpo a corpo ou arremesso 6/18 m · perfurante.\nNormal [1d20+4]\nDano [1d4+2] · Crítico [2d4+2]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4+2",
          "elemento": "perfurante",
          "alcanceM": 18,
          "alcanceNormalM": 6,
          "arremesso": true
        },
        "varianteArremessoDe": "adaga-4-acao-0",
        "requerItemEquipado": "d7ccb7f2-8ed8-57ce-913a-400e40f3c6c8",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.adaga-4-arremesso-acao-ed8c5f2b",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga +4 · arremesso | ação",
        "categoria": "acao",
        "descricao": "Arremesso 6/18 m. Além de 6 m, o ataque tem desvantagem.\nCorpo a corpo ou arremesso 6/18 m · perfurante.\nNormal [1d20+4]\nDano [1d4+2] · Crítico [2d4+2]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4+2",
          "elemento": "perfurante",
          "alcanceM": 18,
          "alcanceNormalM": 6,
          "arremesso": true
        },
        "varianteArremessoDe": "adaga-4-acao-0",
        "requerItemEquipado": "82ce2b66-29ce-4ca9-a248-7101d18d4b94",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.adaga-4-arremesso-acao-fc3feb9d",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga +4 · arremesso | ação",
        "categoria": "acao",
        "descricao": "Arremesso 6/18 m. Além de 6 m, o ataque tem desvantagem.\nCorpo a corpo 1,5 m ou arremesso 6/18 m · Perfurante.\nNormal [1d20+4]\nDano [1d4+2] · Crítico [2d4+2]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4+2",
          "alcanceM": 18,
          "elemento": "perfurante",
          "alcanceNormalM": 6,
          "arremesso": true
        },
        "varianteArremessoDe": "59b60ef8-41ac-54b4-876d-398ba3b80279",
        "requerItemEquipado": "71b23b93-2133-553f-824a-d9667fa2929d",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.adaga-5-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga +5 | ação",
        "categoria": "acao",
        "descricao": "Corpo a corpo ou arremesso 6/18 m · perfurante. 5 adagas.\nNormal [1d20+5]\nDano [1d6+3] · Crítico [2d6+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "perfurante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "e73ee90c-3d18-55a0-913e-a081959d2509",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.adaga-5-arremesso-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga +5 · arremesso | ação",
        "categoria": "acao",
        "descricao": "Arremesso 6/18 m. Além de 6 m, o ataque tem desvantagem.\nCorpo a corpo ou arremesso 6/18 m · perfurante. 5 adagas.\nNormal [1d20+5]\nDano [1d6+3] · Crítico [2d6+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "perfurante",
          "alcanceM": 18,
          "alcanceNormalM": 6,
          "arremesso": true
        },
        "varianteArremessoDe": "adaga-5-acao-3",
        "requerItemEquipado": "e73ee90c-3d18-55a0-913e-a081959d2509",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.ajudar-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Ajudar | ação",
        "categoria": "acao",
        "descricao": "Auxilie um teste com uma proficiência sua aplicável ou distraia um inimigo a até 1,5 m. Neste último caso, o próximo ataque de um aliado contra ele antes do início do seu próximo turno tem vantagem.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ]
      }
    },
    {
      "id": "habilidade.analisar-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Analisar | ação",
        "categoria": "acao",
        "descricao": "Analise uma pista ou recorde conhecimento. Use a perícia de INT indicada pelo mestre.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ]
      }
    },
    {
      "id": "habilidade.arco-longo-7-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Arco longo +7 | ação",
        "categoria": "acao",
        "descricao": "45/180 m · perfurante · duas mãos, uma flecha. Lentidão: reduza 3 m de deslocamento do alvo atingido até o início do seu próximo turno.\nNormal [1d20+7]\nDano [1d8+3] · Crítico [2d8+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 7,
          "dano": "1d8+3",
          "elemento": "perfurante",
          "alcanceM": 18
        },
        "requerItemEquipado": "769325a2-24ec-498b-9e17-4f841f982ba4",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.arco-longo-7-acao-f0cccb8d",
      "revisao": 1,
      "definicao": {
        "nome": "Arco longo +7 | ação",
        "categoria": "acao",
        "descricao": "45/180 m · perfurante · duas mãos, uma flecha. Lentidão: reduza 3 m de deslocamento do alvo atingido até o início do seu próximo turno.\nNormal [1d20+7]\nDano [1d8+3] · Crítico [2d8+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 7,
          "dano": "1d8+3",
          "elemento": "perfurante",
          "alcanceM": 18
        },
        "requerItemEquipado": "cc8e6520-186a-5ade-ab7d-4051d5022a3d",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.assassino-de-colossos",
      "revisao": 1,
      "definicao": {
        "nome": "Assassino de Colossos",
        "categoria": "acao",
        "grupoExclusivo": "presa-do-cacador",
        "descricao": "Uma vez por turno, quando atingir com arma criatura que esteja abaixo dos PV máximos, pode causar +[1d8] do dano adicional da característica. Não concede ataque extra.",
        "custo": [],
        "gatilho": "apos_acerto",
        "umaVezPorTurno": true,
        "automatico": true,
        "aprimoramento": {
          "dano": "1d8",
          "requisitos": {
            "tagsAtaque": [
              "arma"
            ],
            "alvoFerido": true
          }
        }
      }
    },
    {
      "id": "habilidade.assassino-de-colossos-bc0fae68",
      "revisao": 1,
      "definicao": {
        "nome": "Assassino de Colossos",
        "categoria": "acao",
        "grupoExclusivo": "presa-do-cacador",
        "descricao": "Uma vez por turno, ao acertar com arma uma criatura que já está abaixo dos PV máximos: +[1d8] de dano. Pode trocar por Destruidor de Hordas ao fim de um descanso curto ou longo.",
        "custo": [],
        "gatilho": "apos_acerto",
        "umaVezPorTurno": true,
        "automatico": true,
        "aprimoramento": {
          "dano": "1d8",
          "requisitos": {
            "tagsAtaque": [
              "arma"
            ],
            "alvoFerido": true
          }
        }
      }
    },
    {
      "id": "habilidade.astucia-magica",
      "revisao": 1,
      "definicao": {
        "nome": "Astúcia Mágica",
        "categoria": "acao",
        "descricao": "Fora de combate · 1 minuto. Recupere 1 Espaço de Magia de Pacto. Uso único por descanso longo.",
        "custo": [
          {
            "tipo": "recurso",
            "id": "astucia-magica",
            "quantidade": 1
          }
        ],
        "requisitosUso": {
          "somenteForaCombate": true
        },
        "automacao": {
          "tipo": "economia",
          "recuperarQuantidades": {
            "espaco-2": 1
          }
        }
      }
    },
    {
      "id": "habilidade.atacante-selvagem",
      "revisao": 1,
      "definicao": {
        "nome": "Atacante Selvagem",
        "descricao": "Talento de origem. No primeiro acerto com arma de cada turno, os dados de dano da arma são rolados duas vezes e o maior resultado é aplicado. Modificadores fixos e dados adicionais são somados uma única vez.",
        "gatilho": "ao_rolar_dano",
        "umaVezPorTurno": true,
        "modificadorDano": {
          "tipo": "rolar_duas_escolher_maior",
          "automatico": true,
          "requisitos": {
            "tagsAtaque": [
              "arma"
            ]
          }
        }
      }
    },
    {
      "id": "habilidade.ataque-ameacador",
      "revisao": 1,
      "definicao": {
        "nome": "Ataque Ameaçador",
        "categoria": "acao",
        "descricao": "Ao acertar com arma, gaste um Dado de Superioridade e some 1d8 ao dano.",
        "gatilho": "apos_acerto",
        "custo": [
          {
            "tipo": "recurso",
            "id": "dados-de-superioridade",
            "quantidade": 1
          }
        ],
        "aprimoramento": {
          "dano": "1d8",
          "requisitos": {
            "tagsAtaque": [
              "arma"
            ]
          },
          "salva": {
            "atributo": "sab",
            "cd": 13,
            "efeitoFalha": {
              "nome": "Ataque Ameaçador",
              "condicao": "amedrontado",
              "turnos": 2,
              "expira": "fim_origem"
            }
          }
        }
      }
    },
    {
      "id": "habilidade.ataque-de-desarme",
      "revisao": 1,
      "definicao": {
        "nome": "Ataque de Desarme",
        "categoria": "acao",
        "descricao": "Ao acertar com arma, gaste um Dado de Superioridade e some 1d8 ao dano.",
        "gatilho": "apos_acerto",
        "custo": [
          {
            "tipo": "recurso",
            "id": "dados-de-superioridade",
            "quantidade": 1
          }
        ],
        "aprimoramento": {
          "dano": "1d8",
          "requisitos": {
            "tagsAtaque": [
              "arma"
            ]
          },
          "salva": {
            "atributo": "for",
            "cd": 13,
            "efeitoFalha": {
              "nome": "Desarmado",
              "turnos": 1,
              "expira": "fim_origem"
            }
          }
        }
      }
    },
    {
      "id": "habilidade.ataque-de-oportunidade-reacao",
      "revisao": 1,
      "definicao": {
        "nome": "Ataque de oportunidade | reação",
        "categoria": "acao",
        "descricao": "Quando um inimigo que você vê sai do seu alcance usando movimento, ação, ação bônus ou reação, faça um ataque corpo a corpo imediatamente antes de ele sair. Use a caixa da arma ou do golpe desarmado.",
        "custo": [
          {
            "tipo": "reacao",
            "quantidade": 1
          }
        ],
        "gatilho": "sair_alcance"
      }
    },
    {
      "id": "habilidade.ataque-de-oportunidade-reacao-9e4677f8",
      "revisao": 1,
      "definicao": {
        "nome": "Ataque de oportunidade | reação",
        "categoria": "reacao",
        "descricao": "Quando um inimigo que você vê sai do seu alcance usando movimento, ação, ação bônus ou reação, faça um ataque corpo a corpo imediatamente antes de ele sair. Use a caixa da arma ou do golpe desarmado.",
        "custo": [
          {
            "tipo": "reacao",
            "quantidade": 1
          }
        ],
        "gatilho": "sair_alcance"
      }
    },
    {
      "id": "habilidade.ataque-de-oportunidade-reacao-9f6eea1d",
      "revisao": 1,
      "definicao": {
        "nome": "Ataque de oportunidade — REAÇÃO",
        "categoria": "reacao",
        "descricao": "Quando uma criatura visível sai do seu alcance corpo a corpo por movimento que provoque, pode gastar sua reação para UM ataque corpo a corpo. Não usa arco nem Raio de Gelo como oportunidade. Desengajar e teleporte evitam a oportunidade conforme as regras. Recupera a reação no início do próprio turno.",
        "custo": [
          {
            "tipo": "reacao",
            "quantidade": 1
          }
        ],
        "gatilho": "sair_alcance"
      }
    },
    {
      "id": "habilidade.ataque-de-sopro-cone",
      "revisao": 1,
      "definicao": {
        "nome": "Ataque de Sopro · cone",
        "categoria": "acao",
        "filtroHud": "Classe",
        "descricao": "Substitui o ataque da ação Atacar. Cone de 4,5 m; salvaguarda de DES CD 11. Causa 1d10 de dano de raio, ou metade no sucesso. Gasta 1 dos 2 usos da herança dracônica.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "ataque-de-sopro",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributo": "des",
          "cd": 11,
          "dano": "1d10",
          "metade": true,
          "elemento": "raio",
          "alcanceM": 4.5,
          "area": {
            "forma": "cone",
            "comprimentoM": 4.5,
            "larguraM": 4.5
          }
        }
      }
    },
    {
      "id": "habilidade.ataque-de-sopro-linha",
      "revisao": 1,
      "definicao": {
        "nome": "Ataque de Sopro · linha",
        "categoria": "acao",
        "filtroHud": "Classe",
        "descricao": "Substitui o ataque da ação Atacar. Linha de 9 m por 1,5 m; salvaguarda de DES CD 11. Causa 1d10 de dano de raio, ou metade no sucesso. Gasta 1 dos 2 usos da herança dracônica.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "ataque-de-sopro",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributo": "des",
          "cd": 11,
          "dano": "1d10",
          "metade": true,
          "elemento": "raio",
          "alcanceM": 9,
          "area": {
            "forma": "linha",
            "comprimentoM": 9,
            "larguraM": 1.5
          }
        }
      }
    },
    {
      "id": "habilidade.ataque-prostrador",
      "revisao": 1,
      "definicao": {
        "nome": "Ataque Prostrador",
        "categoria": "acao",
        "descricao": "Ao acertar com arma, gaste um Dado de Superioridade e some 1d8 ao dano.",
        "gatilho": "apos_acerto",
        "custo": [
          {
            "tipo": "recurso",
            "id": "dados-de-superioridade",
            "quantidade": 1
          }
        ],
        "aprimoramento": {
          "dano": "1d8",
          "requisitos": {
            "tagsAtaque": [
              "arma"
            ]
          },
          "salva": {
            "atributo": "for",
            "cd": 13,
            "efeitoFalha": {
              "nome": "Ataque Prostrador",
              "condicao": "caido",
              "turnos": 1,
              "expira": "fim_origem"
            }
          }
        }
      }
    },
    {
      "id": "habilidade.azagaia-5-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Azagaia +5 | ação",
        "categoria": "acao",
        "descricao": "Corpo a corpo ou arremesso 9/36 m · perfurante. Lentidão: reduz 3 m até o início de seu próximo turno.\nNormal [1d20+5]\nDano [1d6+3] · Crítico [2d6+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "perfurante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "0860d841-e2ab-51d0-9bb0-6c4bd6faf164",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.azagaia-5-arremesso-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Azagaia +5 · arremesso | ação",
        "categoria": "acao",
        "descricao": "Arremesso 9/18 m. Além de 9 m, o ataque tem desvantagem.\nCorpo a corpo ou arremesso 9/18 m · perfurante. Lentidão: reduz 3 m até o início de seu próximo turno.\nNormal [1d20+5]\nDano [1d6+3] · Crítico [2d6+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "perfurante",
          "alcanceM": 18,
          "alcanceNormalM": 9,
          "arremesso": true
        },
        "varianteArremessoDe": "azagaia-5-acao-2",
        "requerItemEquipado": "0860d841-e2ab-51d0-9bb0-6c4bd6faf164",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.cimitarra-5-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Cimitarra +5 | ação",
        "categoria": "acao",
        "descricao": "1,5 m · cortante · Leve, Ágil. Apenas uma arma Leve registrada.\nNormal [1d20+5]\nDano [1d6+3] · Crítico [2d6+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "cortante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "36992e04-d209-4de3-a57e-1d44a1dafa0e",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.cimitarra-5-acao-1faa023c",
      "revisao": 1,
      "definicao": {
        "nome": "Cimitarra +5 | ação",
        "categoria": "acao",
        "descricao": "1,5 m · cortante · Leve, Ágil. Permite o ataque com a segunda arma Leve dentro da ação Atacar.\nNormal [1d20+5]\nDano [1d6+3] · Crítico [2d6+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "cortante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "6e35b573-f770-57cd-8c00-632ec9b47442",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.combate-com-armas-grandes",
      "revisao": 1,
      "definicao": {
        "nome": "Combate com Armas Grandes",
        "descricao": "Estilo de Luta. Ao causar dano com uma arma corpo a corpo empunhada com duas mãos, resultados 1 ou 2 nos dados de dano da arma contam como 3. A regra está registrada para a próxima etapa de automação de resultados individuais."
      }
    },
    {
      "id": "habilidade.concentracao-e-turno",
      "revisao": 1,
      "definicao": {
        "nome": "Concentração e turno",
        "categoria": "acao",
        "descricao": "Você mantém apenas uma magia de concentração por vez. Marca do Predador, Golpe Constritor, Escudo da Fé e Proteção contra Lâminas competem por concentração. Turno normal: movimento, uma ação e uma ação bônus quando uma habilidade permitir. Sem Ataque Extra de nível 5.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "concentracao": true,
        "informativa": true
      }
    },
    {
      "id": "habilidade.conter-avanco-1-vez-por-turno",
      "revisao": 1,
      "definicao": {
        "nome": "Conter avanço — 1 vez por turno",
        "descricao": "Ao acertar com a lança em corpo a corpo, pode reduzir o deslocamento do alvo em 3 m até o início do próximo turno do soldado. Reduções desta técnica não se acumulam. Técnica da guarda."
      }
    },
    {
      "id": "habilidade.correr",
      "revisao": 1,
      "definicao": {
        "nome": "Correr",
        "categoria": "acao",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "disparada"
        }
      }
    },
    {
      "id": "habilidade.correr-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Correr | ação",
        "categoria": "acao",
        "descricao": "Ganhe movimento adicional igual ao seu deslocamento atual. Com 9 m, pode percorrer até 18 m neste turno.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "disparada"
        }
      }
    },
    {
      "id": "habilidade.correr-acao-94089e4f",
      "revisao": 1,
      "definicao": {
        "nome": "Correr | ação",
        "categoria": "acao",
        "descricao": "Ganhe movimento adicional igual ao seu deslocamento atual. Com 12 m, pode percorrer até 24 m neste turno.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "disparada"
        }
      }
    },
    {
      "id": "habilidade.correr-acao-d586be15",
      "revisao": 1,
      "definicao": {
        "nome": "Correr | ação",
        "categoria": "acao",
        "descricao": "Ganhe movimento adicional igual ao seu deslocamento atual. Com 10,5 m, pode percorrer até 21 m neste turno.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "disparada"
        }
      }
    },
    {
      "id": "habilidade.defesa-paciente",
      "revisao": 1,
      "definicao": {
        "nome": "Defesa Paciente",
        "categoria": "acao",
        "descricao": "Ação Bônus: Desengajar de graça. Com 1 Foco: Desengajar e Esquivar.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "economia",
          "desengajar": true
        }
      }
    },
    {
      "id": "habilidade.defesa-paciente-foco",
      "revisao": 1,
      "definicao": {
        "nome": "Defesa Paciente · Foco",
        "categoria": "bonus",
        "descricao": "Desengaje e assuma Esquiva até o início do próximo turno.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "pontos-de-foco",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "economia",
          "desengajar": true,
          "esquivar": true
        }
      }
    },
    {
      "id": "habilidade.defletir-ataques",
      "revisao": 1,
      "definicao": {
        "nome": "Defletir Ataques",
        "categoria": "acao",
        "descricao": "Ao ser atingido por ataque com dano contundente, cortante ou perfurante: reduz o dano em [1d10+6]. Se reduzir a 0, pode gastar 1 Foco para redirecionar: alvo a 1,5 m (corpo a corpo) ou 18 m (distância), salvaguarda de DES CD 11 ou sofre [2d6+3] do mesmo tipo.",
        "custo": [
          {
            "tipo": "reacao",
            "quantidade": 1
          }
        ],
        "gatilho": "ser_atingido",
        "automacao": {
          "tipo": "reduzir_dano",
          "formula": "1d10+6",
          "elementos": [
            "contundente",
            "cortante",
            "perfurante"
          ],
          "redirecionar": {
            "recurso": "pontos-de-foco",
            "cd": 11,
            "dano": "2d6+3"
          }
        }
      }
    },
    {
      "id": "habilidade.derrubar-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Derrubar | ação",
        "categoria": "acao",
        "descricao": "Tente derrubar uma criatura a até 1,5 m. A resolução completa da condição Caído permanece assistida pelo mestre.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 10,
          "alcanceM": 1.5,
          "efeitoFalha": {
            "nome": "Caído",
            "condicao": "caido",
            "turnos": 1,
            "expira": "fim_origem"
          }
        }
      }
    },
    {
      "id": "habilidade.derrubar-acao-45835654",
      "revisao": 1,
      "definicao": {
        "nome": "Derrubar | ação",
        "categoria": "acao",
        "descricao": "Tente derrubar uma criatura a até 1,5 m. A resolução completa da condição Caído permanece assistida pelo mestre.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 11,
          "alcanceM": 1.5,
          "efeitoFalha": {
            "nome": "Caído",
            "condicao": "caido",
            "turnos": 1,
            "expira": "fim_origem"
          }
        }
      }
    },
    {
      "id": "habilidade.derrubar-acao-570eb64f",
      "revisao": 1,
      "definicao": {
        "nome": "Derrubar | ação",
        "categoria": "acao",
        "descricao": "Tente derrubar uma criatura a até 1,5 m. A resolução completa da condição Caído permanece assistida pelo mestre.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 9,
          "alcanceM": 1.5,
          "efeitoFalha": {
            "nome": "Caído",
            "condicao": "caido",
            "turnos": 1,
            "expira": "fim_origem"
          }
        }
      }
    },
    {
      "id": "habilidade.derrubar-acao-59771004",
      "revisao": 1,
      "definicao": {
        "nome": "Derrubar | ação",
        "categoria": "acao",
        "descricao": "Tente derrubar uma criatura a até 1,5 m. A resolução completa da condição Caído permanece assistida pelo mestre.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 13,
          "alcanceM": 1.5,
          "efeitoFalha": {
            "nome": "Caído",
            "condicao": "caido",
            "turnos": 1,
            "expira": "fim_origem"
          }
        }
      }
    },
    {
      "id": "habilidade.desengajar",
      "revisao": 1,
      "definicao": {
        "nome": "Desengajar",
        "categoria": "acao",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "desengajar"
        }
      }
    },
    {
      "id": "habilidade.desengajar-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Desengajar | ação",
        "categoria": "acao",
        "descricao": "Seu movimento deixa de provocar ataques de oportunidade pelo restante deste turno.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "desengajar"
        }
      }
    },
    {
      "id": "habilidade.destruidor-de-hordas",
      "revisao": 1,
      "definicao": {
        "nome": "Destruidor de Hordas",
        "categoria": "acao",
        "grupoExclusivo": "presa-do-cacador",
        "descricao": "Uma vez por turno, ao atacar com arma, faz outro ataque com a mesma arma contra criatura diferente a até 1,5 m do alvo original. Ativar no lugar do Assassino de Colossos após um descanso.",
        "custo": [],
        "requisitosUso": {
          "aposAtaque": true,
          "tagsAtaqueAnterior": [
            "arma"
          ],
          "umaVezPorTurno": "destruidor-de-hordas-19",
          "alvoDiferenteDoAnterior": true,
          "distanciaDoAlvoAnteriorM": 1.5
        },
        "automacao": {
          "tipo": "ataque",
          "bonus": 7,
          "dano": "1d8+3",
          "elemento": "perfurante",
          "alcanceM": 18,
          "usarArmaAnterior": true
        }
      }
    },
    {
      "id": "habilidade.empurrar-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Empurrar | ação",
        "categoria": "acao",
        "descricao": "Escolha uma criatura a até 1,5 m. Ela usa a melhor salvaguarda entre FOR e DES contra CD 10. Em uma falha, é empurrada 1,5 m diretamente para longe de você.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 10,
          "alcanceM": 1.5,
          "deslocamentoForcado": {
            "distanciaM": 1.5,
            "direcao": "afastar"
          }
        }
      }
    },
    {
      "id": "habilidade.empurrar-acao-63b33b98",
      "revisao": 1,
      "definicao": {
        "nome": "Empurrar | ação",
        "categoria": "acao",
        "descricao": "Escolha uma criatura a até 1,5 m. Ela usa a melhor salvaguarda entre FOR e DES contra CD 11. Em uma falha, é empurrada 1,5 m diretamente para longe de você.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 11,
          "alcanceM": 1.5,
          "deslocamentoForcado": {
            "distanciaM": 1.5,
            "direcao": "afastar"
          }
        }
      }
    },
    {
      "id": "habilidade.empurrar-acao-710fd437",
      "revisao": 1,
      "definicao": {
        "nome": "Empurrar | ação",
        "categoria": "acao",
        "descricao": "Escolha uma criatura a até 1,5 m. Ela usa a melhor salvaguarda entre FOR e DES contra CD 9. Em uma falha, é empurrada 1,5 m diretamente para longe de você.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 9,
          "alcanceM": 1.5,
          "deslocamentoForcado": {
            "distanciaM": 1.5,
            "direcao": "afastar"
          }
        }
      }
    },
    {
      "id": "habilidade.empurrar-acao-c1f6bba8",
      "revisao": 1,
      "definicao": {
        "nome": "Empurrar | ação",
        "categoria": "acao",
        "descricao": "Escolha uma criatura a até 1,5 m. Ela usa a melhor salvaguarda entre FOR e DES contra CD 13. Em uma falha, é empurrada 1,5 m diretamente para longe de você.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 13,
          "alcanceM": 1.5,
          "deslocamentoForcado": {
            "distanciaM": 1.5,
            "direcao": "afastar"
          }
        }
      }
    },
    {
      "id": "habilidade.esconder-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Esconder | ação",
        "categoria": "acao",
        "descricao": "Com cobertura adequada ou em área muito obscurecida, fora da linha de visão dos inimigos, faça Furtividade contra CD 15. Use a caixa da perícia.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ]
      }
    },
    {
      "id": "habilidade.espada-curta-5-acao-ataque-principal",
      "revisao": 1,
      "definicao": {
        "nome": "Espada curta +5 | ação · ataque principal",
        "categoria": "acao",
        "descricao": "1,5 m · perfurante. Use este modo ao escolher a espada para o ataque principal.\nNormal [1d20+5]\nDano [1d6+3] · Crítico [2d6+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "perfurante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "746a489e-3118-5b0d-8d97-885ca01c7ff2",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.espada-curta-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Espada curta — AÇÃO",
        "categoria": "acao",
        "descricao": "Um ataque [1d20+4], alcance 1,5 m; dano [1d6+2] perfurante. Alternativa à lança, não ataque adicional.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d6+2",
          "alcanceM": 1.5,
          "elemento": "perfurante"
        },
        "requerItemEquipado": "8cbccc7f-d4ea-5192-b1de-c010c6566b15",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.espada-curta-extra-5-na-acao-atacar-agil",
      "revisao": 1,
      "definicao": {
        "nome": "Espada curta extra +5 | na ação Atacar · Ágil",
        "categoria": "acao",
        "descricao": "Após atacar com a cimitarra, use a outra arma Leve uma vez neste turno. A ação bônus continua disponível. A propriedade Leve concede um único ataque extra por turno.\nNormal [1d20+5]\nDano [1d6] · Crítico [2d6]",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "746a489e-3118-5b0d-8d97-885ca01c7ff2",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.espada-grande-5-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Espada grande +5 | ação",
        "categoria": "acao",
        "descricao": "Duas mãos · 1,5 m · cortante. Garantido: 3 de dano se errar. Para Combate com Armas Grandes, leia cada 1 ou 2 de dano como 3. Atacante Selvagem: 1x/turno, role os dados de dano da arma duas vezes e escolha o maior total.\nNormal [1d20+5]\nDano [2d6+3] · Crítico [3d6+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "2d6+3",
          "elemento": "cortante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "8958d021-6528-5fca-aabc-9176a270bdd7",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.esquivar-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Esquivar | ação",
        "categoria": "acao",
        "descricao": "Até seu próximo turno, ataques de quem você vê têm desvantagem contra você e suas salvaguardas de DES têm vantagem. Perde o benefício se ficar incapacitado ou com deslocamento zero.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "economia",
          "esquivar": true
        }
      }
    },
    {
      "id": "habilidade.fala-telepatica-acao-bonus",
      "revisao": 1,
      "definicao": {
        "nome": "Fala Telepática | ação bônus",
        "categoria": "acao",
        "descricao": "Ação Bônus: liga a mente a uma criatura visível a até 9 m. Conversam mentalmente por 3 minutos, a até 4,5 km, num idioma que ambos conheçam. Sem limite de usos.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ]
      }
    },
    {
      "id": "habilidade.feiticaria-inata",
      "revisao": 1,
      "definicao": {
        "nome": "Feitiçaria Inata",
        "categoria": "habilidade",
        "descricao": "Uma ação bônus e um uso. Durante 1 minuto, as magias de Feiticeiro recebem +1 de CD e seus ataques mágicos têm vantagem.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "inata",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "efeito_conjuracao",
          "origem": "feiticeiro",
          "turnos": 10,
          "bonusCD": 1,
          "vantagemAtaque": true
        }
      }
    },
    {
      "id": "habilidade.foice-1-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Foice +1 | ação",
        "categoria": "acao",
        "descricao": "1,5 m · cortante · Leve.\nNormal [1d20+1]\nDano [1d4-1] · Crítico [2d4-1]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 1,
          "dano": "1d4-1",
          "elemento": "cortante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "c0e8edc0-911b-4be2-a945-bf9006f54b3f",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.fonte-de-magia-criar-espaco-de-1-2-pontos-acao-bonus",
      "revisao": 1,
      "definicao": {
        "nome": "Fonte de Magia · criar espaço de 1º (2 pontos) | ação bônus",
        "categoria": "acao",
        "descricao": "Gaste 2 Pontos de Feitiçaria para recuperar um espaço de magia de 1º círculo.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "feiticaria",
            "quantidade": 2
          }
        ],
        "naoConjura": true,
        "automacao": {
          "tipo": "economia",
          "recuperarQuantidades": {
            "espaco-1": 1
          }
        }
      }
    },
    {
      "id": "habilidade.fonte-de-magia-criar-espaco-de-2-3-pontos-acao-bonus",
      "revisao": 1,
      "definicao": {
        "nome": "Fonte de Magia · criar espaço de 2º (3 pontos) | ação bônus",
        "categoria": "acao",
        "descricao": "Gaste 3 Pontos de Feitiçaria para recuperar um espaço de magia de 2º círculo.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "feiticaria",
            "quantidade": 3
          }
        ],
        "naoConjura": true,
        "automacao": {
          "tipo": "economia",
          "recuperarQuantidades": {
            "espaco-2": 1
          }
        }
      }
    },
    {
      "id": "habilidade.fonte-de-magia-espaco-de-1-vira-1-ponto",
      "revisao": 1,
      "definicao": {
        "nome": "Fonte de Magia · espaço de 1º vira 1 ponto",
        "categoria": "acao",
        "descricao": "Gaste um espaço de magia de 1º círculo para ganhar 1 Ponto de Feitiçaria (sem ação).",
        "custo": [
          {
            "tipo": "recurso",
            "id": "espaco-1",
            "quantidade": 1
          }
        ],
        "naoConjura": true,
        "automacao": {
          "tipo": "economia",
          "recuperarQuantidades": {
            "feiticaria": 1
          }
        }
      }
    },
    {
      "id": "habilidade.fonte-de-magia-espaco-de-2-vira-2-pontos",
      "revisao": 1,
      "definicao": {
        "nome": "Fonte de Magia · espaço de 2º vira 2 pontos",
        "categoria": "acao",
        "descricao": "Gaste um espaço de magia de 2º círculo para ganhar 2 Pontos de Feitiçaria (sem ação).",
        "custo": [
          {
            "tipo": "recurso",
            "id": "espaco-2",
            "quantidade": 1
          }
        ],
        "naoConjura": true,
        "automacao": {
          "tipo": "economia",
          "recuperarQuantidades": {
            "feiticaria": 2
          }
        }
      }
    },
    {
      "id": "habilidade.gastar-dado-de-vida",
      "revisao": 1,
      "definicao": {
        "nome": "Gastar Dado de Vida",
        "categoria": "acao",
        "origem": "descanso",
        "descricao": "Durante um descanso curto, gaste um Dado de Vida: role 1d10 e some seu modificador de Constituição para recuperar Pontos de Vida.",
        "custo": [
          {
            "tipo": "recurso",
            "id": "dados-de-vida",
            "quantidade": 1
          }
        ],
        "requisitosUso": {
          "somenteForaCombate": true
        },
        "automacao": {
          "tipo": "economia",
          "cura": "1d10+1"
        }
      }
    },
    {
      "id": "habilidade.gastar-dado-de-vida-3ef4dd2b",
      "revisao": 1,
      "definicao": {
        "nome": "Gastar Dado de Vida",
        "categoria": "acao",
        "origem": "descanso",
        "descricao": "Durante um descanso curto, gaste um Dado de Vida: role 1d10 e some seu modificador de Constituição para recuperar Pontos de Vida.",
        "custo": [
          {
            "tipo": "recurso",
            "id": "dados-de-vida",
            "quantidade": 1
          }
        ],
        "requisitosUso": {
          "somenteForaCombate": true
        },
        "automacao": {
          "tipo": "economia",
          "cura": "1d10+2"
        }
      }
    },
    {
      "id": "habilidade.gastar-dado-de-vida-4ebce3c7",
      "revisao": 1,
      "definicao": {
        "nome": "Gastar Dado de Vida",
        "categoria": "acao",
        "origem": "descanso",
        "descricao": "Durante um descanso curto, gaste um Dado de Vida: role 1d8 e some seu modificador de Constituição para recuperar Pontos de Vida.",
        "custo": [
          {
            "tipo": "recurso",
            "id": "dados-de-vida",
            "quantidade": 1
          }
        ],
        "requisitosUso": {
          "somenteForaCombate": true
        },
        "automacao": {
          "tipo": "economia",
          "cura": "1d8+2"
        }
      }
    },
    {
      "id": "habilidade.gastar-dado-de-vida-6a02b00a",
      "revisao": 1,
      "definicao": {
        "nome": "Gastar Dado de Vida",
        "categoria": "acao",
        "origem": "descanso",
        "descricao": "Durante um descanso curto, gaste um Dado de Vida: role 1d6 e some seu modificador de Constituição para recuperar Pontos de Vida.",
        "custo": [
          {
            "tipo": "recurso",
            "id": "dv",
            "quantidade": 1
          }
        ],
        "requisitosUso": {
          "somenteForaCombate": true
        },
        "automacao": {
          "tipo": "economia",
          "cura": "1d6+2"
        }
      }
    },
    {
      "id": "habilidade.gastar-dado-de-vida-ccd1d931",
      "revisao": 1,
      "definicao": {
        "nome": "Gastar Dado de Vida",
        "categoria": "acao",
        "origem": "descanso",
        "descricao": "Durante um descanso curto, gaste um Dado de Vida: role 1d8 e some seu modificador de Constituição para recuperar Pontos de Vida.",
        "custo": [
          {
            "tipo": "recurso",
            "id": "dados-de-vida",
            "quantidade": 1
          }
        ],
        "requisitosUso": {
          "somenteForaCombate": true
        },
        "automacao": {
          "tipo": "economia",
          "cura": "1d8+1"
        }
      }
    },
    {
      "id": "habilidade.golpe-desarmado-1-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Golpe desarmado +1 | ação",
        "categoria": "acao",
        "descricao": "1,5 m · Normal [1d20+1]\nDano contundente 0, também no crítico (dano fixo).",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 1,
          "dano": "0",
          "elemento": "contundente",
          "alcanceM": 1.5,
          "tags": [
            "desarmado"
          ]
        }
      }
    },
    {
      "id": "habilidade.golpe-desarmado-2-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Golpe desarmado +2 | ação",
        "categoria": "acao",
        "descricao": "1,5 m · Normal [1d20+2]\nDano contundente 1, também no crítico (dano fixo).",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 2,
          "dano": "1",
          "elemento": "contundente",
          "alcanceM": 1.5,
          "tags": [
            "desarmado"
          ]
        }
      }
    },
    {
      "id": "habilidade.golpe-desarmado-2-acao-b2dd2173",
      "revisao": 1,
      "definicao": {
        "nome": "Golpe desarmado +2 | ação",
        "categoria": "acao",
        "descricao": "Corpo a corpo 1,5 m · Normal [1d20+2]\nDano contundente 1. O crítico também causa 1, pois o dano é fixo.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 2,
          "dano": "1",
          "elemento": "contundente",
          "alcanceM": 1.5,
          "tags": [
            "desarmado"
          ]
        }
      }
    },
    {
      "id": "habilidade.golpe-desarmado-3-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Golpe desarmado +3 | ação",
        "categoria": "acao",
        "descricao": "1,5 m · Normal [1d20+3]\nDano contundente 2, também no crítico (dano fixo).",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 3,
          "dano": "2",
          "elemento": "contundente",
          "alcanceM": 1.5,
          "tags": [
            "desarmado"
          ]
        }
      }
    },
    {
      "id": "habilidade.golpe-desarmado-5-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Golpe desarmado +5 | ação",
        "categoria": "acao",
        "descricao": "1,5 m · Normal [1d20+5]\nDano contundente 4, também no crítico (dano fixo).",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "4",
          "elemento": "contundente",
          "alcanceM": 1.5,
          "tags": [
            "desarmado"
          ]
        }
      }
    },
    {
      "id": "habilidade.habilitado-destruidor-de-hordas",
      "revisao": 1,
      "definicao": {
        "nome": "(Habilitado) Destruidor de Hordas",
        "categoria": "acao",
        "grupoExclusivo": "presa-do-cacador",
        "descricao": "Uma vez em cada um dos seus turnos, ao realizar ataque com arma, pode realizar outro ataque com a mesma arma contra criatura diferente a até 1,5 m do alvo original, dentro do alcance da arma e que ainda não atacou neste turno.",
        "custo": [],
        "requisitosUso": {
          "aposAtaque": true,
          "tagsAtaqueAnterior": [
            "arma"
          ],
          "umaVezPorTurno": "habilitado-destruidor-de-hordas-18",
          "alvoDiferenteDoAnterior": true,
          "distanciaDoAlvoAnteriorM": 1.5
        },
        "automacao": {
          "tipo": "ataque",
          "bonus": 7,
          "dano": "1d8+3",
          "elemento": "perfurante",
          "alcanceM": 18,
          "usarArmaAnterior": true
        }
      }
    },
    {
      "id": "habilidade.imobilizar-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Imobilizar | ação",
        "categoria": "acao",
        "descricao": "Tente agarrar uma criatura a até 1,5 m usando uma mão livre. A resolução completa da condição Agarrado permanece assistida pelo mestre.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 10,
          "alcanceM": 1.5,
          "efeitoFalha": {
            "nome": "Agarrado",
            "condicao": "agarrado",
            "turnos": 10
          }
        }
      }
    },
    {
      "id": "habilidade.imobilizar-acao-5132c5b7",
      "revisao": 1,
      "definicao": {
        "nome": "Imobilizar | ação",
        "categoria": "acao",
        "descricao": "Tente agarrar uma criatura a até 1,5 m usando uma mão livre. A resolução completa da condição Agarrado permanece assistida pelo mestre.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 9,
          "alcanceM": 1.5,
          "efeitoFalha": {
            "nome": "Agarrado",
            "condicao": "agarrado",
            "turnos": 10
          }
        }
      }
    },
    {
      "id": "habilidade.imobilizar-acao-bcba07a4",
      "revisao": 1,
      "definicao": {
        "nome": "Imobilizar | ação",
        "categoria": "acao",
        "descricao": "Tente agarrar uma criatura a até 1,5 m usando uma mão livre. A resolução completa da condição Agarrado permanece assistida pelo mestre.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 11,
          "alcanceM": 1.5,
          "efeitoFalha": {
            "nome": "Agarrado",
            "condicao": "agarrado",
            "turnos": 10
          }
        }
      }
    },
    {
      "id": "habilidade.imobilizar-acao-d0f3976a",
      "revisao": 1,
      "definicao": {
        "nome": "Imobilizar | ação",
        "categoria": "acao",
        "descricao": "Tente agarrar uma criatura a até 1,5 m usando uma mão livre. A resolução completa da condição Agarrado permanece assistida pelo mestre.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "salva",
          "atributos": [
            "for",
            "des"
          ],
          "cd": 13,
          "alcanceM": 1.5,
          "efeitoFalha": {
            "nome": "Agarrado",
            "condicao": "agarrado",
            "turnos": 10
          }
        }
      }
    },
    {
      "id": "habilidade.influenciar-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Influenciar | ação",
        "categoria": "acao",
        "descricao": "Declare o que quer que a criatura faça. Se houver teste, use a perícia indicada pelo mestre, como Persuasão.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ]
      }
    },
    {
      "id": "habilidade.inspiracao-de-bardo",
      "revisao": 1,
      "definicao": {
        "nome": "Inspiração de Bardo",
        "categoria": "acao",
        "descricao": "Concede 1d6 a uma criatura a até 18 m.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "inspiracao-de-bardo",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "conceder_dado",
          "alcanceM": 18,
          "modificador": {
            "nome": "Inspiração de Bardo",
            "formula": "1d6",
            "tipos": [
              "ataque",
              "salvaguarda",
              "teste"
            ],
            "removeAoUsar": true,
            "removeEm": "descanso_longo"
          }
        },
        "requisitosUso": {
          "alvoDiferenteDoConjurador": true
        }
      }
    },
    {
      "id": "habilidade.inspiracao-heroica",
      "revisao": 1,
      "definicao": {
        "nome": "Inspiração Heroica",
        "categoria": "acao",
        "descricao": "Depois de ver um d20, gaste a Inspiração Heroica para rerrolá-lo e use o novo resultado.",
        "gatilho": "apos_rolagem_d20",
        "custo": [
          {
            "tipo": "recurso",
            "id": "inspiracao-heroica",
            "quantidade": 1
          }
        ],
        "rerrolagem": {
          "tipo": "d20",
          "modo": "todos"
        }
      }
    },
    {
      "id": "habilidade.lanca-2-acao-duas-maos",
      "revisao": 1,
      "definicao": {
        "nome": "Lança +2 | ação · duas mãos",
        "categoria": "acao",
        "descricao": "Corpo a corpo 1,5 m · Perfurante.\nNormal [1d20+2]\nDano [1d8] · Crítico [2d8]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 2,
          "dano": "1d8",
          "alcanceM": 1.5,
          "elemento": "perfurante"
        },
        "requerItemEquipado": "f5841857-a1f4-5d62-ae62-6845f65994bd",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.lanca-2-acao-uma-mao",
      "revisao": 1,
      "definicao": {
        "nome": "Lança +2 | ação · uma mão",
        "categoria": "acao",
        "descricao": "Corpo a corpo 1,5 m ou arremesso 6/18 m · Perfurante.\nNormal [1d20+2]\nDano [1d6] · Crítico [2d6]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 2,
          "dano": "1d6",
          "alcanceM": 1.5,
          "elemento": "perfurante"
        },
        "requerItemEquipado": "f5841857-a1f4-5d62-ae62-6845f65994bd",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.lanca-2-arremesso-acao-uma-mao",
      "revisao": 1,
      "definicao": {
        "nome": "Lança +2 · arremesso | ação · uma mão",
        "categoria": "acao",
        "descricao": "Arremesso 6/18 m. Além de 6 m, o ataque tem desvantagem.\nCorpo a corpo 1,5 m ou arremesso 6/18 m · Perfurante.\nNormal [1d20+2]\nDano [1d6] · Crítico [2d6]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 2,
          "dano": "1d6",
          "alcanceM": 18,
          "elemento": "perfurante",
          "alcanceNormalM": 6,
          "arremesso": true
        },
        "varianteArremessoDe": "eb1e3e85-d216-544d-8954-deb312f465a1",
        "requerItemEquipado": "f5841857-a1f4-5d62-ae62-6845f65994bd",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.lanca-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Lança — AÇÃO",
        "categoria": "acao",
        "descricao": "Um ataque [1d20+4]; alcance 1,5 m, ou arremesso 6/18 m; acerto [1d6+2] perfurante com uma mão e escudo. Além de 6 m no arremesso, desvantagem. Lança arremessada precisa ser recuperada; use a espada de reserva enquanto isso.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d6+2",
          "alcanceM": 1.5,
          "elemento": "perfurante"
        },
        "requerItemEquipado": "479757f0-6224-50c5-b207-c3105fa9fd81",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.lanca-arremesso-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Lança · arremesso — AÇÃO",
        "categoria": "acao",
        "descricao": "Arremesso 6/18 m. Além de 6 m, o ataque tem desvantagem.\nUm ataque [1d20+4]; alcance 1,5 m, ou arremesso 6/18 m; acerto [1d6+2] perfurante com uma mão e escudo. Além de 6 m no arremesso, desvantagem. Lança arremessada precisa ser recuperada; use a espada de reserva enquanto isso.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d6+2",
          "alcanceM": 18,
          "elemento": "perfurante",
          "alcanceNormalM": 6,
          "arremesso": true
        },
        "varianteArremessoDe": "58bec1ed-2568-594c-8627-9f4b0e79c615",
        "requerItemEquipado": "479757f0-6224-50c5-b207-c3105fa9fd81",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.lanca-em-duas-maos-5-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Lança em duas mãos +5 | ação",
        "categoria": "acao",
        "descricao": "1,5 m · perfurante.\nNormal [1d20+5]\nDano [1d8+3] · Crítico [2d8+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d8+3",
          "elemento": "perfurante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "75d8709d-c305-52a3-9471-53a759415215",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.lanca-em-uma-mao-5-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Lança em uma mão +5 | ação",
        "categoria": "acao",
        "descricao": "Corpo a corpo ou arremesso 6/18 m · perfurante.\nNormal [1d20+5]\nDano [1d6+3] · Crítico [2d6+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "perfurante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "75d8709d-c305-52a3-9471-53a759415215",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.lanca-em-uma-mao-5-arremesso-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Lança em uma mão +5 · arremesso | ação",
        "categoria": "acao",
        "descricao": "Arremesso 6/18 m. Além de 6 m, o ataque tem desvantagem.\nCorpo a corpo ou arremesso 6/18 m · perfurante.\nNormal [1d20+5]\nDano [1d6+3] · Crítico [2d6+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "perfurante",
          "alcanceM": 18,
          "alcanceNormalM": 6,
          "arremesso": true
        },
        "varianteArremessoDe": "lanca-em-uma-mao-5-acao-4",
        "requerItemEquipado": "75d8709d-c305-52a3-9471-53a759415215",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.magia-duplicada-ao-conjurar",
      "revisao": 1,
      "definicao": {
        "nome": "Magia Duplicada | ao conjurar",
        "categoria": "acao",
        "descricao": "Gaste 1 ponto para aumentar em um o círculo efetivo de uma magia que ganhe um alvo adicional ao ser conjurada em círculo superior.",
        "custo": [
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "feiticaria"
          }
        ]
      }
    },
    {
      "id": "habilidade.magia-potencializada-ao-rolar-dano",
      "revisao": 1,
      "definicao": {
        "nome": "Magia Potencializada | ao rolar dano",
        "categoria": "acao",
        "descricao": "Gaste 1 ponto e escolha até 3 dados do dano da magia para rerrolar. Use os novos resultados. Pode combinar com outra Metamagia.",
        "custo": [
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "feiticaria"
          }
        ],
        "gatilho": "apos_rolagem_dano",
        "rerrolagem": {
          "tipo": "dano",
          "modo": "todos",
          "somenteMagia": true
        }
      }
    },
    {
      "id": "habilidade.mangual-5-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Mangual +5 | ação",
        "categoria": "acao",
        "descricao": "1,5 m · contundente. Drenar: desvantagem no próximo ataque do alvo antes de começar seu próximo turno.\nNormal [1d20+5]\nDano [1d8+3] · Crítico [2d8+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d8+3",
          "elemento": "contundente",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "232bf97f-7f19-5171-a794-9349df4d62c9",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.manobras",
      "revisao": 1,
      "definicao": {
        "nome": "Manobras",
        "categoria": "acao",
        "descricao": "Prostrar: teste de FOR ou Caído (Grande ou menor). Ataque Ameaçador: teste de SAB ou Amedrontado até o fim do próximo turno do Draven. Desarme: teste de FOR ou larga um objeto à escolha do Draven. Todas usadas após acertar.",
        "custo": []
      }
    },
    {
      "id": "habilidade.manto-de-inspiracao",
      "revisao": 1,
      "definicao": {
        "nome": "Manto de Inspiração",
        "categoria": "acao",
        "descricao": "Ação Bônus, gasta 1 Inspiração de Bardo: role [1d6]; até 3 criaturas a 18 m (mod. de CAR) ganham PV temporários iguais ao dobro do resultado e podem usar a Reação para se mover até o Deslocamento sem provocar Ataques de Oportunidade.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "inspiracao-de-bardo",
            "quantidade": 1
          }
        ],
        "selecao": {
          "tipo": "alvos",
          "min": 1,
          "max": 3,
          "repetirAlvo": false
        },
        "automacao": {
          "tipo": "pv_temporario",
          "formula": "1d6",
          "multiplicador": 2,
          "alcanceM": 18
        }
      }
    },
    {
      "id": "habilidade.mao-de-cura",
      "revisao": 1,
      "definicao": {
        "nome": "Mão de Cura",
        "categoria": "acao",
        "descricao": "Ação Usar Magia, 1 Foco: toque cura [1d6+1] PV. Na Torrente de Golpes, pode trocar um dos socos por Mão de Cura sem gastar Foco para a cura.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "pontos-de-foco",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "cura",
          "formula": "1d6+1",
          "alcanceM": 1.5
        }
      }
    },
    {
      "id": "habilidade.mao-de-cura-no-lugar-de-um-golpe-da-torrente",
      "revisao": 1,
      "definicao": {
        "nome": "Mão de Cura · no lugar de um golpe da Torrente",
        "categoria": "acao",
        "descricao": "Depois de usar a Torrente de Golpes neste turno, troque um dos golpes por Mão de Cura sem gastar Foco.",
        "custo": [],
        "requisitosUso": {
          "aposOpcao": "torrente-de-golpes-5-acao-bonus-1-foco-2",
          "umaVezPorTurno": "mao-de-cura-torrente"
        },
        "automacao": {
          "tipo": "cura",
          "formula": "1d6+1",
          "alcanceM": 1.5
        }
      }
    },
    {
      "id": "habilidade.mao-de-dolo",
      "revisao": 1,
      "definicao": {
        "nome": "Mão de Dolo",
        "categoria": "acao",
        "descricao": "Uma vez por turno, ao acertar um soco e causar dano, gaste 1 Foco: +[1d6+1] necrótico, sem salvaguarda.",
        "custo": [
          {
            "tipo": "recurso",
            "id": "pontos-de-foco",
            "quantidade": 1
          }
        ],
        "gatilho": "apos_acerto",
        "umaVezPorTurno": true,
        "aprimoramento": {
          "dano": "1d6+1",
          "elemento": "necrotico",
          "requisitos": {
            "tagsAtaque": [
              "desarmado"
            ]
          }
        }
      }
    },
    {
      "id": "habilidade.mao-de-dolo-golpe-da-torrente",
      "revisao": 1,
      "definicao": {
        "nome": "Mão de Dolo · golpe da Torrente",
        "categoria": "acao",
        "descricao": "Depois de acertar um golpe desarmado (inclusive na Torrente de Golpes), gaste 1 Foco: 1d6+1 necrótico no alvo atingido. 1x por turno.",
        "custo": [
          {
            "tipo": "recurso",
            "id": "pontos-de-foco",
            "quantidade": 1
          }
        ],
        "requisitosUso": {
          "aposAcerto": true,
          "tagsAtaqueAnterior": [
            "desarmado"
          ],
          "alvoIgualAoAnterior": true,
          "umaVezPorTurno": "mao-de-dolo-21"
        },
        "automacao": {
          "tipo": "dano_direto",
          "dano": "1d6+1",
          "elemento": "necrotico",
          "alcanceM": 1.5
        }
      }
    },
    {
      "id": "habilidade.mente-desperta",
      "revisao": 1,
      "definicao": {
        "nome": "Mente Desperta",
        "categoria": "bonus",
        "descricao": "Ação bônus · 9 m. Escolha uma criatura que você vê. Vocês podem conversar por telepatia por 3 minutos, mesmo sem compartilhar idioma; a comunicação persiste a até cerca de 5 km. Resolução assistida pelo mestre.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ]
      }
    },
    {
      "id": "habilidade.mente-tatica",
      "revisao": 1,
      "definicao": {
        "nome": "Mente Tática",
        "descricao": "Ao falhar em um teste de atributo, pode gastar um uso de Recuperar Fôlego para somar 1d10. Se o teste continuar falhando, o uso não é gasto. Por enquanto, esta decisão é assistida pelo mestre."
      }
    },
    {
      "id": "habilidade.metabolismo-incomum",
      "revisao": 1,
      "definicao": {
        "nome": "Metabolismo Incomum",
        "categoria": "acao",
        "descricao": "Ao rolar iniciativa, recupere todo o Foco e 1d6+3 PV.",
        "custo": [
          {
            "tipo": "recurso",
            "id": "metabolismo-incomum",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "economia",
          "cura": "1d6+3",
          "recuperarRecursos": [
            "pontos-de-foco"
          ]
        },
        "requisitosUso": {
          "somenteAoRolarIniciativa": true
        }
      }
    },
    {
      "id": "habilidade.misseis-magicos-2-circulo",
      "revisao": 1,
      "definicao": {
        "nome": "Mísseis Mágicos (2º círculo)",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Distribua 3 dardos entre criaturas visíveis. Dano por dardo [1d4+1] energético. Com espaço de 2º, distribua 4 dardos.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "quantidade": 1,
            "id": "espaco-2"
          }
        ],
        "circuloBase": 2,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "projeteis",
          "alcanceM": 18,
          "dano": "1d4+1",
          "elemento": "energetico"
        },
        "selecao": {
          "tipo": "alvos",
          "min": 4,
          "max": 4,
          "repetirAlvo": true
        },
        "varianteDe": "504bc18e-d20e-5bc0-ae01-5109c41f7f29"
      }
    },
    {
      "id": "habilidade.nota-de-importacao",
      "revisao": 1,
      "definicao": {
        "nome": "Nota de importação",
        "categoria": "acao",
        "descricao": "Ficha montada pelas escolhas desta conversa, conferidas no Livro do Jogador 2024 em português. Magias na lista própria (Z039). O dono do token deve ser atribuído no Forge depois de importar.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.nota-de-importacao-4b12f846",
      "revisao": 1,
      "definicao": {
        "nome": "Nota de importação",
        "categoria": "acao",
        "descricao": "Ficha montada pelas escolhas desta conversa, conferidas no Livro do Jogador 2024 em português. Não há magias (Z039 vazio). O dono do token deve ser atribuído no Forge depois de importar.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.passiva-arquearia",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Arquearia",
        "descricao": "Estilo de Luta: +2 nas jogadas de ataque com armas à distância."
      }
    },
    {
      "id": "habilidade.passiva-arquearia-fd6881b8",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Arquearia",
        "descricao": "+2 nas jogadas de ataque com armas à distância (já incluído no Arco Longo)."
      }
    },
    {
      "id": "habilidade.passiva-artes-marciais",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Artes Marciais",
        "descricao": "Desarmado ou só com armas de Monge, sem armadura nem escudo: soco extra como Ação Bônus; dado d6 nos socos e armas de Monge; pode usar DES em vez de FOR no acerto, no dano e na CD de Empurrar/Imobilizar."
      }
    },
    {
      "id": "habilidade.passiva-conhecimento-do-cacador",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Conhecimento do Caçador",
        "descricao": "Enquanto uma criatura está sob sua Marca do Predador, você conhece suas imunidades, resistências e vulnerabilidades, se houver."
      }
    },
    {
      "id": "habilidade.passiva-defesa-sem-armadura",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Defesa sem Armadura",
        "descricao": "Sem armadura e sem escudo: CA = 10 + DES + SAB = 14."
      }
    },
    {
      "id": "habilidade.passiva-defesas-e-sentidos",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Defesas e sentidos",
        "descricao": "Testes de resistência: FOR +5, DES +1, CON +4, INT +0, SAB +1, CAR -1. Ponto fraco: testes de SAB (medo, encantamento). Percepção passiva 13; Intuição passiva 13. Sem resistências ou imunidades a dano. Vantagem para se soltar de Imobilizado (Porte Poderoso)."
      }
    },
    {
      "id": "habilidade.passiva-elfo-silvestre",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Elfo Silvestre",
        "descricao": "Visão no Escuro 18 m. Ancestralidade Feérica: Vantagem em salvaguardas contra ficar Enfeitiçado. Transe: descanso longo em 4 h, sem dormir; magia não o faz dormir. Sentidos Aguçados: Percepção. Truque Arte Druídica.  Passos Largos usa o saldo no topo."
      }
    },
    {
      "id": "habilidade.passiva-especialista",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Especialista",
        "descricao": "Especialização em Investigação (+4) e Persuasão (+7)."
      }
    },
    {
      "id": "habilidade.passiva-explorador-habil",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Explorador Hábil",
        "descricao": "Especialização em Percepção (+6). Dois idiomas extras: Élfico e Silvestre (Silvestre depende do mestre; alternativa Anão)."
      }
    },
    {
      "id": "habilidade.passiva-habilidoso",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Habilidoso",
        "descricao": "Proficiência em Persuasão, Atuação e Intuição."
      }
    },
    {
      "id": "habilidade.passiva-heranca-draconica",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Herança dracônica",
        "descricao": "Resistência a dano elétrico e visão no escuro 18 m. Voo Dracônico só é adquirido no nível 5; não disponível nesta ficha de nível 3."
      }
    },
    {
      "id": "habilidade.passiva-humano",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Humano",
        "descricao": "Engenhoso: ganha Inspiração Heroica a cada Descanso Longo (rerrola 1 dado). Habilidoso: proficiência em Percepção. Versátil: talento de origem Sortudo. Tamanho Médio; deslocamento 9 m."
      }
    },
    {
      "id": "habilidade.passiva-implementos-de-misericordia",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Implementos de Misericórdia",
        "descricao": "Proficiência em Intuição, Medicina e Kit de Herbalismo."
      }
    },
    {
      "id": "habilidade.passiva-iniciado-em-magia-druida",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Iniciado em Magia (Druida)",
        "descricao": "Usa Sabedoria. Truques: Orientação e Acudir os Moribundos. Palavra Curativa: 1x grátis por descanso longo (controle 1/1) e também com espaços de magia."
      }
    },
    {
      "id": "habilidade.passiva-maestria-em-arma",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Maestria em Arma",
        "descricao": "Ativas: Arco Longo (Lentidão) e Cimitarra (Ágil). Pode trocar os tipos a cada descanso longo."
      }
    },
    {
      "id": "habilidade.passiva-magias-psiquicas",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Magias Psíquicas",
        "descricao": "Magias de Encantamento e Ilusão de Bruxo saem sem palavras nem gestos (silenciosas): ninguém percebe que você está conjurando. Pode trocar o tipo de dano das magias de Bruxo para psíquico."
      }
    },
    {
      "id": "habilidade.passiva-mascara-de-muitas-faces",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Máscara de Muitas Faces",
        "descricao": "Disfarçar-se pode ser conjurada à vontade e sem gastar Espaço de Magia de Pacto."
      }
    },
    {
      "id": "habilidade.passiva-mente-desperta",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Mente Desperta",
        "descricao": "A ação bônus Mente Desperta inicia uma conversa telepática com uma criatura visível. A criatura não precisa compartilhar idioma."
      }
    },
    {
      "id": "habilidade.passiva-movimento-sem-armadura",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Movimento sem Armadura",
        "descricao": "+3 m de deslocamento sem armadura e sem escudo (total 12 m)."
      }
    },
    {
      "id": "habilidade.passiva-musico",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Músico",
        "descricao": "Durante um descanso curto ou longo, você pode tocar um instrumento para conceder Inspiração Heroica a aliados, até um número igual ao seu bônus de proficiência. Resolução assistida pelo mestre."
      }
    },
    {
      "id": "habilidade.passiva-pacto-do-tomo",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Pacto do Tomo",
        "descricao": "O Livro das Sombras concede Amizade, Taumaturgia e Mensagem, além dos rituais Encontrar Familiar e Compreender Idiomas, e serve como foco de conjuração."
      }
    },
    {
      "id": "habilidade.passiva-pau-pra-toda-obra",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Pau pra Toda Obra",
        "descricao": "Some +1 aos testes de atributo que usam uma perícia em que você não é proficiente e que ainda não incluem proficiência.",
        "modificadores": {
          "iniciativa": 1
        }
      }
    },
    {
      "id": "habilidade.passiva-pericias-e-idiomas",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Perícias e idiomas",
        "descricao": "Atletismo +5, Acrobacia +3, Intuição +3, Percepção +3, Intimidação +1. Ferramentas: kit de jogo (dados), Ferramentas de Ferreiro. Idiomas: Comum, Gigante, Anão."
      }
    },
    {
      "id": "habilidade.passiva-proficiencias",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Proficiências",
        "descricao": "Armas simples; armadura leve. Instrumentos: Flauta de Pan, Gaita de Foles, Trombeta, Lira, Oboé, Violino e Xilofone. Perícias: Acrobacia, Atuação (Artista); Percepção (Elfo); Investigação, Arcanismo, Persuasão (Bardo). Salvaguardas: DES e CAR."
      }
    },
    {
      "id": "habilidade.passiva-proficiencias-28692ed5",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Proficiências",
        "descricao": "Armas simples e marciais; armaduras leves, médias e escudos. Ferramentas de Cartógrafo. Perícias: Furtividade, Sobrevivência (Guia); Percepção (Elfo); Intuição, Lidar com Animais, Atletismo (Guardião). Salvaguardas: FOR e DES."
      }
    },
    {
      "id": "habilidade.passiva-proficiencias-5e4e4adb",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Proficiências",
        "descricao": "Armaduras Leves. Armas Simples. Kit de Falsificação. Perícias: Arcanismo, Atuação, Enganação, Intimidação, Intuição, Percepção, Persuasão e Prestidigitação. Salvaguardas: Sabedoria e Carisma."
      }
    },
    {
      "id": "habilidade.passiva-proficiencias-e-explorador-habil",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Proficiências e Explorador Hábil",
        "descricao": "Armas simples e marciais; armaduras leves e médias; escudos; ferramentas de cartógrafo. Resistências proficientes: FOR e DES. Explorador Hábil concede uma especialização e dois idiomas adicionais. O texto marca duas especializações: mantidas para revisão do mestre."
      }
    },
    {
      "id": "habilidade.passiva-proficiencias-e0356484",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Proficiências",
        "descricao": "Armas simples e armas marciais com a propriedade Leve; sem armadura. Ferramentas de Entalhador, Ferramentas de Navegador, Kit de Herbalismo. Perícias: Acrobacia, Percepção (Marinheiro); Atletismo, Furtividade (Monge); Intuição, Medicina (Misericórdia). Salvaguardas: FOR e DES."
      }
    },
    {
      "id": "habilidade.passiva-rajada-agonizante",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Rajada Agonizante",
        "descricao": "Soma o modificador de Carisma (+3) ao dano da Rajada Mística."
      }
    },
    {
      "id": "habilidade.passiva-valentao-de-taverna",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Valentão de Taverna",
        "descricao": "Rerrola resultados 1 nos dados de dano do Ataque Desarmado. Proficiência com armas improvisadas. Uma vez por turno, ao acertar um soco com a ação Atacar, empurra o alvo 1,5 m. O dano base do talento (1d4 + FOR) é pior que o das Artes Marciais e não é usado."
      }
    },
    {
      "id": "habilidade.passiva-visao-no-escuro",
      "revisao": 1,
      "definicao": {
        "nome": "Passiva | Visão no Escuro",
        "descricao": "36 m."
      }
    },
    {
      "id": "habilidade.passivas-concentracao-e-feiticaria-inata",
      "revisao": 1,
      "definicao": {
        "nome": "Passivas | concentração e Feitiçaria Inata",
        "descricao": "Mantenha uma só concentração por vez. Ao sofrer dano, use a salvaguarda de CON em Actions. Feitiçaria Inata melhora as magias de Feiticeiro. As recebidas somente pelo legado Infernal usam seus valores normais."
      }
    },
    {
      "id": "habilidade.passivas-preparacao-e-origem",
      "revisao": 1,
      "definicao": {
        "nome": "Passivas | preparação e origem",
        "descricao": "Ao ganhar nível de Feiticeiro, pode trocar uma magia da sua seleção por outra elegível. Magias de origem aberrante e Repreensão Diabólica ficam sempre preparadas. Raio de Fogo e Taumaturgia vêm do legado Infernal."
      }
    },
    {
      "id": "habilidade.passivas-sentidos-e-defesas",
      "revisao": 1,
      "definicao": {
        "nome": "Passivas | sentidos e defesas",
        "descricao": "Visão no escuro 18 m · Percepção passiva 13 · Resistência a dano ígneo."
      }
    },
    {
      "id": "habilidade.passivas-treinamentos",
      "revisao": 1,
      "definicao": {
        "nome": "Passivas | treinamentos",
        "descricao": "Armas simples; sem armaduras. Kit de Falsificação. Habilidoso (Charlatão): Percepção, Intuição e Furtividade. Classe: Persuasão e Intimidação. Antecedente: Enganação e Prestidigitação. Salvaguardas proficientes: CON e CAR."
      }
    },
    {
      "id": "habilidade.passo-do-vento",
      "revisao": 1,
      "definicao": {
        "nome": "Passo do Vento",
        "categoria": "acao",
        "descricao": "Ação Bônus: Correr de graça. Com 1 Foco: Desengajar e Correr, e salto dobrado no turno.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "economia",
          "disparada": true
        }
      }
    },
    {
      "id": "habilidade.passo-do-vento-foco",
      "revisao": 1,
      "definicao": {
        "nome": "Passo do Vento · Foco",
        "categoria": "bonus",
        "descricao": "Desengaje e faça Disparada.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "pontos-de-foco",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "economia",
          "desengajar": true,
          "disparada": true
        }
      }
    },
    {
      "id": "habilidade.pericia-atuacao-0",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Atuação +0",
        "categoria": "acao",
        "descricao": "CAR · Sem proficiência\nNormal [1d20]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-atuacao-1",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Atuação -1",
        "categoria": "acao",
        "descricao": "CAR · Sem proficiência\nNormal [1d20-1]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-atuacao-5",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Atuação +5",
        "categoria": "acao",
        "descricao": "CAR · Proficiente\nNormal [1d20+5]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-enganacao-0",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Enganação +0",
        "categoria": "acao",
        "descricao": "CAR · Sem proficiência\nNormal [1d20]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-enganacao-1",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Enganação -1",
        "categoria": "acao",
        "descricao": "CAR · Sem proficiência\nNormal [1d20-1]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-enganacao-4",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Enganação +4",
        "categoria": "acao",
        "descricao": "CAR · Pau pra Toda Obra\nNormal [1d20+4]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-enganacao-5",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Enganação +5",
        "categoria": "acao",
        "descricao": "CAR · Proficiente\nNormal [1d20+5]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-intimidacao-0",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Intimidação +0",
        "categoria": "acao",
        "descricao": "CAR · Sem proficiência\nNormal [1d20]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-intimidacao-1",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Intimidação -1",
        "categoria": "acao",
        "descricao": "CAR · Sem proficiência\nNormal [1d20-1]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-intimidacao-1-a38216c7",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Intimidação +1",
        "categoria": "acao",
        "descricao": "CAR · Proficiente\nNormal [1d20+1]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-intimidacao-4",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Intimidação +4",
        "categoria": "acao",
        "descricao": "CAR · Pau pra Toda Obra\nNormal [1d20+4]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-intimidacao-5",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Intimidação +5",
        "categoria": "acao",
        "descricao": "CAR · Proficiente\nNormal [1d20+5]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-investigacao-0",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Investigação +0",
        "categoria": "acao",
        "descricao": "INT · Sem proficiência\nNormal [1d20]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-investigacao-1",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Investigação -1",
        "categoria": "acao",
        "descricao": "INT · Sem proficiência\nNormal [1d20-1]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-investigacao-3",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Investigação +3",
        "categoria": "acao",
        "descricao": "INT · Proficiente\nNormal [1d20+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-investigacao-4",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Investigação +4",
        "categoria": "acao",
        "descricao": "INT · Especialização\nNormal [1d20+4]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-prestidigitacao-1",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Prestidigitação +1",
        "categoria": "acao",
        "descricao": "DES · Sem proficiência\nNormal [1d20+1]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-prestidigitacao-3",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Prestidigitação +3",
        "categoria": "acao",
        "descricao": "DES · Sem proficiência\nNormal [1d20+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-prestidigitacao-3-caaf49e7",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Prestidigitação +3",
        "categoria": "acao",
        "descricao": "DES · Pau pra Toda Obra\nNormal [1d20+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pericia-prestidigitacao-4",
      "revisao": 1,
      "definicao": {
        "nome": "Perícia | Prestidigitação +4",
        "categoria": "acao",
        "descricao": "DES · Proficiente\nNormal [1d20+4]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "informativa": true
      }
    },
    {
      "id": "habilidade.pico-de-adrenalina",
      "revisao": 1,
      "definicao": {
        "nome": "Pico de Adrenalina",
        "categoria": "bonus",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "pico-de-adrenalina",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "economia",
          "disparada": true,
          "pvTemporarios": 2
        }
      }
    },
    {
      "id": "habilidade.ponto-de-sorte",
      "revisao": 1,
      "definicao": {
        "nome": "Ponto de Sorte",
        "categoria": "acao",
        "descricao": "Depois de ver um d20, pode rerrolá-lo.",
        "gatilho": "apos_rolagem_d20",
        "custo": [
          {
            "tipo": "recurso",
            "id": "pontos-de-sorte",
            "quantidade": 1
          }
        ],
        "rerrolagem": {
          "tipo": "d20",
          "modo": "todos"
        }
      }
    },
    {
      "id": "habilidade.preparar-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Preparar | ação",
        "categoria": "acao",
        "descricao": "Escolha um gatilho perceptível e uma ação ou movimento. Use sua reação logo após o gatilho, antes do seu próximo turno. Preparar uma magia de uma ação exige conjurá-la agora e manter concentração.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ]
      }
    },
    {
      "id": "habilidade.presa-do-cacador",
      "revisao": 1,
      "definicao": {
        "nome": "Presa do Caçador",
        "categoria": "acao",
        "descricao": "Escolha Assassino de Colossos OU Destruidor de Hordas; pode trocar após descanso curto ou longo. O texto recebido descreve ambas, mas não define a escolhida. Não usar ambas simultaneamente.",
        "custo": []
      }
    },
    {
      "id": "habilidade.procurar-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Procurar | ação",
        "categoria": "acao",
        "descricao": "Examine os arredores. O mestre indica a perícia de SAB, como Percepção para localizar uma criatura escondida.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ]
      }
    },
    {
      "id": "habilidade.protecao-e-tatica",
      "revisao": 1,
      "definicao": {
        "nome": "Proteção e tática",
        "descricao": "CA 16 = camisa de malha 13 + DES 1 + escudo 2. Sem escudo CA 14. Vigia portas, segura corredores e tenta alcançar o sino. Se escolher Esquivar, usa a ação em vez de atacar. Não possui ação bônus especial, maestrias ou Ataques Múltiplos."
      }
    },
    {
      "id": "habilidade.queimadura-de-fogo",
      "revisao": 1,
      "definicao": {
        "nome": "Queimadura de Fogo",
        "categoria": "acao",
        "filtroHud": "Classe",
        "descricao": "Herança do Gigante de Fogo. Depois de acertar uma jogada de ataque e causar dano, gaste 1 uso para somar 1d10 de dano de fogo ao mesmo alvo. Usos iguais ao bônus de proficiência; recupera no descanso longo.",
        "gatilho": "apos_acerto",
        "custo": [
          {
            "tipo": "recurso",
            "id": "queimadura-de-fogo",
            "quantidade": 1
          }
        ],
        "aprimoramento": {
          "dano": "1d10",
          "elemento": "fogo"
        }
      }
    },
    {
      "id": "habilidade.recuperar-folego",
      "revisao": 1,
      "definicao": {
        "nome": "Recuperar Fôlego",
        "categoria": "bonus",
        "descricao": "Recupere 1d10+3 PV.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "recuperar-folego",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "economia",
          "cura": "1d10+3"
        }
      }
    },
    {
      "id": "habilidade.segunda-adaga-4-acao-bonus",
      "revisao": 1,
      "definicao": {
        "nome": "Segunda adaga +4 | ação bônus",
        "categoria": "acao",
        "descricao": "Após atacar com outra arma Leve na ação Atacar neste turno. Perfurante.\nNormal [1d20+4]\nDano [1d4] · Crítico [2d4]",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4",
          "elemento": "perfurante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "d7ccb7f2-8ed8-57ce-913a-400e40f3c6c8-2",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.segunda-adaga-4-acao-bonus-868ca569",
      "revisao": 1,
      "definicao": {
        "nome": "Segunda adaga +4 | ação bônus",
        "categoria": "acao",
        "descricao": "Após atacar com uma adaga Leve na ação Atacar, use a outra no mesmo turno. Uma vez por turno. Perfurante.\nNormal [1d20+4]\nDano [1d4] · Crítico [2d4]",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "requisitosUso": {
          "aposAtaque": true,
          "tagsAtaqueAnterior": [
            "arma"
          ],
          "umaVezPorTurno": "0efe3fc9-7f19-5259-ae74-97e87627d6c4"
        },
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4",
          "elemento": "perfurante",
          "alcanceM": 1.5,
          "tags": [
            "arma"
          ]
        },
        "requerItemEquipado": "71b23b93-2133-553f-824a-d9667fa2929d-2",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.segunda-adaga-4-acao-bonus-ac5171e6",
      "revisao": 1,
      "definicao": {
        "nome": "Segunda adaga +4 | ação bônus",
        "categoria": "acao",
        "descricao": "Após atacar com outra arma Leve na ação Atacar neste turno. Perfurante.\nNormal [1d20+4]\nDano [1d4] · Crítico [2d4]",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4",
          "elemento": "perfurante",
          "alcanceM": 1.5
        },
        "requerItemEquipado": "82ce2b66-29ce-4ca9-a248-7101d18d4b94-2",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.segunda-adaga-4-arremesso-acao-bonus",
      "revisao": 1,
      "definicao": {
        "nome": "Segunda adaga +4 · arremesso | ação bônus",
        "categoria": "acao",
        "descricao": "Arremesso 6/18 m. Além de 6 m, o ataque tem desvantagem.\nApós atacar com outra arma Leve na ação Atacar neste turno. Perfurante.\nNormal [1d20+4]\nDano [1d4] · Crítico [2d4]",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4",
          "elemento": "perfurante",
          "alcanceM": 18,
          "alcanceNormalM": 6,
          "arremesso": true
        },
        "varianteArremessoDe": "segunda-adaga-4-acao-bonus-1",
        "requerItemEquipado": "d7ccb7f2-8ed8-57ce-913a-400e40f3c6c8-2",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.segunda-adaga-4-arremesso-acao-bonus-7e4bc446",
      "revisao": 1,
      "definicao": {
        "nome": "Segunda adaga +4 · arremesso | ação bônus",
        "categoria": "acao",
        "descricao": "Arremesso 6/18 m. Além de 6 m, o ataque tem desvantagem.\nApós atacar com uma adaga Leve na ação Atacar, use a outra no mesmo turno. Uma vez por turno. Perfurante.\nNormal [1d20+4]\nDano [1d4] · Crítico [2d4]",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "requisitosUso": {
          "aposAtaque": true,
          "tagsAtaqueAnterior": [
            "arma"
          ],
          "umaVezPorTurno": "0efe3fc9-7f19-5259-ae74-97e87627d6c4"
        },
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4",
          "elemento": "perfurante",
          "alcanceM": 18,
          "tags": [
            "arma"
          ],
          "alcanceNormalM": 6,
          "arremesso": true
        },
        "varianteArremessoDe": "0efe3fc9-7f19-5259-ae74-97e87627d6c4",
        "requerItemEquipado": "71b23b93-2133-553f-824a-d9667fa2929d-2",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.segunda-adaga-4-arremesso-acao-bonus-d51e7f5b",
      "revisao": 1,
      "definicao": {
        "nome": "Segunda adaga +4 · arremesso | ação bônus",
        "categoria": "acao",
        "descricao": "Arremesso 6/18 m. Além de 6 m, o ataque tem desvantagem.\nApós atacar com outra arma Leve na ação Atacar neste turno. Perfurante.\nNormal [1d20+4]\nDano [1d4] · Crítico [2d4]",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d4",
          "elemento": "perfurante",
          "alcanceM": 18,
          "alcanceNormalM": 6,
          "arremesso": true
        },
        "varianteArremessoDe": "segunda-adaga-4-acao-bonus-1",
        "requerItemEquipado": "82ce2b66-29ce-4ca9-a248-7101d18d4b94-2",
        "ataqueLegadoDeItem": true
      }
    },
    {
      "id": "habilidade.soco-5-acao-ou-acao-bonus",
      "revisao": 1,
      "definicao": {
        "nome": "Soco +5 | ação ou ação bônus",
        "categoria": "acao",
        "descricao": "1,5 m · contundente. Artes Marciais concede um soco como ação bônus. Valentão de Taverna permite rerrolar 1 no dano e, na ação Atacar, empurrar 1,5 m uma vez por turno.\nNormal [1d20+5]\nDano [1d6+3] · Crítico [2d6+3]",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "contundente",
          "alcanceM": 1.5
        },
        "requisitosUso": {
          "aposAtaque": true
        }
      }
    },
    {
      "id": "habilidade.soco-golpe-desarmado-5-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Soco (Golpe Desarmado) +5 | ação",
        "categoria": "acao",
        "descricao": "Golpe Desarmado com a ação Atacar, usando as Artes Marciais (dado de Artes Marciais e DES).",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "elemento": "contundente",
          "alcanceM": 1.5
        }
      }
    },
    {
      "id": "habilidade.surto-de-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Surto de Ação",
        "categoria": "acao",
        "descricao": "Receba uma ação adicional neste turno.",
        "custo": [
          {
            "tipo": "recurso",
            "id": "surto-de-acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "economia",
          "adicionar": {
            "acao": 1
          }
        }
      }
    },
    {
      "id": "habilidade.tocar-o-sino-acao-da-missao",
      "revisao": 1,
      "definicao": {
        "nome": "Tocar o sino — AÇÃO DA MISSÃO",
        "categoria": "acao",
        "descricao": "A até 1,5 m de um acionamento funcional, com acesso físico e mão livre, pode gastar sua ação Utilizar para tocar. Qualquer um dos dois sinos dispara o alarme geral. Pode mover-se e tocar no mesmo turno se alcançar. Disparada usa sua ação, então não pode também tocar nesse turno. Gritos alertam quem puder ouvir, sem acionar magicamente o sino. Nenhum destes guardas carrega a chave do cofre.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ]
      }
    },
    {
      "id": "habilidade.torrente-de-golpes-5-acao-bonus-1-foco",
      "revisao": 1,
      "definicao": {
        "nome": "Torrente de Golpes +5 | ação bônus · 1 Foco",
        "categoria": "acao",
        "descricao": "Dois socos separados. Use estes botões uma vez para cada soco. Pode trocar um deles por Mão de Cura.\nNormal [1d20+5]\nDano [1d6+3] · Crítico [2d6+3]",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          },
          {
            "tipo": "recurso",
            "id": "pontos-de-foco",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d6+3",
          "alcanceM": 1.5,
          "ataques": [
            {
              "tipo": "ataque",
              "bonus": 5,
              "dano": "1d6+3",
              "alcanceM": 1.5,
              "elemento": "contundente",
              "tags": [
                "desarmado"
              ]
            },
            {
              "tipo": "ataque",
              "bonus": 5,
              "dano": "1d6+3",
              "alcanceM": 1.5,
              "elemento": "contundente",
              "tags": [
                "desarmado"
              ]
            }
          ],
          "elemento": "contundente",
          "tags": [
            "desarmado"
          ]
        },
        "selecao": {
          "tipo": "alvos",
          "min": 2,
          "max": 2,
          "repetirAlvo": true
        }
      }
    },
    {
      "id": "habilidade.truque-acudir-os-moribundos-iniciado",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Acudir os Moribundos · Iniciado",
        "categoria": "magia",
        "descricao": "Ação, 4,5 m: uma criatura com 0 PV que não esteja morta fica Estável.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "automacao": {
          "tipo": "estabilizar",
          "alcanceM": 4.5
        }
      }
    },
    {
      "id": "habilidade.truque-amizade",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Amizade",
        "categoria": "magia",
        "descricao": "Ação · enfeitiça 1 criatura a 3 m por 1 minuto, salvaguarda de SAB CD 13, concentração, silenciosa.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "concentracao": true,
        "automacao": {
          "tipo": "salva",
          "atributo": "sab",
          "cd": 13,
          "alcanceM": 3,
          "efeitoFalha": {
            "nome": "Enfeitiçado",
            "condicao": "enfeiticado",
            "turnos": 10
          }
        }
      }
    },
    {
      "id": "habilidade.truque-arte-druidica-elfo",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Arte Druídica · Elfo",
        "categoria": "magia",
        "descricao": "Pequenos efeitos da natureza: prever o tempo, fazer uma flor desabrochar, efeitos sensoriais inofensivos, acender ou apagar uma chama pequena.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0
      }
    },
    {
      "id": "habilidade.truque-explosao-elemental-acido-ataque-5-classe",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Explosão Elemental (ácido) · ataque +5 · classe",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Ácido, elétrico, gélido, ígneo, psíquico, trovejante ou venenoso. Para cada 8 no dano, role mais um d8 do mesmo tipo, até 3 dados extras.\nNormal [1d20+5]\nDano [1d8] · Crítico [2d8]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d8",
          "elemento": "acido",
          "alcanceM": 18
        },
        "varianteDe": "80382f78-315c-5279-be65-98a7df74fb0c"
      }
    },
    {
      "id": "habilidade.truque-explosao-elemental-fogo-ataque-5-classe",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Explosão Elemental (fogo) · ataque +5 · classe",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Ácido, elétrico, gélido, ígneo, psíquico, trovejante ou venenoso. Para cada 8 no dano, role mais um d8 do mesmo tipo, até 3 dados extras.\nNormal [1d20+5]\nDano [1d8] · Crítico [2d8]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d8",
          "elemento": "fogo",
          "alcanceM": 18
        }
      }
    },
    {
      "id": "habilidade.truque-explosao-elemental-frio-ataque-5-classe",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Explosão Elemental (frio) · ataque +5 · classe",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Ácido, elétrico, gélido, ígneo, psíquico, trovejante ou venenoso. Para cada 8 no dano, role mais um d8 do mesmo tipo, até 3 dados extras.\nNormal [1d20+5]\nDano [1d8] · Crítico [2d8]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d8",
          "elemento": "frio",
          "alcanceM": 18
        },
        "varianteDe": "80382f78-315c-5279-be65-98a7df74fb0c"
      }
    },
    {
      "id": "habilidade.truque-explosao-elemental-psiquico-ataque-5-classe",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Explosão Elemental (psíquico) · ataque +5 · classe",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Ácido, elétrico, gélido, ígneo, psíquico, trovejante ou venenoso. Para cada 8 no dano, role mais um d8 do mesmo tipo, até 3 dados extras.\nNormal [1d20+5]\nDano [1d8] · Crítico [2d8]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d8",
          "elemento": "psiquico",
          "alcanceM": 18
        },
        "varianteDe": "80382f78-315c-5279-be65-98a7df74fb0c"
      }
    },
    {
      "id": "habilidade.truque-explosao-elemental-raio-ataque-5-classe",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Explosão Elemental (raio) · ataque +5 · classe",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Ácido, elétrico, gélido, ígneo, psíquico, trovejante ou venenoso. Para cada 8 no dano, role mais um d8 do mesmo tipo, até 3 dados extras.\nNormal [1d20+5]\nDano [1d8] · Crítico [2d8]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d8",
          "elemento": "raio",
          "alcanceM": 18
        },
        "varianteDe": "80382f78-315c-5279-be65-98a7df74fb0c"
      }
    },
    {
      "id": "habilidade.truque-explosao-elemental-trovejante-ataque-5-classe",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Explosão Elemental (trovejante) · ataque +5 · classe",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Ácido, elétrico, gélido, ígneo, psíquico, trovejante ou venenoso. Para cada 8 no dano, role mais um d8 do mesmo tipo, até 3 dados extras.\nNormal [1d20+5]\nDano [1d8] · Crítico [2d8]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d8",
          "elemento": "trovejante",
          "alcanceM": 18
        },
        "varianteDe": "80382f78-315c-5279-be65-98a7df74fb0c"
      }
    },
    {
      "id": "habilidade.truque-explosao-elemental-veneno-ataque-5-classe",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Explosão Elemental (veneno) · ataque +5 · classe",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Ácido, elétrico, gélido, ígneo, psíquico, trovejante ou venenoso. Para cada 8 no dano, role mais um d8 do mesmo tipo, até 3 dados extras.\nNormal [1d20+5]\nDano [1d8] · Crítico [2d8]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d8",
          "elemento": "veneno",
          "alcanceM": 18
        },
        "varianteDe": "80382f78-315c-5279-be65-98a7df74fb0c"
      }
    },
    {
      "id": "habilidade.truque-golpe-certeiro",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Golpe Certeiro",
        "categoria": "magia",
        "descricao": "Ação Usar Magia · SAB · dano da arma ou radiante. Escolha uma arma.\nArco longo (45/180 m)\nNormal [1d20+6]\nDano [1d8+2] · Crítico [2d8+2]\nCimitarra (1,5 m)\nNormal [1d20+4]\nDano [1d6+2] · Crítico [2d6+2]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 4,
          "dano": "1d8+2",
          "elemento": "radiante",
          "alcanceM": 1.5
        },
        "circuloBase": 0,
        "semArquearia": true
      }
    },
    {
      "id": "habilidade.truque-ilusao-menor",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Ilusão Menor",
        "categoria": "magia",
        "descricao": "Ação, 9 m, 1 min: cria um som ou uma imagem parada que cabe num cubo de 1,5 m. Teste de Investigação contra CD 13 revela a ilusão.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0
      }
    },
    {
      "id": "habilidade.truque-maos-magicas",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Mãos Mágicas",
        "categoria": "magia",
        "descricao": "Ação · mão fantasma a 9 m, 1 minuto, carrega até 5 kg.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0
      }
    },
    {
      "id": "habilidade.truque-maos-magicas-utilidade-classe",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Mãos Mágicas · utilidade · classe",
        "categoria": "magia",
        "descricao": "Ação, mão espectral a até 9 m por 1 minuto. Manipula objetos de até 5 kg; não ataca.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "feiticeiro"
      }
    },
    {
      "id": "habilidade.truque-mensagem",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Mensagem",
        "categoria": "magia",
        "descricao": "Ação · sussurro a até 36 m que só o alvo ouve e pode responder.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0
      }
    },
    {
      "id": "habilidade.truque-orientacao-iniciado-concentracao",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Orientação · Iniciado, Concentração",
        "categoria": "magia",
        "descricao": "Ação, toque, 1 min: o alvo soma [1d4] nos testes de uma perícia escolhida.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "concentracao": true,
        "automacao": {
          "tipo": "conceder_dado",
          "alcanceM": 1.5,
          "modificador": {
            "nome": "Orientação",
            "formula": "1d4",
            "tipos": [
              "teste"
            ],
            "removeAoUsar": false
          }
        }
      }
    },
    {
      "id": "habilidade.truque-protecao-contra-laminas",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Proteção contra Lâminas",
        "categoria": "magia",
        "descricao": "Truque informado: ação; pessoal; V,S; concentração até 1 minuto. Atacantes subtraem [1d4] das jogadas de ataque contra você. Não acumula com outra concentração sua.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "concentracao": true,
        "automacao": {
          "tipo": "efeito",
          "alcanceM": 0,
          "efeito": {
            "nome": "Proteção contra Lâminas",
            "tipo": "buff",
            "descricao": "Ataques contra o alvo subtraem 1d4 da jogada de ataque.",
            "restricoes": {
              "penalidadeAtaquesContra": "1d4"
            },
            "duracao": {
              "turnos": 10,
              "expira": "inicio_origem"
            }
          }
        }
      }
    },
    {
      "id": "habilidade.truque-protecao-contra-laminas-concentracao-classe",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Proteção Contra Lâminas · concentração · classe",
        "categoria": "magia",
        "descricao": "Ação · Pessoal · Concentração até 1 min. Quem atacar você subtrai [1d4] da jogada de ataque.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "feiticeiro",
        "concentracao": true,
        "automacao": {
          "tipo": "efeito",
          "alcanceM": 0,
          "efeito": {
            "nome": "Proteção contra Lâminas",
            "tipo": "buff",
            "descricao": "Ataques contra o alvo subtraem 1d4 da jogada de ataque.",
            "restricoes": {
              "penalidadeAtaquesContra": "1d4"
            },
            "duracao": {
              "turnos": 10,
              "expira": "inicio_origem"
            }
          }
        }
      }
    },
    {
      "id": "habilidade.truque-raio-de-fogo-ataque-5-infernal",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Raio de Fogo · ataque +5 · infernal",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Ígneo · Criatura ou objeto.\nNormal [1d20+5]\nDano [1d10] · Crítico [2d10]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d10",
          "alcanceM": 18,
          "elemento": "fogo"
        },
        "origem": "infernal"
      }
    },
    {
      "id": "habilidade.truque-rajada-mistica",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Rajada Mística",
        "categoria": "magia",
        "descricao": "Ação · 36 m · energético ou psíquico. Rajada Agonizante incluída.\nNormal [1d20+5]\nDano [1d10+3] · Crítico [2d10+3]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d10+3",
          "elemento": "psiquico",
          "alcanceM": 18
        },
        "circuloBase": 0
      }
    },
    {
      "id": "habilidade.truque-talho-mental-salva-de-int-aberrante",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Talho Mental · salva de INT · aberrante",
        "categoria": "magia",
        "descricao": "Ação · 18 m · Alvo rola INT, CD 13 (14 com Inata). Falha: dano [1d6] psíquico e subtrai [1d4] da próxima salvaguarda antes do fim do seu próximo turno. Sucesso: sem efeito.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "salva",
          "atributo": "int",
          "cd": 13,
          "dano": "1d6",
          "alcanceM": 18,
          "elemento": "psiquico",
          "efeitoFalha": {
            "nome": "Mente Talhada",
            "turnos": 2,
            "penalidadeProximaSalva": "1d4",
            "expira": "fim_origem"
          }
        }
      }
    },
    {
      "id": "habilidade.truque-taumaturgia",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Taumaturgia",
        "categoria": "magia",
        "descricao": "Ação · tremores, sons, fogo e portas a até 9 m; olhos e voz só em você.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0
      }
    },
    {
      "id": "habilidade.truque-taumaturgia-utilidade-infernal",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Taumaturgia · utilidade · infernal",
        "categoria": "magia",
        "descricao": "Ação, pequenos prodígios por até 1 minuto: voz amplificada, chamas que tremulam, tremores leves, olhos alterados.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "infernal"
      }
    },
    {
      "id": "habilidade.truque-toque-chocante-ataque-5-classe",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Toque Chocante · ataque +5 · classe",
        "categoria": "magia",
        "descricao": "Ação · Toque · Elétrico. Se acertar, o alvo perde ataques de oportunidade até o início do próximo turno dele.\nNormal [1d20+5]\nDano [1d8] · Crítico [2d8]",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "origem": "feiticeiro",
        "automacao": {
          "tipo": "ataque",
          "bonus": 5,
          "dano": "1d8",
          "elemento": "raio",
          "alcanceM": 1.5,
          "efeitoAcerto": {
            "nome": "Sem reações (Toque Chocante)",
            "tipo": "debuff",
            "zerarReacao": true,
            "descricao": "Não pode fazer reações até o início do próprio turno.",
            "duracao": {
              "turnos": 1,
              "restante": 1,
              "expira": "inicio_alvo"
            }
          }
        }
      }
    },
    {
      "id": "habilidade.truque-zombaria-perversa",
      "revisao": 1,
      "definicao": {
        "nome": "Truque | Zombaria Perversa",
        "categoria": "magia",
        "descricao": "Ação, 18 m. Salvaguarda de SAB CD 13: [1d6] psíquico e o alvo tem Desvantagem na próxima jogada de ataque antes do fim do turno dele. No sucesso, sem efeito.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ],
        "circuloBase": 0,
        "automacao": {
          "tipo": "salva",
          "atributo": "sab",
          "cd": 13,
          "dano": "1d6",
          "elemento": "psiquico",
          "alcanceM": 18,
          "efeitoFalha": {
            "nome": "Zombado",
            "turnos": 1,
            "restricoes": {
              "desvantagemAtaques": true,
              "consumirAoAtacar": true
            },
            "expira": "fim_alvo"
          }
        }
      }
    },
    {
      "id": "habilidade.usar-magia-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Usar Magia | ação",
        "categoria": "acao",
        "descricao": "Escolha na Spell List uma magia com tempo de conjuração de uma ação ou ative um efeito que peça esta ação.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ]
      }
    },
    {
      "id": "habilidade.usar-objeto-acao",
      "revisao": 1,
      "definicao": {
        "nome": "Usar Objeto | ação",
        "categoria": "acao",
        "descricao": "Manipule um objeto que exija uma ação.",
        "custo": [
          {
            "tipo": "acao",
            "quantidade": 1
          }
        ]
      }
    },
    {
      "id": "habilidade.valentao-de-taverna-empurrar-1-5-m",
      "revisao": 1,
      "definicao": {
        "nome": "Valentão de Taverna · empurrar 1,5 m",
        "categoria": "acao",
        "descricao": "Uma vez por turno, depois de acertar um golpe desarmado com a ação Atacar, empurre o alvo 1,5 m.",
        "custo": [],
        "requisitosUso": {
          "aposAcerto": true,
          "tagsAtaqueAnterior": [
            "desarmado"
          ],
          "alvoIgualAoAnterior": true,
          "umaVezPorTurno": "valentao-de-taverna"
        },
        "automacao": {
          "tipo": "dano_direto",
          "alcanceM": 1.5,
          "deslocamentoForcado": {
            "distanciaM": 1.5
          }
        }
      }
    },
    {
      "id": "magia.passo-nebuloso",
      "revisao": 1,
      "definicao": {
        "nome": "2º | Passo Nebuloso · recompensa de aventura",
        "categoria": "magia",
        "circuloBase": 2,
        "descricao": "Ação bônus. Teleporte-se para um espaço desocupado que você possa ver a até 9 m.",
        "custo": [
          {
            "tipo": "bonus",
            "quantidade": 1
          }
        ],
        "automacao": {
          "tipo": "teleporte",
          "alcanceM": 9
        },
        "foraCombate": true
      }
    }
  ],
  "itens": [
    {
      "id": "item.20-flechas-e-aljava",
      "revisao": 1,
      "definicao": {
        "nome": "20 flechas e aljava",
        "descricao": "20 flechas na importação; controlar munição manualmente.",
        "tipo": "etc",
        "empilhavel": true,
        "pesoKg": 0.025,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.adaga",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "adaga",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve",
          "arremessavel"
        ],
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "pesoKg": 0.5,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "Uma mão; 1d4 perfurante; corpo a corpo ou arremesso.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d4",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true
      }
    },
    {
      "id": "item.adaga-1523045d",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga",
        "descricao": "Ataque +4; dano 1d4+2 perfurante; arremesso 6/18 m.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 0.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "0efe3fc9-7f19-5259-ae74-97e87627d6c4",
          "0efe3fc9-7f19-5259-ae74-97e87627d6c4-arremesso"
        ],
        "tipoArma": "adaga",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve",
          "arremessavel"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d4",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.adaga-19029790",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga",
        "descricao": "Ataque +4; dano 1d4+2 perfurante; arremesso 6/18 m.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 0.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "59b60ef8-41ac-54b4-876d-398ba3b80279",
          "59b60ef8-41ac-54b4-876d-398ba3b80279-arremesso"
        ],
        "tipoArma": "adaga",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve",
          "arremessavel"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d4",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.adaga-469c7254",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga",
        "descricao": "Ataque +4; dano 1d4+2 perfurante; arremesso 6/18 m.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 0.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "adaga-4-acao-0",
          "adaga-4-acao-0-arremesso"
        ],
        "tipoArma": "adaga",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve",
          "arremessavel"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d4",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.adaga-48b69582",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga",
        "descricao": "Ataque +5; 1d6+3 perfurante (dado de Artes Marciais); arremesso 6/18 m.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 0.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [],
        "tipoArma": "adaga",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve",
          "arremessavel"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d4",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.adaga-62b1e6a3",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga",
        "descricao": "Ataque +4; dano 1d4+2 perfurante; arremesso 6/18 m.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 0.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "segunda-adaga-4-acao-bonus-1",
          "segunda-adaga-4-acao-bonus-1-arremesso"
        ],
        "tipoArma": "adaga",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve",
          "arremessavel"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d4",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.adaga-8711f9a2",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga",
        "descricao": "Ataque +5; 1d6+3 perfurante (dado de Artes Marciais); arremesso 6/18 m.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 0.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "adaga-5-acao-3",
          "adaga-5-acao-3-arremesso"
        ],
        "tipoArma": "adaga",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve",
          "arremessavel"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d4",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.aljava-com-20-flechas",
      "revisao": 1,
      "definicao": {
        "nome": "Aljava com 20 Flechas",
        "descricao": "Após a luta, 1 minuto recupera metade das flechas usadas. Controle a munição manualmente.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 0.025,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.anel-simples-de-oficina",
      "revisao": 1,
      "definicao": {
        "nome": "Anel simples de oficina",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 5,
          "moeda": "po"
        },
        "pesoKg": 0.02,
        "slotEquipamento": "acessorio",
        "descricao": "Adorno de metal sem efeito mecânico.",
        "negociavel": true
      }
    },
    {
      "id": "item.arco-longo",
      "revisao": 1,
      "definicao": {
        "nome": "Arco longo",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "arco_longo",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "distancia",
          "duas_maos",
          "pesada",
          "municao"
        ],
        "preco": {
          "valor": 50,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "arma_distancia",
        "duasMaos": true,
        "leve": false,
        "descricao": "Duas mãos; consome uma flecha; 1d8 perfurante. Alcance limitado a 18 m pela campanha.",
        "modelosAcoes": [
          {
            "modo": "distancia",
            "alcanceNormalM": 18,
            "alcanceM": 18,
            "dano": "1d8",
            "tipoDano": "perfurante",
            "municao": "victor-flechas-20"
          }
        ],
        "negociavel": true
      }
    },
    {
      "id": "item.arco-longo-ac372e50",
      "revisao": 1,
      "definicao": {
        "nome": "Arco Longo",
        "descricao": "Ataque +7; dano 1d8+3 perfurante; 45/180 m. Lentidão.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 1,
        "slotEquipamento": "arma_distancia",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "arco-longo-7-acao-0"
        ],
        "tipoArma": "arco_longo",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "distancia",
          "duas_maos",
          "pesada",
          "municao"
        ],
        "modelosAcoes": [
          {
            "modo": "distancia",
            "alcanceNormalM": 18,
            "alcanceM": 18,
            "dano": "1d8",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 50,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.arco-longo-c8ca3a0f",
      "revisao": 1,
      "definicao": {
        "nome": "Arco longo",
        "descricao": "Arquearia; ataque +7, dano 1d8+3 perfurante; maestria Lentidão.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 1,
        "slotEquipamento": "arma_distancia",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "arco-longo-7-acao-0"
        ],
        "tipoArma": "arco_longo",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "distancia",
          "duas_maos",
          "pesada",
          "municao"
        ],
        "modelosAcoes": [
          {
            "modo": "distancia",
            "alcanceNormalM": 18,
            "alcanceM": 18,
            "dano": "1d8",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 50,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.armadura-couro-batido",
      "revisao": 1,
      "definicao": {
        "nome": "Armadura Couro Batido",
        "descricao": "CA 13",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 6.5,
        "slotEquipamento": "vestes",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "categoriaArmadura": "leve",
        "classeArmadura": {
          "tipo": "base",
          "valor": 13,
          "classe": "leve"
        },
        "preco": {
          "valor": 45,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.armadura-de-couro",
      "revisao": 1,
      "definicao": {
        "nome": "Armadura de Couro",
        "descricao": "CA 11 + DES = 13.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 5,
        "slotEquipamento": "vestes",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "categoriaArmadura": "leve",
        "classeArmadura": {
          "tipo": "base",
          "valor": 11,
          "classe": "leve",
          "atributo": "des"
        },
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.armadura-de-couro-batido",
      "revisao": 1,
      "definicao": {
        "nome": "Armadura de Couro Batido",
        "descricao": "CA 12 + DES = 15. Sem penalidade em Furtividade.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 6.5,
        "slotEquipamento": "vestes",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "categoriaArmadura": "leve",
        "classeArmadura": {
          "tipo": "base",
          "valor": 12,
          "classe": "leve",
          "atributo": "des"
        },
        "preco": {
          "valor": 45,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.armadura-de-placas",
      "revisao": 1,
      "definicao": {
        "nome": "Armadura de placas",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 1500,
          "moeda": "po"
        },
        "pesoKg": 32.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "pesada",
        "classeArmadura": {
          "tipo": "base",
          "valor": 18,
          "classe": "pesada"
        },
        "requisitos": {
          "forca": 15
        },
        "penalidades": {
          "furtividade": "desvantagem"
        },
        "descricao": "Armadura pesada. CA 18; FOR 15 para manter o deslocamento; desvantagem em Furtividade.",
        "negociavel": true
      }
    },
    {
      "id": "item.azagaia",
      "revisao": 1,
      "definicao": {
        "nome": "Azagaia",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "azagaia",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "arremessavel"
        ],
        "preco": {
          "valor": 5,
          "moeda": "pp"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": false,
        "descricao": "Uma mão; 1d6 perfurante; corpo a corpo ou arremesso.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 9,
            "alcanceM": 18,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true
      }
    },
    {
      "id": "item.azagaia-08b3b538",
      "revisao": 1,
      "definicao": {
        "nome": "Azagaia",
        "descricao": "Ataque +5; dano 1d6+3 perfurante; arremesso 9/36 m. Maestria Lentidão.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 0.9,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "azagaia-5-acao-2",
          "azagaia-5-acao-2-arremesso"
        ],
        "tipoArma": "azagaia",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "arremessavel"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 9,
            "alcanceM": 18,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 5,
          "moeda": "pp"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.azagaia-fafdb711",
      "revisao": 1,
      "definicao": {
        "nome": "Azagaia",
        "descricao": "Ataque +5; dano 1d6+3 perfurante; arremesso 9/36 m. Maestria Lentidão.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 0.9,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [],
        "tipoArma": "azagaia",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "arremessavel"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 9,
            "alcanceM": 18,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 5,
          "moeda": "pp"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.botas-de-marcha-par",
      "revisao": 1,
      "definicao": {
        "nome": "Botas de marcha (par)",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "botas",
        "descricao": "Calçado de viagem.",
        "negociavel": true
      }
    },
    {
      "id": "item.camisa-de-malha",
      "revisao": 1,
      "definicao": {
        "nome": "Camisa de malha",
        "descricao": "Armadura média. CA 13 + DES, máximo +2 de DES.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 10,
        "slotEquipamento": "vestes",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "categoriaArmadura": "media",
        "classeArmadura": {
          "tipo": "base",
          "valor": 13,
          "classe": "media",
          "atributo": "des",
          "limiteAtributo": 2
        },
        "preco": {
          "valor": 50,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.camisao-de-malha",
      "revisao": 1,
      "definicao": {
        "nome": "Camisão de malha",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 50,
          "moeda": "po"
        },
        "pesoKg": 10,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "media",
        "classeArmadura": {
          "tipo": "base",
          "valor": 13,
          "classe": "media",
          "atributo": "des",
          "limiteAtributo": 2
        },
        "descricao": "Armadura média. CA 13 + DES, máximo +2 de DES.",
        "negociavel": true
      }
    },
    {
      "id": "item.capa-de-viagem",
      "revisao": 1,
      "definicao": {
        "nome": "Capa de viagem",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "capa",
        "descricao": "Protege a roupa da poeira e do tempo.",
        "negociavel": true
      }
    },
    {
      "id": "item.cimitarra",
      "revisao": 1,
      "definicao": {
        "nome": "Cimitarra",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "cimitarra",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve"
        ],
        "preco": {
          "valor": 25,
          "moeda": "po"
        },
        "pesoKg": 1.5,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "Uma mão; 1d6 cortante.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "cortante"
          }
        ],
        "negociavel": true
      }
    },
    {
      "id": "item.cimitarra-1a29ab83",
      "revisao": 1,
      "definicao": {
        "nome": "Cimitarra",
        "descricao": "Acuidade, Leve; maestria Ágil; ataque +5, dano 1d6+3 cortante.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 1.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "cimitarra-5-acao-1"
        ],
        "tipoArma": "cimitarra",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "cortante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 25,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.cimitarra-73899783",
      "revisao": 1,
      "definicao": {
        "nome": "Cimitarra",
        "descricao": "Ataque +5; dano 1d6+3 cortante. Ágil.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 1.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "cimitarra-5-acao-1"
        ],
        "tipoArma": "cimitarra",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "cortante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 25,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.colar-simples-de-oficina",
      "revisao": 1,
      "definicao": {
        "nome": "Colar simples de oficina",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "pesoKg": 0.1,
        "slotEquipamento": "colar",
        "descricao": "Adorno de metal sem efeito mecânico.",
        "negociavel": true
      }
    },
    {
      "id": "item.corrente-3-m",
      "revisao": 1,
      "definicao": {
        "nome": "Corrente (3 m)",
        "tipo": "etc",
        "categoria": "ferramenta",
        "preco": {
          "valor": 5,
          "moeda": "po"
        },
        "pesoKg": 5,
        "empilhavel": true,
        "descricao": "Corrente metálica reutilizável para prender ou amarrar.",
        "negociavel": true
      }
    },
    {
      "id": "item.cota-de-malha",
      "revisao": 1,
      "definicao": {
        "nome": "Cota de malha",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 75,
          "moeda": "po"
        },
        "pesoKg": 27.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "pesada",
        "classeArmadura": {
          "tipo": "base",
          "valor": 16,
          "classe": "pesada"
        },
        "requisitos": {
          "forca": 13
        },
        "penalidades": {
          "furtividade": "desvantagem"
        },
        "descricao": "Armadura pesada. CA 16; FOR 13 para manter o deslocamento; desvantagem em Furtividade.",
        "negociavel": true
      }
    },
    {
      "id": "item.cota-de-malha-09004bac",
      "revisao": 1,
      "definicao": {
        "nome": "Cota de Malha",
        "descricao": "CA 16. Exige FOR 13. Desvantagem em Furtividade.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 27.5,
        "slotEquipamento": "vestes",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "categoriaArmadura": "pesada",
        "classeArmadura": {
          "tipo": "base",
          "valor": 16,
          "classe": "pesada"
        },
        "preco": {
          "valor": 75,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.couro-batido",
      "revisao": 1,
      "definicao": {
        "nome": "Couro batido",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 45,
          "moeda": "po"
        },
        "pesoKg": 6.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "leve",
        "classeArmadura": {
          "tipo": "base",
          "valor": 12,
          "classe": "leve",
          "atributo": "des"
        },
        "descricao": "Armadura leve. CA 12 + DES.",
        "negociavel": true
      }
    },
    {
      "id": "item.escudo",
      "revisao": 1,
      "definicao": {
        "nome": "Escudo",
        "tipo": "equipamento",
        "categoria": "escudo",
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "pesoKg": 3,
        "slotEquipamento": "mao_fraca",
        "categoriaArmadura": "escudo",
        "classeArmadura": {
          "tipo": "bonus",
          "valor": 2,
          "classe": "escudo"
        },
        "descricao": "Empunhado na mão fraca. +2 à CA; conta como armadura para Armadura Arcana.",
        "negociavel": true
      }
    },
    {
      "id": "item.escudo-b66123ac",
      "revisao": 1,
      "definicao": {
        "nome": "Escudo",
        "descricao": "Empunhado na mão fraca. +2 à CA.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 3,
        "slotEquipamento": "mao_fraca",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [],
        "categoriaArmadura": "escudo",
        "classeArmadura": {
          "tipo": "bonus",
          "valor": 2,
          "classe": "escudo"
        },
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.espada-curta",
      "revisao": 1,
      "definicao": {
        "nome": "Espada curta",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "espada_curta",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve"
        ],
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "Uma mão; 1d6 perfurante.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true
      }
    },
    {
      "id": "item.espada-curta-56f7a9ea",
      "revisao": 1,
      "definicao": {
        "nome": "Espada curta",
        "descricao": "Reserva, 1d6+2.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "321df1de-4158-5c5a-9950-df5fa62cefb8"
        ],
        "tipoArma": "espada_curta",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.espada-curta-60162bf7",
      "revisao": 1,
      "definicao": {
        "nome": "Espada Curta",
        "descricao": "Ataque extra +5; dano 1d6 perfurante.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "espada-curta-5-acao-ataque-principal-2",
          "espada-curta-extra-5-na-acao-atacar-agil-3"
        ],
        "tipoArma": "espada_curta",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.espada-grande",
      "revisao": 1,
      "definicao": {
        "nome": "Espada grande",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "espada_grande",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "duas_maos",
          "pesada"
        ],
        "preco": {
          "valor": 50,
          "moeda": "po"
        },
        "pesoKg": 3,
        "slotEquipamento": "mao_forte",
        "duasMaos": true,
        "leve": false,
        "descricao": "Duas mãos; 2d6 cortante.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "2d6",
            "tipoDano": "cortante"
          }
        ],
        "negociavel": true
      }
    },
    {
      "id": "item.espada-grande-22d63c5a",
      "revisao": 1,
      "definicao": {
        "nome": "Espada Grande",
        "descricao": "Ataque +5; dano 2d6+3 cortante. Maestria Garantido.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 3,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "espada-grande-5-acao-0"
        ],
        "tipoArma": "espada_grande",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "duas_maos",
          "pesada"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "2d6",
            "tipoDano": "cortante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 50,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.fantasia-e-roupas-finas",
      "revisao": 1,
      "definicao": {
        "nome": "Fantasia e roupas finas",
        "descricao": "Do antecedente Charlatão. Úteis para golpes e disfarces.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 3,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 20,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.ferramentas-de-entalhador",
      "revisao": 1,
      "definicao": {
        "nome": "Ferramentas de Entalhador",
        "descricao": "Proficiência do Monge.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 2.5,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.ferramentas-de-ferreiro",
      "revisao": 1,
      "definicao": {
        "nome": "Ferramentas de ferreiro",
        "tipo": "etc",
        "categoria": "ferramenta",
        "preco": {
          "valor": 20,
          "moeda": "po"
        },
        "pesoKg": 4,
        "empilhavel": false,
        "descricao": "Kit para moldar, fabricar e reparar peças de metal.",
        "negociavel": true
      }
    },
    {
      "id": "item.flechas-20",
      "revisao": 1,
      "definicao": {
        "nome": "Flechas (20)",
        "tipo": "etc",
        "categoria": "municao",
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "pesoKg": 0.5,
        "empilhavel": true,
        "descricao": "Munição para 20 disparos com arco.",
        "negociavel": true
      }
    },
    {
      "id": "item.foco-arcano-cristal",
      "revisao": 1,
      "definicao": {
        "nome": "Foco Arcano (cristal)",
        "descricao": "Foco de conjuração.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 0.1,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.foco-druidico-ramo-de-visco",
      "revisao": 1,
      "definicao": {
        "nome": "Foco Druídico (ramo de visco)",
        "descricao": "Foco de conjuração.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 0.1,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.foice",
      "revisao": 1,
      "definicao": {
        "nome": "Foice",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "foice",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "leve"
        ],
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "Uma mão; 1d4 cortante.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "cortante"
          }
        ],
        "negociavel": true
      }
    },
    {
      "id": "item.foice-d37bf5bc",
      "revisao": 1,
      "definicao": {
        "nome": "Foice",
        "descricao": "Ataque +1; dano 1d4-1 cortante.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 0.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "foice-1-acao-2"
        ],
        "tipoArma": "foice",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "leve"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "cortante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.kit-de-artista",
      "revisao": 1,
      "definicao": {
        "nome": "Kit de Artista",
        "descricao": "Mochila, caixa para fogo, cantil, espelho, 3 fantasias, lanterna foca-facho, 8 potes de óleo, 9 dias de rações, saco de dormir, sino.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 17,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 40,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.kit-de-aventureiro",
      "revisao": 1,
      "definicao": {
        "nome": "Kit de Aventureiro",
        "descricao": "Mantido com a denominação do texto; conteúdo e saldo de ouro não especificados.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 20,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.kit-de-aventureiro-49ab062c",
      "revisao": 1,
      "definicao": {
        "nome": "Kit de Aventureiro",
        "descricao": "Mochila, caixa para fogo, cantil, corda, 2 potes de óleo, 10 dias de rações, saco de dormir, 10 tochas.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 20,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.kit-de-explorador-de-masmorras",
      "revisao": 1,
      "definicao": {
        "nome": "Kit de Explorador de Masmorras",
        "descricao": "Mochila, caixa para fogo, cantil, corda, estrepes, 2 potes de óleo, pé de cabra, 10 dias de rações, 10 tochas.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 27.5,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 12,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.kit-de-falsificacao",
      "revisao": 1,
      "definicao": {
        "nome": "Kit de Falsificação",
        "descricao": "Cria documentos, selos e assinaturas falsos.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 2.5,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 15,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.lanca",
      "revisao": 1,
      "definicao": {
        "nome": "Lança",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "lanca",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "versatil",
          "arremessavel"
        ],
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "pesoKg": 1.5,
        "slotEquipamento": "mao_forte",
        "leve": false,
        "descricao": "Uma ou duas mãos; 1d6 perfurante, 1d8 quando usada com duas mãos; arremessável com uma mão.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "danoDuasMaos": "1d8",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true
      }
    },
    {
      "id": "item.lanca-0d22cfed",
      "revisao": 1,
      "definicao": {
        "nome": "Lança",
        "descricao": "Ataque +2; dano 1d6 perfurante (1d8 com duas mãos).",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 1.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "631ebb73-ecdc-5df0-8524-ee8810e1dec6",
          "eb1e3e85-d216-544d-8954-deb312f465a1",
          "eb1e3e85-d216-544d-8954-deb312f465a1-arremesso"
        ],
        "tipoArma": "lanca",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "versatil",
          "arremessavel"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "danoDuasMaos": "1d8",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.lanca-195daaea",
      "revisao": 1,
      "definicao": {
        "nome": "Lança",
        "descricao": "Ataque +5; 1d8+3 perfurante com duas mãos, 1d6+3 com uma; arremesso 6/18 m.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 1.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "lanca-em-duas-maos-5-acao-0",
          "lanca-em-uma-mao-5-acao-4",
          "lanca-em-uma-mao-5-acao-4-arremesso"
        ],
        "tipoArma": "lanca",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "versatil",
          "arremessavel"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "danoDuasMaos": "1d8",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.lanca-eb5c1aa0",
      "revisao": 1,
      "definicao": {
        "nome": "Lança",
        "descricao": "Uma mão e escudo; 1d6+2.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 1.5,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "58bec1ed-2568-594c-8627-9f4b0e79c615",
          "58bec1ed-2568-594c-8627-9f4b0e79c615-arremesso"
        ],
        "tipoArma": "lanca",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "versatil",
          "arremessavel"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "danoDuasMaos": "1d8",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.livro-das-sombras",
      "revisao": 1,
      "definicao": {
        "nome": "Livro das Sombras",
        "descricao": "Pacto do Tomo: truques e rituais extras; também serve de foco.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 1.5,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 25,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.livro-de-ocultismo-e-kit-de-estudioso",
      "revisao": 1,
      "definicao": {
        "nome": "Livro de ocultismo e Kit de Estudioso",
        "descricao": "Pacote inicial do Bruxo.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 7,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 65,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.luvas-de-treino-par",
      "revisao": 1,
      "definicao": {
        "nome": "Luvas de treino (par)",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "pesoKg": 0.25,
        "slotEquipamento": "acessorio",
        "descricao": "Protegem as mãos durante o treino.",
        "negociavel": true
      }
    },
    {
      "id": "item.mangual",
      "revisao": 1,
      "definicao": {
        "nome": "Mangual",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "mangual",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo"
        ],
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": false,
        "descricao": "Uma mão; 1d8 contundente.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d8",
            "tipoDano": "contundente"
          }
        ],
        "negociavel": true
      }
    },
    {
      "id": "item.mangual-8d7c8a26",
      "revisao": 1,
      "definicao": {
        "nome": "Mangual",
        "descricao": "Ataque +5; dano 1d8+3 contundente. Maestria Drenar.",
        "tipo": "equipamento",
        "empilhavel": false,
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "acoes": [
          "mangual-5-acao-1"
        ],
        "tipoArma": "mangual",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo"
        ],
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d8",
            "tipoDano": "contundente"
          }
        ],
        "categoria": "arma",
        "preco": {
          "valor": 10,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.moedas-11-po",
      "revisao": 1,
      "definicao": {
        "nome": "Moedas — 11 PO",
        "descricao": "Saldo do kit inicial do Monge (opção A).",
        "tipo": "moeda",
        "empilhavel": true,
        "pesoKg": 0.01,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "moeda": "po",
        "valorMoedaPc": 100,
        "negociavel": false
      }
    },
    {
      "id": "item.moedas-19-po",
      "revisao": 1,
      "definicao": {
        "nome": "Moedas — 19 PO",
        "descricao": "Saldo do kit inicial do Bardo (opção A).",
        "tipo": "moeda",
        "empilhavel": true,
        "pesoKg": 0.01,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "moeda": "po",
        "valorMoedaPc": 100,
        "negociavel": false
      }
    },
    {
      "id": "item.moedas-28-po",
      "revisao": 1,
      "definicao": {
        "nome": "Moedas — 28 PO",
        "descricao": "Saldo do kit inicial do Feiticeiro (opção A).",
        "tipo": "moeda",
        "empilhavel": true,
        "pesoKg": 0.01,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "moeda": "po",
        "valorMoedaPc": 100,
        "negociavel": false
      }
    },
    {
      "id": "item.moedas-30-po",
      "revisao": 1,
      "definicao": {
        "nome": "Moedas — 30 PO",
        "descricao": "Conforme a ficha.",
        "tipo": "moeda",
        "empilhavel": true,
        "pesoKg": 0.01,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "moeda": "po",
        "valorMoedaPc": 100,
        "negociavel": false
      }
    },
    {
      "id": "item.moedas-4-po",
      "revisao": 1,
      "definicao": {
        "nome": "Moedas — 4 PO",
        "descricao": "Saldo inicial do kit do Guerreiro.",
        "tipo": "moeda",
        "empilhavel": true,
        "pesoKg": 0.01,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "moeda": "po",
        "valorMoedaPc": 100,
        "negociavel": false
      }
    },
    {
      "id": "item.moedas-7-po",
      "revisao": 1,
      "definicao": {
        "nome": "Moedas — 7 PO",
        "descricao": "Saldo do kit inicial do Guardião (opção A).",
        "tipo": "moeda",
        "empilhavel": true,
        "pesoKg": 0.01,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "moeda": "po",
        "valorMoedaPc": 100,
        "negociavel": false
      }
    },
    {
      "id": "item.moedas-de-ouro",
      "revisao": 1,
      "definicao": {
        "nome": "Moedas",
        "descricao": "Saldo monetário expresso em peças de ouro; frações representam prata e cobre.",
        "tipo": "moeda",
        "empilhavel": true,
        "moeda": "po",
        "valorMoedaPc": 100,
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "negociavel": false,
        "pesoKg": 0.01,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {}
      }
    },
    {
      "id": "item.orbe-foco-arcano",
      "revisao": 1,
      "definicao": {
        "nome": "Orbe (foco arcano)",
        "descricao": "Foco de conjuração.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 1.5,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 20,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.pacote-de-explorador-de-masmorras",
      "revisao": 1,
      "definicao": {
        "nome": "Pacote de Explorador de Masmorras",
        "descricao": "Kit inicial do Guerreiro.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 27.5,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 12,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.pe-de-cabra",
      "revisao": 1,
      "definicao": {
        "nome": "Pé de cabra",
        "tipo": "etc",
        "categoria": "ferramenta",
        "preco": {
          "valor": 2,
          "moeda": "po"
        },
        "pesoKg": 2.5,
        "empilhavel": false,
        "efeitoCondicional": {
          "teste": "for",
          "modo": "vantagem",
          "condicao": "quando a alavanca puder ajudar"
        },
        "descricao": "Concede vantagem em testes de FOR quando puder ser usado como alavanca.",
        "negociavel": true
      }
    },
    {
      "id": "item.veste-simples",
      "revisao": 1,
      "definicao": {
        "nome": "Veste simples",
        "tipo": "equipamento",
        "categoria": "veste",
        "preco": {
          "valor": 1,
          "moeda": "po"
        },
        "pesoKg": 1.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "veste",
        "classeArmadura": {
          "tipo": "base",
          "valor": 10,
          "classe": "veste",
          "atributo": "des"
        },
        "descricao": "Roupa de corpo inteiro. Não conta como armadura para Armadura Arcana.",
        "negociavel": true
      }
    },
    {
      "id": "item.violino",
      "revisao": 1,
      "definicao": {
        "nome": "Violino",
        "descricao": "Instrumento escolhido do kit (assumido); foco de conjuração e instrumento do talento Músico.",
        "tipo": "etc",
        "empilhavel": false,
        "pesoKg": 0.5,
        "slotEquipamento": null,
        "duasMaos": false,
        "leve": false,
        "modificadores": {},
        "preco": {
          "valor": 30,
          "moeda": "po"
        },
        "negociavel": true
      }
    },
    {
      "id": "item.la-arte.azagaia-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Azagaia +1",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "azagaia",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "arremessavel"
        ],
        "preco": {
          "valor": 415,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": false,
        "descricao": "+1 ao acerto e ao dano.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 9,
            "alcanceM": 18,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true,
        "raridade": "incomum",
        "bonusMagico": 1,
        "bonusDano": 1
      }
    },
    {
      "id": "item.la-arte.foice-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Foice +1",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "foice",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "leve"
        ],
        "preco": {
          "valor": 420,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "+1 ao acerto e ao dano.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "cortante"
          }
        ],
        "negociavel": true,
        "raridade": "incomum",
        "bonusMagico": 1,
        "bonusDano": 1
      }
    },
    {
      "id": "item.la-arte.lanca-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Lança +1",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "lanca",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "versatil",
          "arremessavel"
        ],
        "preco": {
          "valor": 450,
          "moeda": "po"
        },
        "pesoKg": 1.5,
        "slotEquipamento": "mao_forte",
        "leve": false,
        "descricao": "+1 ao acerto e ao dano.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "danoDuasMaos": "1d8",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true,
        "raridade": "incomum",
        "bonusMagico": 1,
        "bonusDano": 1
      }
    },
    {
      "id": "item.la-arte.adaga-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga +1",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "adaga",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve",
          "arremessavel"
        ],
        "preco": {
          "valor": 440,
          "moeda": "po"
        },
        "pesoKg": 0.5,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "+1 ao acerto e ao dano.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d4",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true,
        "raridade": "incomum",
        "bonusMagico": 1,
        "bonusDano": 1
      }
    },
    {
      "id": "item.la-arte.espada-curta-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Espada curta +1",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "espada_curta",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve"
        ],
        "preco": {
          "valor": 465,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "+1 ao acerto e ao dano.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true,
        "raridade": "incomum",
        "bonusMagico": 1,
        "bonusDano": 1
      }
    },
    {
      "id": "item.la-arte.mangual-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Mangual +1",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "mangual",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo"
        ],
        "preco": {
          "valor": 455,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": false,
        "descricao": "+1 ao acerto e ao dano.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d8",
            "tipoDano": "contundente"
          }
        ],
        "negociavel": true,
        "raridade": "incomum",
        "bonusMagico": 1,
        "bonusDano": 1
      }
    },
    {
      "id": "item.la-arte.cimitarra-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Cimitarra +1",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "cimitarra",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve"
        ],
        "preco": {
          "valor": 490,
          "moeda": "po"
        },
        "pesoKg": 1.5,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "+1 ao acerto e ao dano.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "cortante"
          }
        ],
        "negociavel": true,
        "raridade": "incomum",
        "bonusMagico": 1,
        "bonusDano": 1
      }
    },
    {
      "id": "item.la-arte.arco-longo-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Arco longo +1",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "arco_longo",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "distancia",
          "duas_maos",
          "pesada",
          "municao"
        ],
        "preco": {
          "valor": 540,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "arma_distancia",
        "duasMaos": true,
        "leve": false,
        "descricao": "+1 ao acerto e ao dano.",
        "modelosAcoes": [
          {
            "modo": "distancia",
            "alcanceNormalM": 18,
            "alcanceM": 18,
            "dano": "1d8",
            "tipoDano": "perfurante",
            "municao": "victor-flechas-20"
          }
        ],
        "negociavel": true,
        "raridade": "incomum",
        "bonusMagico": 1,
        "bonusDano": 1
      }
    },
    {
      "id": "item.la-arte.espada-grande-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Espada grande +1",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "espada_grande",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "duas_maos",
          "pesada"
        ],
        "preco": {
          "valor": 535,
          "moeda": "po"
        },
        "pesoKg": 3,
        "slotEquipamento": "mao_forte",
        "duasMaos": true,
        "leve": false,
        "descricao": "+1 ao acerto e ao dano.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "2d6",
            "tipoDano": "cortante"
          }
        ],
        "negociavel": true,
        "raridade": "incomum",
        "bonusMagico": 1,
        "bonusDano": 1
      }
    },
    {
      "id": "item.la-arte.veste-bolsos-oficina",
      "revisao": 1,
      "definicao": {
        "nome": "Veste dos Bolsos de Oficina",
        "tipo": "equipamento",
        "categoria": "veste",
        "preco": {
          "valor": 430,
          "moeda": "po"
        },
        "pesoKg": 1.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "veste",
        "classeArmadura": {
          "tipo": "base",
          "valor": 10,
          "classe": "veste",
          "atributo": "des"
        },
        "descricao": "Guarda até 15 kg em um bolso extradimensional; o conteúdo pesa 1 kg para o portador.",
        "negociavel": true,
        "raridade": "incomum"
      }
    },
    {
      "id": "item.la-arte.veste-ultimo-folego",
      "revisao": 1,
      "definicao": {
        "nome": "Veste do Último Fôlego",
        "tipo": "equipamento",
        "categoria": "veste",
        "preco": {
          "valor": 440,
          "moeda": "po"
        },
        "pesoKg": 1.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "veste",
        "classeArmadura": {
          "tipo": "base",
          "valor": 10,
          "classe": "veste",
          "atributo": "des"
        },
        "descricao": "Reação ao sofrer dano, 1 uso por descanso longo: reduza o dano em 1d6.",
        "negociavel": true,
        "raridade": "incomum"
      }
    },
    {
      "id": "item.la-arte.couro-passo-macio",
      "revisao": 1,
      "definicao": {
        "nome": "Couro do Passo Macio",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 485,
          "moeda": "po"
        },
        "pesoKg": 6.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "leve",
        "classeArmadura": {
          "tipo": "base",
          "valor": 12,
          "classe": "leve",
          "atributo": "des"
        },
        "descricao": "Armadura leve, CA 12 + DES e +1 em testes de Furtividade.",
        "negociavel": true,
        "raridade": "incomum",
        "modificadores": {
          "furtividade": 1
        }
      }
    },
    {
      "id": "item.la-arte.camisao-malha-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Camisão de malha +1",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 530,
          "moeda": "po"
        },
        "pesoKg": 10,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "media",
        "classeArmadura": {
          "tipo": "base",
          "valor": 14,
          "classe": "media",
          "atributo": "des",
          "limiteAtributo": 2
        },
        "descricao": "Armadura média, CA 14 + DES (máximo +2).",
        "negociavel": true,
        "raridade": "incomum"
      }
    },
    {
      "id": "item.la-arte.cota-malha-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Cota de malha +1",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 560,
          "moeda": "po"
        },
        "pesoKg": 27.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "pesada",
        "classeArmadura": {
          "tipo": "base",
          "valor": 17,
          "classe": "pesada"
        },
        "requisitos": {
          "forca": 13
        },
        "penalidades": {
          "furtividade": "desvantagem"
        },
        "descricao": "Armadura pesada, CA 17; FOR 13; desvantagem em Furtividade.",
        "negociavel": true,
        "raridade": "incomum"
      }
    },
    {
      "id": "item.la-arte.placas-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Armadura de placas +1",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 2000,
          "moeda": "po"
        },
        "pesoKg": 32.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "pesada",
        "classeArmadura": {
          "tipo": "base",
          "valor": 19,
          "classe": "pesada"
        },
        "requisitos": {
          "forca": 15
        },
        "penalidades": {
          "furtividade": "desvantagem"
        },
        "descricao": "Armadura pesada, CA 19; FOR 15; desvantagem em Furtividade.",
        "negociavel": true,
        "raridade": "incomum"
      }
    },
    {
      "id": "item.la-arte.escudo-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Escudo +1",
        "tipo": "equipamento",
        "categoria": "escudo",
        "preco": {
          "valor": 510,
          "moeda": "po"
        },
        "pesoKg": 3,
        "slotEquipamento": "mao_fraca",
        "categoriaArmadura": "escudo",
        "classeArmadura": {
          "tipo": "bonus",
          "valor": 3,
          "classe": "escudo"
        },
        "descricao": "Empunhado na mão fraca. Concede +3 à CA.",
        "negociavel": true,
        "raridade": "incomum"
      }
    },
    {
      "id": "item.la-arte.anel-mao-firme",
      "revisao": 1,
      "definicao": {
        "nome": "Anel da Mão Firme",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 425,
          "moeda": "po"
        },
        "pesoKg": 0.02,
        "slotEquipamento": "acessorio",
        "descricao": "+1 em testes para abrir fechaduras com ferramentas de ladrão.",
        "negociavel": true,
        "raridade": "incomum",
        "modificadores": {
          "abrirFechaduras": 1
        }
      }
    },
    {
      "id": "item.la-arte.colar-folego-docas",
      "revisao": 1,
      "definicao": {
        "nome": "Colar do Fôlego das Docas",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 430,
          "moeda": "po"
        },
        "pesoKg": 0.1,
        "slotEquipamento": "colar",
        "descricao": "Ação bônus, 1 uso por descanso longo: respire debaixo d’água por 10 minutos.",
        "negociavel": true,
        "raridade": "incomum"
      }
    },
    {
      "id": "item.la-arte.colar-vigia",
      "revisao": 1,
      "definicao": {
        "nome": "Colar do Vigia",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 470,
          "moeda": "po"
        },
        "pesoKg": 0.1,
        "slotEquipamento": "colar",
        "descricao": "Concede +1 à iniciativa.",
        "negociavel": true,
        "raridade": "incomum",
        "modificadores": {
          "iniciativa": 1
        }
      }
    },
    {
      "id": "item.la-arte.capa-mensageiro",
      "revisao": 1,
      "definicao": {
        "nome": "Capa do Mensageiro",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 420,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "capa",
        "descricao": "Ao usar Disparada, 1 uso por descanso curto ou longo: percorra mais 3 m no turno.",
        "negociavel": true,
        "raridade": "incomum"
      }
    },
    {
      "id": "item.la-arte.luvas-guarda-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Luvas da Guarda +1",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 500,
          "moeda": "po"
        },
        "pesoKg": 0.25,
        "slotEquipamento": "acessorio",
        "descricao": "Sem armadura, concede +1 à CA.",
        "negociavel": true,
        "raridade": "incomum",
        "modificadoresCondicionais": {
          "semArmadura": {
            "ca": 1
          }
        }
      }
    },
    {
      "id": "item.la-arte.botas-passo-livre-mais-1",
      "revisao": 1,
      "definicao": {
        "nome": "Botas do Passo Livre +1",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 445,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "botas",
        "descricao": "Ignore o custo extra de terreno difícil não mágico.",
        "negociavel": true,
        "raridade": "incomum"
      }
    },
    {
      "id": "item.la-arte.azagaia-para-raios-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Azagaia do Para-raios +2",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "azagaia",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "arremessavel"
        ],
        "preco": {
          "valor": 1120,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": false,
        "descricao": "+2 ao acerto e 1d4 de dano raio por acerto.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 9,
            "alcanceM": 18,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true,
        "raridade": "raro",
        "bonusMagico": 2,
        "bonusDano": 0,
        "danoExtraAoAcertar": {
          "formula": "1d4",
          "elemento": "raio",
          "critico": false
        }
      }
    },
    {
      "id": "item.la-arte.foice-geada-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Foice da Geada +2",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "foice",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "leve"
        ],
        "preco": {
          "valor": 1110,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "+2 ao acerto e 1d4 de dano frio por acerto.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "cortante"
          }
        ],
        "negociavel": true,
        "raridade": "raro",
        "bonusMagico": 2,
        "bonusDano": 0,
        "danoExtraAoAcertar": {
          "formula": "1d4",
          "elemento": "frio",
          "critico": false
        }
      }
    },
    {
      "id": "item.la-arte.lanca-abalo-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Lança do Abalo +2",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "lanca",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "versatil",
          "arremessavel"
        ],
        "preco": {
          "valor": 1190,
          "moeda": "po"
        },
        "pesoKg": 1.5,
        "slotEquipamento": "mao_forte",
        "leve": false,
        "descricao": "+2 ao acerto e 1d4 de dano contundente por acerto.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "danoDuasMaos": "1d8",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true,
        "raridade": "raro",
        "bonusMagico": 2,
        "bonusDano": 0,
        "danoExtraAoAcertar": {
          "formula": "1d4",
          "elemento": "contundente",
          "critico": false
        }
      }
    },
    {
      "id": "item.la-arte.adaga-brasa-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Adaga da Brasa +2",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "adaga",
        "grupoProficiencia": "simples",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve",
          "arremessavel"
        ],
        "preco": {
          "valor": 1170,
          "moeda": "po"
        },
        "pesoKg": 0.5,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "+2 ao acerto e 1d4 de dano fogo por acerto.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d4",
            "tipoDano": "perfurante"
          },
          {
            "modo": "arremesso",
            "alcanceNormalM": 6,
            "alcanceM": 18,
            "dano": "1d4",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true,
        "raridade": "raro",
        "bonusMagico": 2,
        "bonusDano": 0,
        "danoExtraAoAcertar": {
          "formula": "1d4",
          "elemento": "fogo",
          "critico": false
        }
      }
    },
    {
      "id": "item.la-arte.espada-curta-escarcha-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Espada Curta da Escarcha +2",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "espada_curta",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve"
        ],
        "preco": {
          "valor": 1230,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "+2 ao acerto e 1d4 de dano frio por acerto.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "perfurante"
          }
        ],
        "negociavel": true,
        "raridade": "raro",
        "bonusMagico": 2,
        "bonusDano": 0,
        "danoExtraAoAcertar": {
          "formula": "1d4",
          "elemento": "frio",
          "critico": false
        }
      }
    },
    {
      "id": "item.la-arte.mangual-basalto-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Mangual de Basalto +2",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "mangual",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo"
        ],
        "preco": {
          "valor": 1200,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "mao_forte",
        "leve": false,
        "descricao": "+2 ao acerto e 1d4 de dano contundente por acerto.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d8",
            "tipoDano": "contundente"
          }
        ],
        "negociavel": true,
        "raridade": "raro",
        "bonusMagico": 2,
        "bonusDano": 0,
        "danoExtraAoAcertar": {
          "formula": "1d4",
          "elemento": "contundente",
          "critico": false
        }
      }
    },
    {
      "id": "item.la-arte.cimitarra-fornalha-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Cimitarra da Fornalha +2",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "cimitarra",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "acuidade",
          "leve"
        ],
        "preco": {
          "valor": 1300,
          "moeda": "po"
        },
        "pesoKg": 1.5,
        "slotEquipamento": "mao_forte",
        "leve": true,
        "descricao": "+2 ao acerto e 1d4 de dano fogo por acerto.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "1d6",
            "tipoDano": "cortante"
          }
        ],
        "negociavel": true,
        "raridade": "raro",
        "bonusMagico": 2,
        "bonusDano": 0,
        "danoExtraAoAcertar": {
          "formula": "1d4",
          "elemento": "fogo",
          "critico": false
        }
      }
    },
    {
      "id": "item.la-arte.arco-longo-tempestade-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Arco Longo da Tempestade +2",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "arco_longo",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "distancia",
          "duas_maos",
          "pesada",
          "municao"
        ],
        "preco": {
          "valor": 1410,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "arma_distancia",
        "duasMaos": true,
        "leve": false,
        "descricao": "+2 ao acerto e 1d4 de dano raio por acerto.",
        "modelosAcoes": [
          {
            "modo": "distancia",
            "alcanceNormalM": 18,
            "alcanceM": 18,
            "dano": "1d8",
            "tipoDano": "perfurante",
            "municao": "victor-flechas-20"
          }
        ],
        "negociavel": true,
        "raridade": "raro",
        "bonusMagico": 2,
        "bonusDano": 0,
        "danoExtraAoAcertar": {
          "formula": "1d4",
          "elemento": "raio",
          "critico": false
        }
      }
    },
    {
      "id": "item.la-arte.espada-grande-falha-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Espada Grande da Falha +2",
        "tipo": "equipamento",
        "categoria": "arma",
        "tipoArma": "espada_grande",
        "grupoProficiencia": "marcial",
        "propriedades": [
          "corpo_a_corpo",
          "duas_maos",
          "pesada"
        ],
        "preco": {
          "valor": 1390,
          "moeda": "po"
        },
        "pesoKg": 3,
        "slotEquipamento": "mao_forte",
        "duasMaos": true,
        "leve": false,
        "descricao": "+2 ao acerto e 1d4 de dano contundente por acerto.",
        "modelosAcoes": [
          {
            "modo": "corpo_a_corpo",
            "alcanceM": 1.5,
            "dano": "2d6",
            "tipoDano": "cortante"
          }
        ],
        "negociavel": true,
        "raridade": "raro",
        "bonusMagico": 2,
        "bonusDano": 0,
        "danoExtraAoAcertar": {
          "formula": "1d4",
          "elemento": "contundente",
          "critico": false
        }
      }
    },
    {
      "id": "item.la-arte.veste-passo-nebuloso",
      "revisao": 1,
      "definicao": {
        "nome": "Veste do Passo Nebuloso",
        "tipo": "equipamento",
        "categoria": "veste",
        "preco": {
          "valor": 1250,
          "moeda": "po"
        },
        "pesoKg": 1.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "veste",
        "classeArmadura": {
          "tipo": "base",
          "valor": 10,
          "classe": "veste",
          "atributo": "des"
        },
        "descricao": "Ação bônus, 1 uso por descanso longo: teleporte-se até 9 m para um espaço visível desocupado.",
        "negociavel": true,
        "raridade": "raro"
      }
    },
    {
      "id": "item.la-arte.veste-trama-serena",
      "revisao": 1,
      "definicao": {
        "nome": "Veste da Trama Serena",
        "tipo": "equipamento",
        "categoria": "veste",
        "preco": {
          "valor": 1270,
          "moeda": "po"
        },
        "pesoKg": 1.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "veste",
        "classeArmadura": {
          "tipo": "base",
          "valor": 10,
          "classe": "veste",
          "atributo": "des"
        },
        "descricao": "Ao falhar numa salvaguarda de CON para concentração, 1 uso por descanso longo: rerrole e use o novo resultado.",
        "negociavel": true,
        "raridade": "raro"
      }
    },
    {
      "id": "item.la-arte.couro-sombra-curta",
      "revisao": 1,
      "definicao": {
        "nome": "Couro da Sombra Curta",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 1350,
          "moeda": "po"
        },
        "pesoKg": 6.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "leve",
        "classeArmadura": {
          "tipo": "base",
          "valor": 12,
          "classe": "leve",
          "atributo": "des"
        },
        "descricao": "Armadura leve, CA 12 + DES. Ação bônus, 1 uso por descanso longo: invisível até o início do próximo turno.",
        "negociavel": true,
        "raridade": "raro"
      }
    },
    {
      "id": "item.la-arte.camisao-malha-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Camisão de malha +2",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 1390,
          "moeda": "po"
        },
        "pesoKg": 10,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "media",
        "classeArmadura": {
          "tipo": "base",
          "valor": 15,
          "classe": "media",
          "atributo": "des",
          "limiteAtributo": 2
        },
        "descricao": "Armadura média, CA 15 + DES (máximo +2).",
        "negociavel": true,
        "raridade": "raro"
      }
    },
    {
      "id": "item.la-arte.cota-malha-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Cota de malha +2",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 1460,
          "moeda": "po"
        },
        "pesoKg": 27.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "pesada",
        "classeArmadura": {
          "tipo": "base",
          "valor": 18,
          "classe": "pesada"
        },
        "requisitos": {
          "forca": 13
        },
        "penalidades": {
          "furtividade": "desvantagem"
        },
        "descricao": "Armadura pesada, CA 18; FOR 13; desvantagem em Furtividade.",
        "negociavel": true,
        "raridade": "raro"
      }
    },
    {
      "id": "item.la-arte.placas-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Armadura de placas +2",
        "tipo": "equipamento",
        "categoria": "armadura",
        "preco": {
          "valor": 5050,
          "moeda": "po"
        },
        "pesoKg": 32.5,
        "slotEquipamento": "vestes",
        "categoriaArmadura": "pesada",
        "classeArmadura": {
          "tipo": "base",
          "valor": 20,
          "classe": "pesada"
        },
        "requisitos": {
          "forca": 15
        },
        "penalidades": {
          "furtividade": "desvantagem"
        },
        "descricao": "Armadura pesada, CA 20; FOR 15; desvantagem em Furtividade.",
        "negociavel": true,
        "raridade": "raro"
      }
    },
    {
      "id": "item.la-arte.escudo-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Escudo +2",
        "tipo": "equipamento",
        "categoria": "escudo",
        "preco": {
          "valor": 1325,
          "moeda": "po"
        },
        "pesoKg": 3,
        "slotEquipamento": "mao_fraca",
        "categoriaArmadura": "escudo",
        "classeArmadura": {
          "tipo": "bonus",
          "valor": 4,
          "classe": "escudo"
        },
        "descricao": "Empunhado na mão fraca. Concede +4 à CA.",
        "negociavel": true,
        "raridade": "raro"
      }
    },
    {
      "id": "item.la-arte.anel-segunda-chance",
      "revisao": 1,
      "definicao": {
        "nome": "Anel da Segunda Chance",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 1300,
          "moeda": "po"
        },
        "pesoKg": 0.02,
        "slotEquipamento": "acessorio",
        "descricao": "Ao falhar numa salvaguarda, 1 uso por descanso longo: rerrole e use o novo resultado.",
        "negociavel": true,
        "raridade": "raro"
      }
    },
    {
      "id": "item.la-arte.colar-socorrista",
      "revisao": 1,
      "definicao": {
        "nome": "Colar do Socorrista",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 1275,
          "moeda": "po"
        },
        "pesoKg": 0.1,
        "slotEquipamento": "colar",
        "descricao": "Ação e toque numa criatura viva com 0 PV, 1 uso por descanso longo: ela recupera 2d8+2 PV.",
        "negociavel": true,
        "raridade": "raro"
      }
    },
    {
      "id": "item.la-arte.luvas-dragao-ascendente-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Luvas do Dragão Ascendente +2",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 1400,
          "moeda": "po"
        },
        "pesoKg": 0.25,
        "slotEquipamento": "acessorio",
        "descricao": "Golpes desarmados causam +1d4 de fogo por acerto. Sem armadura, concede também +1 à CA.",
        "negociavel": true,
        "raridade": "raro",
        "danoExtraDesarmado": {
          "formula": "1d4",
          "elemento": "fogo",
          "critico": false
        },
        "modificadoresCondicionais": {
          "semArmadura": {
            "ca": 1
          }
        }
      }
    },
    {
      "id": "item.la-arte.botas-escapistas-mais-2",
      "revisao": 1,
      "definicao": {
        "nome": "Botas Escapistas +2",
        "tipo": "equipamento",
        "categoria": "acessorio",
        "preco": {
          "valor": 1250,
          "moeda": "po"
        },
        "pesoKg": 1,
        "slotEquipamento": "botas",
        "descricao": "Ação bônus, 1 uso por descanso longo: use Desengajar e Disparada juntos e não provoque ataques de oportunidade nesse turno.",
        "negociavel": true,
        "raridade": "raro"
      }
    }
  ],
  "lojas": [
    {
      "$schema": "./catalogo-victor.schema.json",
      "versaoFormato": 2,
      "id": "loja.ferraria-victor",
      "nome": "Ferraria de Victor",
      "descricao": "Armas, armaduras, ferramentas e suprimentos comuns produzidos ou revendidos por Victor.",
      "descontoMinimoPct": 1,
      "descontoMaximoPct": 30,
      "itens": [
        {
          "id": "victor-azagaia",
          "ref": "item.azagaia"
        },
        {
          "id": "victor-foice",
          "ref": "item.foice"
        },
        {
          "id": "victor-lanca",
          "ref": "item.lanca"
        },
        {
          "id": "victor-adaga",
          "ref": "item.adaga"
        },
        {
          "id": "victor-espada-curta",
          "ref": "item.espada-curta"
        },
        {
          "id": "victor-mangual",
          "ref": "item.mangual"
        },
        {
          "id": "victor-cimitarra",
          "ref": "item.cimitarra"
        },
        {
          "id": "victor-arco-longo",
          "ref": "item.arco-longo"
        },
        {
          "id": "victor-espada-grande",
          "ref": "item.espada-grande"
        },
        {
          "id": "victor-veste-simples",
          "ref": "item.veste-simples"
        },
        {
          "id": "victor-couro-batido",
          "ref": "item.couro-batido"
        },
        {
          "id": "victor-camisao-malha",
          "ref": "item.camisao-de-malha"
        },
        {
          "id": "victor-cota-malha",
          "ref": "item.cota-de-malha"
        },
        {
          "id": "victor-armadura-placas",
          "ref": "item.armadura-de-placas"
        },
        {
          "id": "victor-escudo",
          "ref": "item.escudo"
        },
        {
          "id": "victor-anel-simples",
          "ref": "item.anel-simples-de-oficina"
        },
        {
          "id": "victor-colar-simples",
          "ref": "item.colar-simples-de-oficina"
        },
        {
          "id": "victor-capa-viagem",
          "ref": "item.capa-de-viagem"
        },
        {
          "id": "victor-luvas-treino",
          "ref": "item.luvas-de-treino-par"
        },
        {
          "id": "victor-botas-marcha",
          "ref": "item.botas-de-marcha-par"
        },
        {
          "id": "victor-flechas-20",
          "ref": "item.flechas-20"
        },
        {
          "id": "victor-pe-cabra",
          "ref": "item.pe-de-cabra"
        },
        {
          "id": "victor-corrente-3m",
          "ref": "item.corrente-3-m"
        },
        {
          "id": "victor-ferramentas-ferreiro",
          "ref": "item.ferramentas-de-ferreiro"
        }
      ]
    },
    {
      "versaoFormato": 2,
      "id": "loja.la-arte",
      "nome": "La Arte",
      "descricao": "Itens mágicos incomuns e raros criados por Laerte.",
      "descontoMinimoPct": 1,
      "descontoMaximoPct": 30,
      "itens": [
        {
          "id": "la-arte-azagaia-mais-1",
          "ref": "item.la-arte.azagaia-mais-1"
        },
        {
          "id": "la-arte-foice-mais-1",
          "ref": "item.la-arte.foice-mais-1"
        },
        {
          "id": "la-arte-lanca-mais-1",
          "ref": "item.la-arte.lanca-mais-1"
        },
        {
          "id": "la-arte-adaga-mais-1",
          "ref": "item.la-arte.adaga-mais-1"
        },
        {
          "id": "la-arte-espada-curta-mais-1",
          "ref": "item.la-arte.espada-curta-mais-1"
        },
        {
          "id": "la-arte-mangual-mais-1",
          "ref": "item.la-arte.mangual-mais-1"
        },
        {
          "id": "la-arte-cimitarra-mais-1",
          "ref": "item.la-arte.cimitarra-mais-1"
        },
        {
          "id": "la-arte-arco-longo-mais-1",
          "ref": "item.la-arte.arco-longo-mais-1"
        },
        {
          "id": "la-arte-espada-grande-mais-1",
          "ref": "item.la-arte.espada-grande-mais-1"
        },
        {
          "id": "la-arte-veste-bolsos-oficina",
          "ref": "item.la-arte.veste-bolsos-oficina"
        },
        {
          "id": "la-arte-veste-ultimo-folego",
          "ref": "item.la-arte.veste-ultimo-folego"
        },
        {
          "id": "la-arte-couro-passo-macio",
          "ref": "item.la-arte.couro-passo-macio"
        },
        {
          "id": "la-arte-camisao-malha-mais-1",
          "ref": "item.la-arte.camisao-malha-mais-1"
        },
        {
          "id": "la-arte-cota-malha-mais-1",
          "ref": "item.la-arte.cota-malha-mais-1"
        },
        {
          "id": "la-arte-placas-mais-1",
          "ref": "item.la-arte.placas-mais-1"
        },
        {
          "id": "la-arte-escudo-mais-1",
          "ref": "item.la-arte.escudo-mais-1"
        },
        {
          "id": "la-arte-anel-mao-firme",
          "ref": "item.la-arte.anel-mao-firme"
        },
        {
          "id": "la-arte-colar-folego-docas",
          "ref": "item.la-arte.colar-folego-docas"
        },
        {
          "id": "la-arte-colar-vigia",
          "ref": "item.la-arte.colar-vigia"
        },
        {
          "id": "la-arte-capa-mensageiro",
          "ref": "item.la-arte.capa-mensageiro"
        },
        {
          "id": "la-arte-luvas-guarda-mais-1",
          "ref": "item.la-arte.luvas-guarda-mais-1"
        },
        {
          "id": "la-arte-botas-passo-livre-mais-1",
          "ref": "item.la-arte.botas-passo-livre-mais-1"
        },
        {
          "id": "la-arte-azagaia-para-raios-mais-2",
          "ref": "item.la-arte.azagaia-para-raios-mais-2"
        },
        {
          "id": "la-arte-foice-geada-mais-2",
          "ref": "item.la-arte.foice-geada-mais-2"
        },
        {
          "id": "la-arte-lanca-abalo-mais-2",
          "ref": "item.la-arte.lanca-abalo-mais-2"
        },
        {
          "id": "la-arte-adaga-brasa-mais-2",
          "ref": "item.la-arte.adaga-brasa-mais-2"
        },
        {
          "id": "la-arte-espada-curta-escarcha-mais-2",
          "ref": "item.la-arte.espada-curta-escarcha-mais-2"
        },
        {
          "id": "la-arte-mangual-basalto-mais-2",
          "ref": "item.la-arte.mangual-basalto-mais-2"
        },
        {
          "id": "la-arte-cimitarra-fornalha-mais-2",
          "ref": "item.la-arte.cimitarra-fornalha-mais-2"
        },
        {
          "id": "la-arte-arco-longo-tempestade-mais-2",
          "ref": "item.la-arte.arco-longo-tempestade-mais-2"
        },
        {
          "id": "la-arte-espada-grande-falha-mais-2",
          "ref": "item.la-arte.espada-grande-falha-mais-2"
        },
        {
          "id": "la-arte-veste-passo-nebuloso",
          "ref": "item.la-arte.veste-passo-nebuloso"
        },
        {
          "id": "la-arte-veste-trama-serena",
          "ref": "item.la-arte.veste-trama-serena"
        },
        {
          "id": "la-arte-couro-sombra-curta",
          "ref": "item.la-arte.couro-sombra-curta"
        },
        {
          "id": "la-arte-camisao-malha-mais-2",
          "ref": "item.la-arte.camisao-malha-mais-2"
        },
        {
          "id": "la-arte-cota-malha-mais-2",
          "ref": "item.la-arte.cota-malha-mais-2"
        },
        {
          "id": "la-arte-placas-mais-2",
          "ref": "item.la-arte.placas-mais-2"
        },
        {
          "id": "la-arte-escudo-mais-2",
          "ref": "item.la-arte.escudo-mais-2"
        },
        {
          "id": "la-arte-anel-segunda-chance",
          "ref": "item.la-arte.anel-segunda-chance"
        },
        {
          "id": "la-arte-colar-socorrista",
          "ref": "item.la-arte.colar-socorrista"
        },
        {
          "id": "la-arte-luvas-dragao-ascendente-mais-2",
          "ref": "item.la-arte.luvas-dragao-ascendente-mais-2"
        },
        {
          "id": "la-arte-botas-escapistas-mais-2",
          "ref": "item.la-arte.botas-escapistas-mais-2"
        }
      ]
    }
  ]
};

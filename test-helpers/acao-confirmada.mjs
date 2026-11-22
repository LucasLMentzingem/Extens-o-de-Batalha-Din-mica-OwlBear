// Suites de regras simulam o aceite consciente. Os testes de revisão importam
// o motor diretamente para verificar recusa sem aceite e autorização obsoleta.
import {aplicar as aplicarMotor,avaliarUsoHabilidade} from '../site/engine.mjs';
import {aceitarRevisaoUso} from '../site/skill-use-review.mjs';
export async function aplicar(s,c,u,...args){const r=avaliarUsoHabilidade(s,c,u);if(r?.resultado==='confirmar'&&!c.confirmacaoUso)c={...c,confirmacaoUso:aceitarRevisaoUso(r)};return aplicarMotor(s,c,u,...args);}

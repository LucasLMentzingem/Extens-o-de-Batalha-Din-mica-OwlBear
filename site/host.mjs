import {emSala,host} from './bridge.mjs';
import {iniciarHud} from './hud-controller.mjs';
if(emSala){
  host().catch(console.error);
  iniciarHud().catch(e=>console.error('HUD de combate:',e));
}

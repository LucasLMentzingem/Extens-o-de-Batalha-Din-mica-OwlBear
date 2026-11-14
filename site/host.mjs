import OBR from './vendor/sdk.mjs';
import {emSala,host} from './bridge.mjs?v=0.7.27';
import {iniciarHud} from './hud-controller.mjs?v=0.7.27';
if(emSala){
  host().catch(console.error);
  iniciarHud().catch(e=>{console.error('HUD de combate:',e);Promise.resolve(OBR.notification.show('HUD de combate: '+(e?.message??e),'ERROR')).catch(()=>{});});
}

export const idDoEstado=s=>s?.__contextoExecucao?.uuid?.()??crypto.randomUUID();
export const agoraDoEstado=s=>s?.__contextoExecucao?.agora?.()??Date.now();

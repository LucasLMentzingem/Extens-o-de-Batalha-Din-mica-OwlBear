import {validar, LIMITE_FICHAS_GRUPO} from './engine.mjs?v=0.8.60';

export async function lerPastaFichas(arquivos) {
  const selecionados = Array.from(arquivos);
  const nome = selecionados[0]?.webkitRelativePath?.split('/')[0];
  if (!nome) throw Error('Selecione uma pasta de fichas.');

  const jsons = selecionados.filter(arquivo => /\.json$/i.test(arquivo.name));
  if (!jsons.length) throw Error('A pasta não contém fichas JSON.');
  if (jsons.length > LIMITE_FICHAS_GRUPO) {
    throw Error('O grupo pode conter até '+LIMITE_FICHAS_GRUPO+' fichas.');
  }
  jsons.sort((a, b) => a.webkitRelativePath.localeCompare(b.webkitRelativePath, 'pt-BR'));

  const fichas = [];
  for (const arquivo of jsons) {
    if (arquivo.webkitRelativePath.split('/')[0] !== nome) {
      throw Error('Selecione apenas uma pasta por grupo.');
    }
    try {
      const dados = JSON.parse((await arquivo.text()).replace(/^\uFEFF/, ''));
      validar(dados);
      fichas.push(dados);
    } catch (erro) {
      throw Error(arquivo.webkitRelativePath+': '+erro.message);
    }
  }
  return {nome, fichas};
}

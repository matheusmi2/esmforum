function criarAcoesVotacao() {
  return new Map([
    ['positivo', (repositorio, usuario, pergunta) => repositorio.definir(usuario, pergunta, 1)],
    ['negativo', (repositorio, usuario, pergunta) => repositorio.definir(usuario, pergunta, -1)],
    ['retirar', (repositorio, usuario, pergunta) => repositorio.retirar(usuario, pergunta)]
  ]);
}
module.exports = criarAcoesVotacao;

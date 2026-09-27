// Contrato do repositório: perguntaExiste(id), definir(usuario, pergunta, valor),
// retirar(usuario, pergunta) e resumo(pergunta, usuario).
const ErroAplicacao = require('./erro');

function criarServicoVotacao(repositorio, acoes) {
  function conferirPergunta(id) {
    if (!Number.isSafeInteger(id) || id < 1) {
      throw new ErroAplicacao(400, 'Pergunta inválida.');
    }
    if (!repositorio.perguntaExiste(id)) {
      throw new ErroAplicacao(404, 'Pergunta não encontrada.');
    }
  }

  return {
    consultar(pergunta, usuario = null) {
      conferirPergunta(pergunta);
      return repositorio.resumo(pergunta, usuario);
    },
    executar(pergunta, usuario, acao) {
      if (!Number.isSafeInteger(usuario) || usuario < 1) {
        throw new ErroAplicacao(401, 'Entre na sua conta para votar.');
      }
      conferirPergunta(pergunta);
      const executarAcao = acoes.get(acao);
      if (!executarAcao) throw new ErroAplicacao(400, 'Ação de votação inválida.');
      executarAcao(repositorio, usuario, pergunta);
      return repositorio.resumo(pergunta, usuario);
    }
  };
}
module.exports = criarServicoVotacao;

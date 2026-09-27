class ErroAplicacao extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}
module.exports = ErroAplicacao;

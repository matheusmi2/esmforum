const crypto = require('node:crypto');
const ErroAplicacao = require('./erro');
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');
const derivarSenha = (senha, salt) => crypto.scryptSync(senha, salt, 64);

function criarServicoIdentidade(repositorio) {
  function credenciais(nome, senha) {
    if (typeof nome !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(nome.trim()) ||
        typeof senha !== 'string' || senha.length < 8 || senha.length > 128) {
      throw new ErroAplicacao(400, 'Use um nome de 3 a 30 letras, números ou _, e uma senha de 8 a 128 caracteres.');
    }
    return nome.trim();
  }
  function iniciarSessao(usuario) {
    const token = crypto.randomBytes(32).toString('hex');
    repositorio.salvarSessao(hashToken(token), usuario.id_usuario, Date.now() + 7 * 24 * 60 * 60 * 1000);
    return { token, usuario: { id_usuario: usuario.id_usuario, nome: usuario.nome } };
  }
  return {
    cadastrar(nome, senha) {
      nome = credenciais(nome, senha);
      if (repositorio.buscarNome(nome)) throw new ErroAplicacao(409, 'Esse nome já está em uso.');
      const salt = crypto.randomBytes(16).toString('hex');
      const id = repositorio.cadastrar(nome, derivarSenha(senha, salt).toString('hex'), salt);
      return iniciarSessao({ id_usuario: id, nome });
    },
    entrar(nome, senha) {
      nome = credenciais(nome, senha);
      const usuario = repositorio.buscarNome(nome);
      const tentativa = derivarSenha(senha, usuario ? usuario.salt : 'usuario-inexistente');
      if (!usuario || !crypto.timingSafeEqual(tentativa, Buffer.from(usuario.senha_hash, 'hex'))) {
        throw new ErroAplicacao(401, 'Nome ou senha incorretos.');
      }
      return iniciarSessao(usuario);
    },
    identificar(token) {
      if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
        throw new ErroAplicacao(401, 'Entre na sua conta para votar.');
      }
      const sessao = repositorio.buscarSessao(hashToken(token));
      if (!sessao || sessao.expira_em <= Date.now()) {
        throw new ErroAplicacao(401, 'Sua sessão expirou. Entre novamente.');
      }
      return { id_usuario: sessao.id_usuario, nome: sessao.nome };
    },
    sair(token) {
      if (token) repositorio.removerSessao(hashToken(token));
    }
  };
}
module.exports = criarServicoIdentidade;

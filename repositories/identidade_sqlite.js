function criarRepositorioIdentidade(banco) {
  return {
    buscarNome: nome => banco.prepare('SELECT * FROM usuarios WHERE nome = ?').get(nome),
    cadastrar(nome, hash, salt) {
      return Number(banco.prepare('INSERT INTO usuarios (nome, senha_hash, salt) VALUES (?, ?, ?)')
        .run(nome, hash, salt).lastInsertRowid);
    },
    salvarSessao(hash, usuario, expira) {
      banco.prepare('DELETE FROM sessoes WHERE expira_em <= ?').run(Date.now());
      banco.prepare('INSERT INTO sessoes (token_hash, id_usuario, expira_em) VALUES (?, ?, ?)')
        .run(hash, usuario, expira);
    },
    buscarSessao: hash => banco.prepare(`
      SELECT u.id_usuario, u.nome, s.expira_em FROM sessoes s
      JOIN usuarios u ON u.id_usuario = s.id_usuario WHERE s.token_hash = ?
    `).get(hash),
    removerSessao: hash => banco.prepare('DELETE FROM sessoes WHERE token_hash = ?').run(hash)
  };
}
module.exports = criarRepositorioIdentidade;

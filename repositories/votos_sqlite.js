function criarRepositorioVotos(banco) {
  const existe = banco.prepare('SELECT 1 FROM perguntas WHERE id_pergunta = ?');
  const definir = banco.prepare(`
    INSERT INTO votos (id_usuario, id_pergunta, valor) VALUES (?, ?, ?)
    ON CONFLICT(id_usuario, id_pergunta) DO UPDATE SET valor = excluded.valor
  `);
  const retirar = banco.prepare('DELETE FROM votos WHERE id_usuario = ? AND id_pergunta = ?');
  const resumo = banco.prepare(`
    SELECT COALESCE(SUM(valor), 0) AS pontuacao,
      MAX(CASE WHEN id_usuario = ? THEN valor END) AS meu_voto
    FROM votos WHERE id_pergunta = ?
  `);
  return {
    perguntaExiste: id => Boolean(existe.get(id)),
    definir: (usuario, pergunta, valor) => definir.run(usuario, pergunta, valor),
    retirar: (usuario, pergunta) => retirar.run(usuario, pergunta),
    resumo: (pergunta, usuario) => resumo.get(usuario, pergunta)
  };
}
module.exports = criarRepositorioVotos;

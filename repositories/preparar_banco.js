function prepararBanco(banco) {
  banco.pragma('foreign_keys = ON');
  banco.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL COLLATE NOCASE UNIQUE,
      senha_hash TEXT NOT NULL,
      salt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessoes (
      token_hash TEXT PRIMARY KEY,
      id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
      expira_em INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS votos (
      id_voto INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
      id_pergunta INTEGER NOT NULL REFERENCES perguntas(id_pergunta) ON DELETE CASCADE,
      valor INTEGER NOT NULL CHECK(valor IN (-1, 1)),
      UNIQUE(id_usuario, id_pergunta)
    );
    CREATE INDEX IF NOT EXISTS votos_pergunta ON votos(id_pergunta);
  `);
}
module.exports = prepararBanco;

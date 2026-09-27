const Database = require('better-sqlite3');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const criarApp = require('../app');
const prepararBanco = require('../repositories/preparar_banco');
const criarRepositorioVotos = require('../repositories/votos_sqlite');
const criarRepositorioIdentidade = require('../repositories/identidade_sqlite');
const criarServicoVotacao = require('../services/votacao');
const criarServicoIdentidade = require('../services/identidade');
const criarAcoesVotacao = require('../services/acoes_votacao');

let banco, servidor, endereco, pasta, arquivo, contas;
async function chamar(caminho, method = 'GET', body, token) {
  const resposta = await fetch(endereco + caminho, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  return { status: resposta.status, dados: resposta.status === 204 ? null : await resposta.json() };
}
const votar = (token, acao, id = 1, extra = {}) => chamar(`/perguntas/${id}/voto`, 'PUT', { acao, ...extra }, token);

beforeAll(async () => {
  pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'esmforum-votacao-'));
  arquivo = path.join(pasta, 'teste.db');
  banco = new Database(arquivo);
  banco.exec(fs.readFileSync(path.join(__dirname, '../bd/schema.sql'), 'utf8'));
  banco.prepare('INSERT INTO perguntas (texto, id_usuario) VALUES (?, ?)').run('Pergunta de teste', 1);
  prepararBanco(banco);
  prepararBanco(banco);
  const votacao = criarServicoVotacao(criarRepositorioVotos(banco), criarAcoesVotacao());
  const identidade = criarServicoIdentidade(criarRepositorioIdentidade(banco));
  const modelo = { listar_perguntas: () => banco.prepare('SELECT * FROM perguntas').all() };
  const app = criarApp(modelo, votacao, identidade);
  await new Promise(resolve => { servidor = app.listen(0, '127.0.0.1', resolve); });
  endereco = `http://127.0.0.1:${servidor.address().port}`;
  contas = [];
  for (const nome of ['pessoa1', 'pessoa2']) {
    const resposta = await chamar('/usuarios', 'POST', { nome, senha: 'senha-teste-123' });
    expect(resposta.status).toBe(201);
    contas.push(resposta.dados);
  }
});
beforeEach(() => banco.exec('DELETE FROM votos'));
afterAll(async () => {
  if (servidor) await new Promise(resolve => servidor.close(resolve));
  if (banco) banco.close();
  if (arquivo && fs.existsSync(arquivo)) fs.unlinkSync(arquivo);
  if (pasta) fs.rmdirSync(pasta);
});

test('migração preserva as perguntas e consulta pública começa sem votos', async () => {
  expect((await chamar('/')).dados[0].texto).toBe('Pergunta de teste');
  expect(await chamar('/perguntas/1/votos')).toEqual({ status: 200, dados: { pontuacao: 0, meu_voto: null } });
});

test('votar, repetir, trocar e retirar mantém no máximo um voto por conta', async () => {
  for (const [acao, pontuacao, meu_voto] of [
    ['positivo', 1, 1], ['positivo', 1, 1], ['negativo', -1, -1], ['retirar', 0, null], ['retirar', 0, null]
  ]) {
    expect(await votar(contas[0].token, acao)).toEqual({ status: 200, dados: { pontuacao, meu_voto } });
    expect(banco.prepare('SELECT COUNT(*) AS total FROM votos').get().total).toBe(meu_voto === null ? 0 : 1);
  }
});

test('contas votam de forma independente e não podem escolher outro autor pelo corpo da requisição', async () => {
  await votar(contas[0].token, 'positivo');
  const resultado = await votar(contas[1].token, 'negativo', 1, { id_usuario: contas[0].usuario.id_usuario });
  expect(resultado.dados).toEqual({ pontuacao: 0, meu_voto: -1 });
  expect((await chamar('/perguntas/1/votos', 'GET', undefined, contas[0].token)).dados.meu_voto).toBe(1);
  expect((await chamar('/perguntas/1/votos')).dados).toEqual({ pontuacao: 0, meu_voto: null });
  await votar(contas[1].token, 'retirar');
  expect((await chamar('/perguntas/1/votos', 'GET', undefined, contas[0].token)).dados).toEqual({ pontuacao: 1, meu_voto: 1 });
});

test('votos continuam disponíveis em outra conexão e em uma nova sessão da mesma conta', async () => {
  await votar(contas[0].token, 'positivo');
  const outraConexao = new Database(arquivo);
  try {
    expect(criarRepositorioVotos(outraConexao).resumo(1, contas[0].usuario.id_usuario))
      .toEqual({ pontuacao: 1, meu_voto: 1 });
  } finally { outraConexao.close(); }
  const login = await chamar('/sessoes', 'POST', { nome: 'PESSOA1', senha: 'senha-teste-123' });
  expect(login.status).toBe(200);
  expect((await chamar('/perguntas/1/votos', 'GET', undefined, login.dados.token)).dados.meu_voto).toBe(1);
});

test('rejeita falta de sessão, ação inválida e pergunta inexistente sem alterar votos', async () => {
  expect((await votar(undefined, 'positivo')).status).toBe(401);
  expect((await votar('token-invalido', 'positivo')).status).toBe(401);
  expect((await votar(contas[0].token, '__proto__')).status).toBe(400);
  expect((await votar(contas[0].token, 'positivo', 'abc')).status).toBe(400);
  expect((await votar(contas[0].token, 'positivo', 999)).status).toBe(404);
  expect(banco.prepare('SELECT COUNT(*) AS total FROM votos').get().total).toBe(0);
});

test('sessão encerrada ou expirada não pode votar', async () => {
  const login = await chamar('/sessoes', 'POST', { nome: 'pessoa1', senha: 'senha-teste-123' });
  expect((await chamar('/sessoes/atual', 'DELETE', undefined, login.dados.token)).status).toBe(204);
  expect((await votar(login.dados.token, 'positivo')).status).toBe(401);
  const novoLogin = await chamar('/sessoes', 'POST', { nome: 'pessoa1', senha: 'senha-teste-123' });
  const crypto = require('node:crypto');
  const hash = crypto.createHash('sha256').update(novoLogin.dados.token).digest('hex');
  banco.prepare('UPDATE sessoes SET expira_em = 0 WHERE token_hash = ?').run(hash);
  expect((await votar(novoLogin.dados.token, 'positivo')).status).toBe(401);
});

test('contas validam credenciais, nome duplicado e não guardam a senha em texto', async () => {
  expect((await chamar('/usuarios', 'POST', { nome: 'PESSOA1', senha: 'senha-teste-123' })).status).toBe(409);
  expect((await chamar('/usuarios', 'POST', { nome: 'x', senha: '123' })).status).toBe(400);
  expect((await chamar('/sessoes', 'POST', { nome: 'pessoa1', senha: 'senha-incorreta' })).status).toBe(401);
  expect((await chamar('/sessoes', 'POST', { nome: 'ninguem', senha: 'senha-incorreta' })).status).toBe(401);
  const usuario = banco.prepare('SELECT * FROM usuarios WHERE nome = ?').get('pessoa1');
  expect(usuario.senha_hash).not.toBe('senha-teste-123');
  expect(usuario.senha_hash).toHaveLength(128);
  expect(JSON.stringify(contas[0])).not.toContain(usuario.senha_hash);
});

test('banco impede votos duplicados, valores inválidos e referências inexistentes', () => {
  const inserir = banco.prepare('INSERT INTO votos (id_usuario, id_pergunta, valor) VALUES (?, ?, ?)');
  inserir.run(contas[0].usuario.id_usuario, 1, 1);
  expect(() => inserir.run(contas[0].usuario.id_usuario, 1, -1)).toThrow();
  expect(() => inserir.run(contas[1].usuario.id_usuario, 1, 2)).toThrow();
  expect(() => inserir.run(999, 1, 1)).toThrow();
});

test('serviço aceita repositório em memória e ação nova sem alteração no seu código', () => {
  let valor = null;
  const repositorio = {
    perguntaExiste: id => id === 1,
    definir: (usuario, pergunta, novoValor) => { valor = novoValor; },
    retirar: () => { valor = null; },
    resumo: () => ({ pontuacao: valor || 0, meu_voto: valor })
  };
  const acoes = criarAcoesVotacao();
  acoes.set('alternar', (repo, usuario, pergunta) => repo.definir(usuario, pergunta, valor === 1 ? -1 : 1));
  const servico = criarServicoVotacao(repositorio, acoes);
  expect(servico.executar(1, 1, 'alternar').pontuacao).toBe(1);
  expect(servico.executar(1, 1, 'alternar').pontuacao).toBe(-1);
  expect(() => servico.executar(1, null, 'positivo')).toThrow('Entre na sua conta');
});

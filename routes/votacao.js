const express = require('express');
function criarRotasVotacao(votacao, identidade) {
  const router = express.Router();
  const token = req => (req.get('Authorization') || '').replace(/^Bearer /, '');
  router.post('/usuarios', (req, res) => {
    const { nome, senha } = req.body || {};
    res.status(201).json(identidade.cadastrar(nome, senha));
  });
  router.post('/sessoes', (req, res) => {
    const { nome, senha } = req.body || {};
    res.json(identidade.entrar(nome, senha));
  });
  router.get('/sessoes/atual', (req, res) => res.json(identidade.identificar(token(req))));
  router.delete('/sessoes/atual', (req, res) => {
    identidade.sair(token(req));
    res.sendStatus(204);
  });
  router.get('/perguntas/:id/votos', (req, res) => {
    const usuario = token(req) ? identidade.identificar(token(req)).id_usuario : null;
    res.json(votacao.consultar(Number(req.params.id), usuario));
  });
  router.put('/perguntas/:id/voto', (req, res) => {
    const usuario = identidade.identificar(token(req)).id_usuario;
    res.json(votacao.executar(Number(req.params.id), usuario, (req.body || {}).acao));
  });
  return router;
}
module.exports = criarRotasVotacao;

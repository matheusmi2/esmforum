const express = require('express')
const criarRotasVotacao = require('./routes/votacao');

function criarApp(modelo, votacao, identidade) {

  const app = express()
  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  app.use(criarRotasVotacao(votacao, identidade));

  app.get('/', (req, res) => {
    try {
      const perguntas = modelo.listar_perguntas();
      res.send(perguntas);
    }
    catch(erro) {
      res.status(500).json(erro.message);
    }
  });

  app.post('/perguntas', (req, res) => {
    try {
      const id_pergunta = modelo.cadastrar_pergunta(req.body.pergunta);
      res.json({id_pergunta: id_pergunta});
    }
    catch(erro) {
      res.status(500).json(erro.message);
    }
  });

  app.get('/respostas/:id_pergunta', (req, res) => {
    const id_pergunta = req.params.id_pergunta;
    try {
      const pergunta = modelo.get_pergunta(id_pergunta);
      if (!pergunta) return res.status(404).json({ erro: 'Pergunta não encontrada.' });
      const respostas = modelo.get_respostas(id_pergunta);
      res.json({
        pergunta: pergunta,
        respostas: respostas
      });
    }
    catch(erro) {
      res.status(500).json(erro.message);
    }
  });

  app.post('/respostas', (req, res) => {
    try {
      const id_pergunta = req.body.id_pergunta;
      const resposta = req.body.resposta;
      const id_resposta = modelo.cadastrar_resposta(id_pergunta, resposta);
      res.json({id_resposta: id_resposta});
    }
    catch(erro) {
      res.status(500).json(erro.message);
    }
  });

  app.use((erro, req, res, next) => {
    const status = erro.status || 500;
    res.status(status).json({ erro: status >= 500 ? 'Não foi possível concluir a operação.' : erro.message });
  });
  return app;
}
module.exports = criarApp;

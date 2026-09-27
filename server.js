const path = require('node:path');
const Database = require('better-sqlite3');
const criarApp = require('./app');
const modelo = require('./modelo');
const prepararBanco = require('./repositories/preparar_banco');
const criarRepositorioVotos = require('./repositories/votos_sqlite');
const criarRepositorioIdentidade = require('./repositories/identidade_sqlite');
const criarServicoVotacao = require('./services/votacao');
const criarServicoIdentidade = require('./services/identidade');
const criarAcoesVotacao = require('./services/acoes_votacao');

const banco = new Database(path.join(__dirname, 'bd', 'esmforum.db'));
prepararBanco(banco);
const votacao = criarServicoVotacao(criarRepositorioVotos(banco), criarAcoesVotacao());
const identidade = criarServicoIdentidade(criarRepositorioIdentidade(banco));
const app = criarApp(modelo, votacao, identidade);
const port = Number(process.env.PORT || 5000);
app.listen(port, 'localhost', () => console.log(`ESM Forum rodando em ${port}`));

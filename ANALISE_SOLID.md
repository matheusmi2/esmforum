# Análise SOLID do backend

## Pontos positivos

### 1. Cadastro de perguntas na rota (SRP)

Trecho de server.js:

```javascript
app.post('/perguntas', (req, res) => {
  try {
    const id_pergunta = modelo.cadastrar_pergunta(req.body.pergunta);
    res.json({id_pergunta: id_pergunta});
  }
  catch(erro) {
    res.status(500).json(erro.message);
  }
});
```

A rota recebe o texto da pergunta, chama a função de cadastro e responde à requisição. A gravação fica por conta do modelo. Essa separação segue o princípio da responsabilidade única (SRP), pois a rota fica responsável pela parte HTTP, sem precisar cuidar também dos detalhes de gravação no banco.

Se for preciso mudar o comando SQL usado no cadastro, o ajuste pode ser feito no modelo. A rota continua funcionando desde que cadastrar_pergunta receba o texto e devolva o identificador da pergunta. Já uma mudança na resposta enviada ao frontend deve ser feita nessa rota. Cada alteração fica na parte do código que cuida daquele trabalho.

### 2. Funções de acesso ao SQLite (SRP)

Trecho de bd/bd_utils.js:

```javascript
function query(query, params) {
  return bd.prepare(query).get(params);
}

function queryAll(query, params) {
  return bd.prepare(query).all(params);
}

function exec(statement, params) {
  return bd.prepare(statement).run(params);
}
```

As três funções executam comandos no SQLite. query busca um registro, queryAll busca vários e exec executa um comando de alteração. Nenhuma delas precisa saber qual página fez o pedido ou qual regra de cadastro está sendo usada. Esse trabalho fica nas outras partes do backend.

O SRP aparece nessa divisão do acesso ao banco. Se a forma de chamar a biblioteca mudar, as chamadas estão reunidas em bd_utils.js, sem precisar procurar por elas nas rotas. A separação ajuda a manter o código, mas uma troca de banco ainda exigiria conferir as consultas SQL escritas no modelo.

### 3. Substituição do banco nos testes (DIP parcial)

Trecho de modelo.js:

```javascript
function reconfig_bd(mock_bd) {
  bd = mock_bd;
}
```

Em testes/listar_perguntas.test.js, essa função é usada assim:

```javascript
modelo.reconfig_bd(mock_bd);
```

O teste usa reconfig_bd para colocar um objeto de teste no lugar do acesso ao banco. Esse objeto tem as funções queryAll e query, que devolvem as respostas definidas no próprio teste. A listagem continua chamando essas funções sem precisar distinguir o objeto de teste daquele usado pela aplicação.

Isso se aproxima do princípio da inversão de dependência (DIP). O código consegue trabalhar com outro objeto que ofereça as operações esperadas. No teste da listagem, é possível escolher os dados devolvidos e conferir o resultado sem fazer consultas ao banco real.

Ainda é uma aplicação parcial do DIP. Ao carregar modelo.js, o módulo do banco também é carregado, antes de qualquer substituição feita pelo teste. As funções do modelo também continuam usando SQL. Por isso, a possibilidade de trocar o objeto nos testes é um ponto positivo, mas ainda há dependências a resolver.

## Oportunidades de melhoria

### 1. Dependência do modelo em relação ao banco (DIP)

Trechos de modelo.js:

```javascript
var bd = require('./bd/bd_utils.js');

function cadastrar_pergunta(texto) {
  const params = [texto, 1];
  const result = bd.exec('INSERT INTO perguntas (texto, id_usuario) VALUES(?, ?) RETURNING id_pergunta', params);
  return result.lastInsertRowid;
}
```

Para cadastrar uma pergunta, o modelo precisa conhecer o módulo bd_utils.js, o comando INSERT e a propriedade lastInsertRowid que vem no resultado. O cadastro fica preso a esses detalhes do banco. Isso contraria o DIP, pois uma operação da aplicação depende da implementação usada para salvar os dados.

Mesmo usando reconfig_bd, o objeto colocado no lugar do banco precisa aceitar SQL e devolver o resultado no mesmo formato. A substituição também acontece depois que bd_utils.js já foi carregado. Então, a função usada nos testes não basta para separar o cadastro desses detalhes.

Uma saída seria passar ao serviço um objeto responsável por salvar e buscar perguntas, chamado repositório. Ele teria operações como cadastrar e buscarPorId. Para fazer um cadastro, o serviço enviaria os dados da pergunta e receberia o identificador, deixando o SQL por conta do repositório.

O repositório usado na aplicação faria essas operações com SQLite. A escolha desse objeto ficaria na inicialização do sistema, que o passaria ao serviço. Nos testes, poderia ser passado outro objeto, desde que ele aceitasse os mesmos dados e devolvesse os resultados esperados por quem o chama.

### 2. Configuração do banco no módulo de consultas (SRP)

Trecho de bd/bd_utils.js:

```javascript
const Database = require('better-sqlite3');

var bd = new Database('./bd/esmforum.db');

function reconfig(nome) {
  bd = new Database(nome);
}
```

Além de executar consultas, bd_utils.js escolhe o arquivo do banco e permite trocar a conexão usada pelo restante do código. A configuração da aplicação e dos testes acaba ficando no mesmo lugar que as funções de consulta. Isso contraria o SRP porque uma mudança na configuração do banco e uma mudança na execução das consultas levam a alterações no mesmo módulo.

O banco é aberto assim que o arquivo é importado. Quando reconfig é chamada, a variável bd passa a apontar para outro banco, e todas as consultas seguintes usam essa nova conexão. Com isso, é preciso cuidar da ordem das chamadas para que uma consulta não seja feita no banco errado.

A conexão poderia ser aberta na inicialização da aplicação e passada ao módulo de consultas. Nos testes, cada caso poderia criar a conexão e o objeto de acesso aos dados de que precisa. A escolha do arquivo ficaria fora de bd_utils.js, e os testes não precisariam trocar uma variável compartilhada para escolher outro banco.

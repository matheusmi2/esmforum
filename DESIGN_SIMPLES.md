# Design simples no ESM Forum

## O que já é simples

YAGNI significa evitar implementar algo antes de haver uma necessidade para aquilo. No fórum, isso pode ser observado nas funções usadas para cadastrar e consultar os dados. O código resolve o cadastro e a consulta de perguntas e respostas sem criar uma estrutura para recursos que ainda não existem.

Por exemplo, esta função de modelo.js busca as respostas de uma pergunta:

```javascript
function get_respostas(id_pergunta) {
  return bd.queryAll('select * from respostas where id_pergunta = ?', [id_pergunta]);
}
```

É fácil entender o que essa função faz. Recebe o identificador da pergunta e devolve suas respostas. Essa consulta não exige classes ou uma camada genérica de busca.

A divisão entre os arquivos também ajuda. Em server.js, a rota recebe os dados da requisição, chama o modelo e envia o resultado. A consulta SQL fica no modelo, e o acesso ao SQLite fica em bd_utils.js.

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

O cadastro de respostas segue a mesma ideia. Dá para acompanhar o caminho da requisição sem passar por muitos arquivos. Para o tamanho atual do sistema, essa divisão já é suficiente para organizar as operações existentes.

Em bd_utils.js, as funções query, queryAll e exec fazem as chamadas ao banco em um único arquivo. Assim, o restante do código não precisa repetir prepare, get, all e run a cada operação.

O projeto também tem uma função reconfig_bd para substituir o acesso ao banco nos testes. Ela já é usada em testes/listar_perguntas.test.js. Nesse caso, a função tem um uso nos testes atuais, e sua presença no código não depende de algo que talvez seja feito no futuro.

## Possíveis simplificações

Uma mudança pequena seria dar um nome ao resultado da contagem de respostas. Hoje, o código depende do nome da expressão SQL:

```javascript
function get_num_respostas(id_pergunta) {
  const resultado = bd.query('select count(*) from respostas where id_pergunta = ?', [id_pergunta]);
  return resultado['count(*)'];
}
```

Com um nome para a contagem, o trecho ficaria assim:

```javascript
function get_num_respostas(id_pergunta) {
  const resultado = bd.query(
    'select count(*) as total from respostas where id_pergunta = ?',
    [id_pergunta]
  );
  return resultado.total;
}
```

O resultado continua sendo uma contagem, mas total deixa mais claro o que está sendo lido. Se essa mudança for feita, o mock em testes/listar_perguntas.test.js também precisa devolver objetos com a propriedade total.

Outro ponto está na rota GET /respostas/:id_pergunta. As chamadas ao modelo acontecem antes do try. As duas chamadas deveriam ficar dentro dele, para que uma falha na consulta seja tratada pelo mesmo catch da rota. Também falta verificar se a pergunta existe antes de enviar a resposta. Hoje, a interface pode receber uma resposta sem o objeto pergunta esperado.

Essas mudanças podem ser feitas sem reorganizar os arquivos e as funções do backend.

## Limites dessa simplicidade

Em cadastrar_pergunta, o identificador do usuário está fixado em 1:

```javascript
const params = [texto, 1];
```

Isso permite demonstrar o cadastro sem ter um sistema de identificação de usuários. Esse uso de um único usuário deixa de funcionar quando os votos e as publicações precisam ser separados por pessoa. Com os novos requisitos, essa identificação passa a ser necessária. Nesse ponto, manter o usuário fixo já não faz sentido, mesmo considerando o princípio YAGNI.

A função listar_perguntas também faz uma consulta para listar as perguntas e outra para contar as respostas de cada uma. É fácil de ler, mas a quantidade de consultas cresce junto com a lista. Se isso causar lentidão, vale reunir a listagem e a contagem em uma consulta. Adicionar cache antes de verificar essa necessidade traria mais código para manter sem saber se isso vai melhorar o funcionamento do sistema.

# Padrões encontrados no código

## Strategy nas ações de votação

Em services/acoes_votacao.js, cada ação de voto é uma função. Votar positivo grava o valor 1, votar negativo grava -1 e retirar apaga o voto. As funções ficam em um Map, junto com o nome de cada ação.

O serviço de votação, em services/votacao.js, pega a função correspondente ao pedido:

```javascript
const executarAcao = acoes.get(acao);
if (!executarAcao) throw new ErroAplicacao(400, 'Ação de votação inválida.');
executarAcao(repositorio, usuario, pergunta);
```

Há uma ideia do padrão Strategy nesse trecho. O serviço faz as verificações comuns e chama uma função diferente para cada ação. Ele não precisa ter uma sequência de condições para decidir como gravar ou retirar o voto.

As três ações atuais já funcionam dessa forma. No teste em testes/votacao.test.js, foi acrescentada a ação alternar sem mudar services/votacao.js. As funções são pequenas, então não precisam de uma classe ou de um arquivo para cada ação. Se alguma delas ficar mais complexa, poderá ser separada depois.

## DAO no acesso ao banco

As consultas da votação ficam em repositories/votos_sqlite.js. Esse arquivo recebe a conexão com o SQLite e oferece funções para conferir a pergunta, gravar o voto, retirar o voto e consultar a pontuação. Em repositories/identidade_sqlite.js estão as consultas de contas e sessões.

O repositório de votos devolve estas operações:

```javascript
return {
  perguntaExiste: id => Boolean(existe.get(id)),
  definir: (usuario, pergunta, valor) => definir.run(usuario, pergunta, valor),
  retirar: (usuario, pergunta) => retirar.run(usuario, pergunta),
  resumo: (pergunta, usuario) => resumo.get(usuario, pergunta)
};
```

Isso se aproxima do padrão DAO. O serviço pede uma operação de voto e o arquivo de acesso ao banco executa o SQL necessário. Embora os arquivos tenham o nome de repositório, eles fazem consultas e gravações diretas no banco, que é o trabalho típico de um DAO.

Essa divisão já existe para votos, contas e sessões. As perguntas e respostas ainda são tratadas de outra forma: modelo.js contém SQL e usa bd_utils.js para executar as consultas. O mesmo tipo de divisão poderia ser aplicado a essas partes, principalmente se novas operações forem acrescentadas. DAO é um padrão de acesso a dados, e não um dos padrões do catálogo GoF.

## Funções de fábrica na criação dos serviços

Em server.js, os objetos usados pela aplicação são montados com funções como criarRepositorioVotos e criarServicoVotacao:

```javascript
const votacao = criarServicoVotacao(criarRepositorioVotos(banco), criarAcoesVotacao());
const identidade = criarServicoIdentidade(criarRepositorioIdentidade(banco));
```

criarRepositorioVotos recebe a conexão e devolve as operações de acesso aos votos. criarServicoVotacao recebe o repositório e as ações e devolve as operações consultar e executar. Desse modo, server.js escolhe as peças usadas pela aplicação e deixa a criação de cada uma com sua função.

Essas são funções de fábrica. Não se trata do Factory Method clássico, pois não há subclasses escolhendo qual objeto criar. A forma atual resolve a criação dos serviços com o SQLite. Se o projeto passar a usar outro banco, outra função poderá fornecer as mesmas operações do repositório de votos. A escolha entre elas ficaria em server.js.

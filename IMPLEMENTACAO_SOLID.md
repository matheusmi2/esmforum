# Implementação da votação com SOLID

## Funcionalidade implementada

A votação foi acrescentada à lista de perguntas e à página de respostas. Cada pergunta tem um botão de voto positivo, outro de voto negativo e a pontuação atual. Depois de votar, o usuário também pode retirar o voto.

Cada conta pode manter apenas um voto por pergunta. Enviar o mesmo voto de novo não muda a pontuação. Trocar um voto positivo por um negativo reduz o total em dois pontos, pois o positivo deixa de contar e o negativo passa a contar. Retirar o voto apaga apenas o registro daquela conta na pergunta.

O frontend atualiza a pontuação depois da confirmação do backend. Se a requisição falhar, a tela mostra uma mensagem e mantém o último resultado confirmado. A opção de consultar os votos permite conferir o que ficou salvo.

## Identificação do usuário

O sistema passou a ter cadastro e entrada com nome de usuário e senha. Essa identificação é usada na votação. A leitura das perguntas e respostas continua disponível sem entrar em uma conta.

O backend identifica a conta pelo token da sessão. O identificador do autor do voto não é aceito como escolha do frontend. Assim, enviar o identificador de outra pessoa no corpo da requisição não muda quem está votando.

As senhas são guardadas como hashes gerados com scrypt e um salt diferente para cada conta. O banco guarda o hash do token de sessão, e a sessão expira após sete dias. Ao sair, o token deixa de ser válido. O frontend guarda o token no armazenamento local do navegador para manter a entrada depois de atualizar a página.

A regra de um voto por pergunta vale por conta cadastrada. A mesma conta pode entrar em outro navegador e consultar ou alterar o voto já salvo. Os cadastros antigos de perguntas e respostas mantêm o comportamento anterior. Esta tarefa não implementa perfil, busca ou tags.

## Organização do código

No backend:

- server.js abre a conexão, cria as tabelas que faltam e monta os serviços e repositórios.
- app.js configura o Express e mantém as rotas que já existiam.
- routes/votacao.js recebe as requisições de conta e votação e chama os serviços.
- services/votacao.js confere a pergunta e o usuário, encontra a ação pedida e devolve o resultado.
- services/acoes_votacao.js define o que fazer para votar positivo, votar negativo e retirar o voto.
- repositories/votos_sqlite.js contém as consultas e gravações dos votos.
- services/identidade.js cuida do cadastro, da entrada e da validação das sessões.
- repositories/identidade_sqlite.js salva e consulta as contas e sessões.
- repositories/preparar_banco.js cria as tabelas e as restrições da votação.

No frontend, Conta.js mostra o formulário de entrada e cadastro. Identidade.js mantém a sessão, e Votacao.js mostra a pontuação e os botões. O mesmo componente de votação é usado na lista e na página da pergunta. As chamadas HTTP dos novos componentes ficam em services/api.js.

## SRP: divisão das responsabilidades

O serviço de votação cuida das regras da operação. Ele verifica a pergunta e a identificação do usuário, mas não escreve SQL nem monta respostas HTTP. O repositório salva os dados, e a rota recebe o pedido do frontend.

Em routes/votacao.js, a rota de voto fica assim:

```javascript
router.put('/perguntas/:id/voto', (req, res) => {
  const usuario = identidade.identificar(token(req)).id_usuario;
  res.json(votacao.executar(Number(req.params.id), usuario, (req.body || {}).acao));
});
```

Uma mudança no endereço dessa rota fica no arquivo de rotas. Uma mudança no comando usado para salvar o voto fica no repositório. A regra de qual ação executar fica no serviço. Essas partes podem mudar por motivos diferentes, sem reunir todo o trabalho na mesma função.

No SQLite, o registro do voto usa este comando:

```sql
INSERT INTO votos (id_usuario, id_pergunta, valor) VALUES (?, ?, ?)
ON CONFLICT(id_usuario, id_pergunta) DO UPDATE SET valor = excluded.valor
```

A tabela tem uma restrição de unicidade para o par usuário e pergunta. Por isso, a repetição de um voto não cria outra linha. A coluna valor aceita apenas 1 e -1, e as referências ao usuário e à pergunta são conferidas pelo banco.

## DIP: dependências recebidas pelo serviço

O serviço de votação recebe o repositório e as ações por parâmetro:

```javascript
function criarServicoVotacao(repositorio, acoes) {
  // As operações usam o repositório e as ações recebidas.
}
```

O contrato do repositório tem quatro operações: perguntaExiste, definir, retirar e resumo. O serviço depende dessas operações e dos resultados que elas devolvem. Ele não importa better-sqlite3 e não abre uma conexão com o banco.

Em JavaScript, esse contrato é seguido pelo formato do objeto recebido. Não é preciso criar uma classe de interface para que duas implementações ofereçam as mesmas funções. Nos testes, o serviço recebe um objeto em memória. Na aplicação, recebe o repositório SQLite.

A escolha da implementação fica em server.js:

```javascript
const banco = new Database(path.join(__dirname, 'bd', 'esmforum.db'));
prepararBanco(banco);
const votacao = criarServicoVotacao(criarRepositorioVotos(banco), criarAcoesVotacao());
```

O repositório também recebe a conexão pronta. Ele não decide qual arquivo abrir, e os testes conseguem usar outro banco sem trocar uma variável compartilhada da aplicação.

## OCP: ações de votação que podem ser acrescentadas

As ações são registradas em um Map, criado em services/acoes_votacao.js:

```javascript
return new Map([
  ['positivo', (repositorio, usuario, pergunta) => repositorio.definir(usuario, pergunta, 1)],
  ['negativo', (repositorio, usuario, pergunta) => repositorio.definir(usuario, pergunta, -1)],
  ['retirar', (repositorio, usuario, pergunta) => repositorio.retirar(usuario, pergunta)]
]);
```

O serviço procura a ação pelo nome e a executa:

```javascript
const executarAcao = acoes.get(acao);
if (!executarAcao) throw new ErroAplicacao(400, 'Ação de votação inválida.');
executarAcao(repositorio, usuario, pergunta);
return repositorio.resumo(pergunta, usuario);
```

Se uma nova ação for necessária, ela pode ser escrita em outra função e adicionada ao Map na montagem da aplicação. A função executar do serviço continua igual. Não é preciso acrescentar outro if para reconhecer cada nova ação.

O teste inclui uma ação chamada alternar, adicionada ao Map apenas naquele teste. O mesmo serviço consegue executá-la sem nenhuma mudança em seu código. Isso demonstra o OCP no ponto de escolha das ações. Uma nova ação que precise de dados diferentes ainda pode exigir mudanças no repositório ou na interface.

## Execução

Na pasta esmforum, inicie o backend:

```bash
node server.js
```

As tabelas usuarios, sessoes e votos são criadas na primeira execução. As perguntas e respostas existentes são preservadas. Não é necessário apagar nem recriar o banco.

Em outro terminal, na pasta esmforum-react:

```bash
npm start
```

Abra http://localhost:3000 e escolha Criar conta. O nome deve ter de 3 a 30 letras, números ou _, e a senha deve ter de 8 a 128 caracteres. Depois do cadastro, os botões de voto ficam disponíveis.

Para conferir pela interface, registre um voto positivo, repita o voto, troque para negativo e retire o voto. Atualize a página para conferir os dados salvos. Outra conta deve ter seu próprio voto na mesma pergunta.

## Testes realizados

No backend:

```bash
npm test -- --runInBand
```

Os 12 testes passaram. Nove são da votação e das contas, e três já existiam no projeto. Os novos testes usam um banco temporário e requisições HTTP, sem inserir dados de teste no banco usado pela aplicação.

Foram conferidos o cadastro de contas, a entrada, a saída, a expiração da sessão, a repetição e a troca de votos, a retirada, a separação entre contas e a persistência em outra conexão e em uma nova sessão. Também foram testados pedidos inválidos, perguntas inexistentes, as restrições do banco e a inclusão de uma ação nova no serviço.

No frontend:

```bash
npm test -- --watchAll=false --runInBand
npm run build
```

Os cinco testes do componente de votação passaram. Eles verificam a exibição do voto salvo, a troca e a retirada, o bloqueio para visitantes, a mensagem de falha, a troca de conta e a sessão expirada. As respostas da API são simuladas nesses testes. A compilação do frontend também foi concluída.

O backend foi iniciado com o banco local, e a consulta de perguntas e pontuação respondeu sem erro. Esses resultados cobrem os testes automatizados e a inicialização local, sem substituir a conferência visual pelo navegador.

## Commits da implementação

- [Backend: serviço, contas, banco e testes](https://github.com/matheusmi2/esmforum/commit/36396ca)
- [Frontend: conta, controles de votação e testes](https://github.com/matheusmi2/esmforum-react/commit/944889c)

A análise do código existente foi feita antes dessas alterações, sobre a versão e0abadb do backend. A implementação acrescenta os módulos descritos neste documento.

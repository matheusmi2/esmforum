# Como rodar o ESM Forum

Para instalar o projeto, é preciso ter Git, Node.js e npm. A instalação foi feita no Windows, usando Node.js 22.

## Baixando o projeto

Clone os dois repositórios na mesma pasta:

```bash
git clone https://github.com/matheusmi2/esmforum.git
git clone https://github.com/matheusmi2/esmforum-react.git
```

## Backend

Entre na pasta do backend e instale as dependências:

```bash
cd esmforum
npm install
```

Depois, inicie o servidor:

```bash
node server.js
```

O terminal deve mostrar ESM Forum rodando em 5000. Em http://localhost:5000, aparecem as perguntas em formato JSON. O banco SQLite já vem no arquivo bd/esmforum.db.

## Frontend

Mantenha o backend rodando e abra outro terminal na pasta onde os repositórios foram clonados:

```bash
cd esmforum-react
npm install
npm start
```

A interface fica disponível em http://localhost:3000. Os dois terminais precisam continuar abertos enquanto o sistema estiver em uso. Para encerrar, pressione Ctrl+C em cada um.

Para conferir se tudo funciona, cadastre uma pergunta, adicione uma resposta e atualize a página. No teste feito após a instalação, os dados continuaram salvos e o contador de respostas foi atualizado.

## Se a instalação falhar no SQLite

Durante a instalação, apareceu no pacote sqlite3 o erro No prebuilt binaries found, com versão N-API undefined. Se isso acontecer, execute na pasta esmforum:

```bash
npm install --ignore-scripts
npm rebuild --foreground-scripts
```

Na instalação do projeto, o segundo comando preparou o better-sqlite3, mas ainda falhou no sqlite3. Para concluir a instalação desse pacote:

```bash
cd node_modules/sqlite3
node ../prebuild-install/bin.js -r napi -t 6
cd ../..
node server.js
```

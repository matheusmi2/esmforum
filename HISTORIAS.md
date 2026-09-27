# Histórias de usuário

As funcionalidades escolhidas são votação, busca por palavra-chave e tags. As histórias abaixo seguem a ordem de prioridade do quadro no GitHub Projects.

## 1. Sistema de votação em perguntas

Como usuário do fórum, eu quero votar de forma positiva ou negativa nas perguntas para indicar quais considero úteis para a comunidade.

Critérios de aceitação:

- [ ] Cada pergunta deve exibir botões de upvote e downvote, a pontuação e uma indicação do voto do usuário, caso ele já tenha votado.
- [ ] A pontuação deve ser a quantidade de votos positivos menos a quantidade de votos negativos. Após a confirmação do servidor, ela deve ser atualizada na tela sem recarregar a página.
- [ ] Cada usuário pode ter apenas um voto por pergunta. Repetir o envio do mesmo voto não pode aumentar ou diminuir a pontuação novamente.
- [ ] O usuário pode trocar seu voto ou retirá-lo. A troca deve substituir o voto anterior, e a retirada deve deixar a pergunta sem voto daquele usuário.
- [ ] Os votos e a pontuação devem continuar salvos após atualizar a página, e o voto anterior deve aparecer ao acessar a pergunta com o mesmo usuário.

## 2. Busca de perguntas por palavra-chave

Como usuário do fórum, eu quero buscar perguntas por palavra-chave para encontrar discussões sobre o que estou procurando sem precisar ler toda a lista.

Critérios de aceitação:

- [ ] A página de perguntas deve ter um campo para digitar o termo e uma opção para iniciar a busca.
- [ ] O resultado deve mostrar apenas as perguntas cujo texto contém o termo informado, sem diferenciar letras maiúsculas de minúsculas.
- [ ] Quando nenhuma pergunta contiver o termo, a página deve informar que não foram encontrados resultados.
- [ ] Ao limpar o campo de busca, a lista completa de perguntas deve voltar a aparecer.
- [ ] Cada pergunta encontrada deve permitir abrir suas respostas, da mesma forma que na lista completa.

## 3. Categorização de perguntas com tags

Como usuário do fórum, eu quero associar tags às perguntas e filtrar a lista por assunto para encontrar discussões de meu interesse.

Critérios de aceitação:

- [ ] Ao cadastrar uma pergunta, o usuário deve poder escolher uma ou mais tags entre as opções disponíveis, incluindo tecnologia, carreira e dúvidas-gerais.
- [ ] As tags escolhidas devem aparecer junto à pergunta, tanto na lista quanto na página de respostas.
- [ ] Ao selecionar uma tag no filtro, a lista deve mostrar apenas perguntas associadas a ela. Ao retirar o filtro, a lista completa deve voltar a aparecer.
- [ ] Quando não houver perguntas com a tag selecionada, a página deve informar que não foram encontrados resultados.
- [ ] As tags de uma pergunta devem continuar salvas após atualizar a página. Uma mesma tag não pode aparecer repetida na mesma pergunta.

## Justificativa da prioridade

A votação vem primeiro porque permite que os usuários avaliem as perguntas já publicadas. Ela acrescenta uma forma de participação além de perguntar e responder, e a pontuação ajuda a reconhecer quais perguntas receberam mais votos positivos.

A busca fica em segundo porque facilita encontrar uma discussão existente. Conforme a lista cresce, procurar uma pergunta manualmente fica mais demorado. Encontrar uma pergunta já respondida também pode evitar a publicação de outra sobre a mesma dúvida.

As tags vêm depois da busca. Elas ajudam a separar os assuntos, mas dependem de que as perguntas sejam classificadas. A busca já pode ser usada no texto das perguntas existentes, mesmo quando elas ainda não têm tags.

A votação depende da identificação do usuário para impedir votos repetidos. Essa definição deve acontecer antes da implementação da primeira história. Se ela ficar bloqueada, a busca pode começar antes, com a mudança de prioridade registrada no quadro.

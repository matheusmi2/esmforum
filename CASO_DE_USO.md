# Caso de uso: Votar em pergunta

## Ator

Usuário identificado no fórum.

## Pré-condições

- O sistema deve reconhecer qual usuário está realizando a ação.
- A pergunta deve estar cadastrada e aparecer na interface.
- O usuário deve ter acesso aos botões de votação da pergunta.

## Fluxo principal

1. O sistema mostra a pergunta, os botões de upvote e downvote, a pontuação e o voto atual do usuário, se houver.
2. O usuário escolhe um voto positivo ou negativo.
3. O frontend envia ao backend a pergunta escolhida e o tipo de voto. O backend identifica o usuário que fez a solicitação.
4. O sistema confere se a pergunta ainda existe e se o voto recebido é positivo ou negativo.
5. O sistema consulta se esse usuário já tem um voto na pergunta. Neste fluxo, ainda não existe um voto. Se o voto enviado for igual ao que já está salvo, o sistema mantém o registro e segue para o passo 7, sem contar o voto duas vezes.
6. O sistema salva o voto, ligado ao usuário e à pergunta, sem permitir mais de um voto para essa combinação.
7. O sistema calcula a pontuação, subtraindo a quantidade de votos negativos da quantidade de votos positivos, e devolve o resultado ao frontend junto com o voto do usuário.
8. A interface mostra a nova pontuação e marca o botão escolhido, sem recarregar a página.

## Fluxos alternativos

### A1. Trocar o voto

No passo 5, o sistema encontra um voto do usuário com o valor oposto ao escolhido.

1. O sistema substitui o voto anterior pelo novo, mantendo apenas um voto desse usuário na pergunta.
2. O fluxo continua no passo 7, com o cálculo da pontuação e a atualização da interface.

Por exemplo, trocar um voto positivo por um negativo reduz a pontuação em dois pontos. O voto positivo deixa de contar e o negativo passa a contar.

### A2. Retirar o voto

No passo 2, o usuário escolhe a opção de retirar seu voto, disponível quando já existe um voto marcado.

1. O frontend envia o pedido de retirada para a pergunta escolhida.
2. O backend identifica o usuário e confere se a pergunta existe.
3. O sistema remove apenas o voto desse usuário nessa pergunta. Se o voto já tiver sido removido, nenhum outro registro é alterado.
4. O sistema calcula a pontuação e envia o resultado ao frontend, informando que o usuário está sem voto.
5. A interface atualiza a pontuação e deixa os dois botões sem marcação.

## Pós-condições

Quando a operação termina com sucesso, o banco guarda o voto escolhido, ou deixa de guardar o voto daquele usuário caso ele tenha sido retirado. A interface mostra a pontuação devolvida pelo backend e o estado do voto do usuário.

Cada usuário continua tendo no máximo um voto por pergunta. Depois de atualizar a página, a pontuação e o voto salvo devem aparecer de novo para o mesmo usuário.

Quando a solicitação é recusada antes da gravação, os votos permanecem como estavam.

# Planejamento do projeto

[Quadro no GitHub Projects](https://github.com/users/matheusmi2/projects/5)

## Por que usar Kanban

Escolhi o Kanban porque consigo acompanhar as cinco funcionalidades no mesmo quadro. Basta olhar as colunas para saber o que ainda falta fazer e o que já está pronto. Para este projeto, não vi necessidade de organizar o trabalho em sprints.

O trabalho vai seguir um fluxo contínuo. Quando uma tarefa terminar, pego a próxima pela ordem de prioridade. Vou manter no máximo uma tarefa em desenvolvimento para não acumular coisas começadas.

## Colunas

Mantive as colunas que vieram no modelo do GitHub:

- **Backlog:** onde ficam as funcionalidades planejadas, em ordem de prioridade.
- **Ready:** tarefas que já têm os requisitos definidos e podem ser iniciadas.
- **In Progress:** o que estou desenvolvendo no momento. O limite será de uma tarefa.
- **In Review:** o código já foi escrito, mas falta revisar e testar.
- **Done:** a tarefa foi conferida e atende aos critérios de aceitação.

Por enquanto, os cinco cards estão no Backlog. As descrições já foram preenchidas, mas ainda falta resolver algumas questões antes de começar a implementação.

## Prioridades

Coloquei a votação primeiro porque ela permite que os usuários indiquem quais perguntas acham úteis. Depois vem a busca, para encontrar uma pergunta sem precisar olhar a lista inteira. As tags ficam em terceiro e ajudam a procurar perguntas de um assunto específico.

O perfil vem depois desses recursos e vai reunir as publicações de cada usuário. Por último ficam as notificações de novas respostas. Com elas, o autor não precisa ficar abrindo a pergunta para ver se alguém respondeu.

A ordem no quadro ficou assim:

1. Sistema de votação em perguntas
2. Busca de perguntas por palavra-chave
3. Categorização de perguntas com tags
4. Perfil de usuário com histórico de perguntas e respostas
5. Notificação de novas respostas às próprias perguntas

Antes de implementar a votação, preciso resolver como identificar quem está votando. Hoje o backend usa um usuário fixo para cadastrar perguntas. Sem essa definição, não dá para garantir apenas um voto por pessoa. O perfil e as notificações também precisam dessa identificação. Se isso impedir o início da votação, posso adiantar a busca e ajustar a ordem no quadro.

## Como vou acompanhar

Quando os requisitos estiverem claros e não houver pendências para começar, movo o card para Ready. Ao pegar a tarefa, passo para In Progress.

Depois de implementar, movo para In Review e confiro os critérios escritos na descrição. Também testo a função pela interface, com o backend rodando. Se encontrar algum problema, volto o card para In Progress e faço a correção. Só marco como Done depois dessa conferência.

Vou priorizar a revisão e a conclusão da tarefa atual antes de começar outra.

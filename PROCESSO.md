# Planejamento do projeto

[Quadro no GitHub Projects](https://github.com/users/matheusmi2/projects/5)

## Por que usar Kanban

O Kanban permite acompanhar as cinco funcionalidades no mesmo quadro. As colunas mostram o que falta fazer e o que já está pronto. Como o projeto tem poucas tarefas, as tarefas podem ser feitas sem dividir o trabalho em sprints.

O trabalho seguirá um fluxo contínuo, com uma tarefa em desenvolvimento por vez. A próxima será escolhida pela ordem de prioridade, depois que a tarefa atual terminar.

## Colunas

O quadro usa as cinco colunas do modelo do GitHub:

- Backlog: onde ficam as funcionalidades planejadas, em ordem de prioridade.
- Ready: tarefas que já têm os requisitos definidos e podem ser iniciadas.
- In Progress: tarefa em desenvolvimento. O limite será de uma tarefa.
- In Review: o código já foi escrito, mas falta revisar e testar.
- Done: a tarefa foi conferida e atende aos critérios de aceitação.

Por enquanto, os cinco cards estão no Backlog. As descrições já foram preenchidas, mas ainda há pontos que precisam ser definidos antes de começar a implementação.

## Prioridades

A votação aparece primeiro na lista porque permite que os usuários indiquem quais perguntas acham úteis. Depois vem a busca, para encontrar uma pergunta sem precisar olhar a lista inteira. As tags ficam em terceiro e ajudam a procurar perguntas de um assunto específico.

O perfil vem depois desses recursos e vai reunir as publicações de cada usuário. Por último ficam as notificações de novas respostas. Com elas, o autor não precisa ficar abrindo a pergunta para ver se alguém respondeu.

A ordem no quadro ficou assim:

1. Sistema de votação em perguntas
2. Busca de perguntas por palavra-chave
3. Categorização de perguntas com tags
4. Perfil de usuário com histórico de perguntas e respostas
5. Notificação de novas respostas às próprias perguntas

Antes de implementar a votação, é necessário definir como identificar quem está votando. Hoje o backend usa um usuário fixo para cadastrar perguntas. Sem essa definição, não dá para garantir apenas um voto por pessoa. O perfil e as notificações também precisam dessa identificação. Se isso impedir o início da votação, a busca pode ser adiantada, e a ordem no quadro deve acompanhar essa mudança.

## Acompanhamento das tarefas

O card passa para Ready quando os requisitos estão definidos e não há nenhum problema que impeça começar a tarefa. Durante a implementação, fica em In Progress.

Em In Review, a revisão usa os critérios de aceitação descritos no card. Os testes pela interface verificam o funcionamento junto com o backend. Se houver algum problema, a tarefa volta para In Progress. O card só passa para Done depois que os problemas forem corrigidos e a tarefa passar pela revisão e pelos testes.

Antes de começar outra tarefa, a prioridade é revisar e terminar a que já está em andamento.

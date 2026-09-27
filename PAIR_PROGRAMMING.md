# Planejamento de pair programming

O planejamento de pair programming considera duas pessoas trabalhando juntas na mesma tarefa, trocando os papéis de driver e navigator durante a sessão.

## Organização das sessões

Cada sessão teria cerca de uma hora e começaria pela escolha de uma parte da tarefa no GitHub Projects. Na votação, por exemplo, uma sessão poderia ser dedicada à regra de um voto por usuário. Antes de escrever o código, a dupla precisaria combinar como a função deve se comportar e quais situações precisam ser testadas.

As duas pessoas trabalhariam no mesmo problema. Durante essas sessões, a dupla não dividiria o trabalho deixando uma pessoa no backend e outra no frontend.

## Papéis e troca

O driver ficaria responsável por escrever o código e executar os testes, explicando as alterações durante o trabalho.

O navigator acompanharia o código, conferiria os requisitos e apontaria possíveis problemas. Na votação, isso significa conferir o que acontece quando alguém tenta votar duas vezes ou troca um voto positivo por um negativo.

Os papéis seriam trocados a cada 25 minutos. Antes da troca, a dupla conferiria o que mudou no código e o que falta resolver. Na sessão seguinte, quem começou como driver na sessão anterior começaria como navigator.

## Ferramentas

O VS Code Live Share seria usado para acompanhar e editar o mesmo código. A conversa aconteceria por uma chamada no Discord. Se houvesse algum problema com o Live Share, a dupla poderia continuar a sessão pelo compartilhamento de tela, com a troca de quem apresenta e escreve o código.

O GitHub guardaria as alterações, e o card no Projects mostraria o que já foi feito e o que ainda falta na tarefa.

## Aplicação nas funcionalidades

Na busca, a dupla poderia começar pelos testes de maiúsculas e minúsculas e de termos sem resultado. Nas tags, conferiria se as tags foram ligadas à pergunta correta e se o filtro por assunto funciona. No perfil e nas notificações, seria preciso conferir a identificação do usuário, para não misturar publicações ou enviar avisos à pessoa errada.

O driver e o navigator discutiriam as decisões durante a implementação. Uma dúvida sobre a regra da funcionalidade precisaria ser resolvida antes de continuar o trecho que depende dela.

## Fim da sessão

Os últimos minutos da sessão seriam usados para executar os testes e conferir o resultado pela interface, com o backend rodando. As pendências seriam anotadas no card para facilitar a próxima sessão.

O card só iria para Done depois da revisão e da conferência dos critérios de aceitação. Se a sessão terminasse com a funcionalidade incompleta, o card continuaria na coluna que indica o ponto em que o trabalho parou.

# f360-code-review

Skills e Agents para uso de **code reviews** no fluxo de desenvolvimento (revisão cedo e com frequência).

## Recursos

| Tipo   | Recurso                 | Descrição resumida |
|--------|-------------------------|--------------------|
| **Skill**  | `requesting-code-review` | Orienta quando e como pedir revisão (SHAs git, placeholders, priorização Critical/Important/Minor) e integra com desenvolvimento por tarefas ou planos; usa o template em `skills/requesting-code-review/code-reviewer.md`. |
| **Agent**  | `code-reviewer`          | Revisor sênior: alinhamento com plano/requisitos, qualidade e arquitetura do código, documentação e padrões; classifica achados e devolve feedback acionável. |

## Skills

### requesting-code-review

- **Quando usar:** ao concluir tarefas ou features relevantes, ou antes de mergear na branch principal, para verificar se o trabalho atende aos requisitos.
- **O que faz:** define momentos obrigatórios e opcionais de review; descreve como obter `BASE_SHA`/`HEAD_SHA`, preencher o template do subagente de revisão e reagir ao feedback (corrigir críticos, tratar importantes, registrar menores). Inclui exemplos e anti-padrões (pular review, ignorar issues críticas).

## Agents

### code-reviewer

- **Quando usar:** quando uma etapa importante do projeto foi concluída e precisa ser comparada ao plano original e aos padrões de código.
- **O que faz:** analisa aderência ao plano, qualidade (erros, tipos, organização, testes, segurança e performance), arquitetura (SOLID, acoplamento, integração) e documentação; categoriza issues em Critical, Important e Suggestions; comunica de forma construtiva e objetiva.

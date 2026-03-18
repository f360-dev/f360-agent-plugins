# git-workflows

Plugin com fluxos de Git para commits, PRs, CI e resolução de conflitos.

## Recursos

| Tipo   | Recurso              | Descrição resumida |
|--------|----------------------|--------------------|
| **Skill** | `f360-git-conventions` | Convenções de commit e PR da F360: mensagens no estilo Conventional Commits **com ID do Jira** (ex.: `fix(FINC-123): descrição`), títulos e descrições de PR, nomes de branch. Orienta quando escrever/alterar commits, abrir PRs ou revisar branch/PR. |

## Skills

### f360-git-conventions

- **Quando usar:** ao escrever ou alterar mensagens de commit, criar/descrever pull requests ou revisar nomes de branch e títulos de PR.
- **O que faz:** aplica tipos de commit (feat, fix, refactor, docs, chore, test), exige escopo com chave do Jira (ex.: FINC-123), sugere formato de título e descrição de PR e boas práticas para nomes de branch (curtos, com Jira ID quando possível).

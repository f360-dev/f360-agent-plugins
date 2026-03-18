# f360-jira

Skills para interação com o **Jira** da F360.

## Recursos

| Tipo   | Recurso        | Descrição resumida |
|--------|----------------|--------------------|
| **Skill** | `jira-assistant`   | Gerencia issues no Jira via Atlassian MCP: busca, criação, atualização, transição de status e tarefas de sprint. Detecta configuração do workspace (regra jira-config). |
| **Rule**  | `jira-config.mdc`  | Configuração do projeto Jira usada pelo jira-assistant: Project Key, Cloud ID, URL, Board URL. Só deve ser aplicada quando se usa a skill jira-assistant. |

## Skills

### jira-assistant

- **Quando usar:** o usuário pede para criar ticket no Jira, atualizar sprint, ver status, fazer transição de issue, buscar no Jira ou mover ticket para done. Não usar para páginas do Confluence (usar confluence-assistant).
- **O que faz:** lê a config em `.cursor/rules/jira-config.mdc` (workspace) ou `~/.cursor/rules/jira-config.mdc` (usuário); usa busca natural e JQL (sempre com `project = {PROJECT_KEY}`); cria/edita issues, transições e comentários; aplica template padrão de descrição (Context, Objective, Technical Requirements, Acceptance Criteria, Technical Notes, Estimate). Inclui exemplos de criação de task/subtask, busca e transição.

## Rules

### jira-config.mdc

- **Quando usar:** apenas quando a skill **jira-assistant** estiver em uso.
- **O que faz:** define Project Key (ex.: FINC), Cloud ID, URL do Jira, nome do projeto e URL do board para que o jira-assistant use esses valores em todas as operações.

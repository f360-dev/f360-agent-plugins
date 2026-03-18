# Plugins Cursor F360

Marketplace de plugins do Cursor mantido pela F360, com skills, regras e agentes para fluxos de desenvolvimento e documentação.

## Plugins incluídos

- **git-workflows** — Fluxos de Git para commits, PRs, CI e resolução de conflitos de merge
- **documentation** — Skills e agente para documentação: README, revisões semanais e convenções em Markdown
- **f360-libs-csharp** — Skills para o repositório f360-libs-csharp
- **f360-financas** — Skills, Rules e Agents para o repositório f360-financas
- **f360-jira** — Skills para interação com o Jira da F360

## Estrutura do repositório

- `.cursor-plugin/marketplace.json` — manifesto do marketplace e registro dos plugins
- `plugins/<nome-do-plugin>/.cursor-plugin/plugin.json` — metadados de cada plugin
- `plugins/<nome-do-plugin>/rules` — arquivos de regras (`.mdc`)
- `plugins/<nome-do-plugin>/skills` — pastas de skills com `SKILL.md`
- `plugins/<nome-do-plugin>/agents` — definições de subagentes
- `plugins/<nome-do-plugin>/mcp.json` — configuração de servidores MCP por plugin

## Como contribuir

1. Crie ou edite recursos (plugins, skills, rules, agents) dentro da estrutura descrita acima.
2. **Antes de enviar um novo recurso ou alteração**, execute o script de validação:

   ```bash
   node scripts/validate-template.mjs
   ```

   Esse script verifica:
   - caminhos e entradas do marketplace
   - manifestos dos plugins (`.cursor-plugin/plugin.json`)
   - frontmatter obrigatório em arquivos de regras, skills, agents e commands

   A contribuição só deve ser subida se a validação passar sem erros.

3. Garanta que:
   - cada plugin tenha um `plugin.json` válido em `.cursor-plugin/`
   - os nomes dos plugins sejam únicos, em minúsculas e no formato kebab-case
   - as entradas em `.cursor-plugin/marketplace.json` apontem para pastas de plugins existentes
   - os arquivos de conteúdo dos plugins tenham os metadados de frontmatter exigidos
   - os caminhos de logo nos manifestos resolvam corretamente para cada plugin

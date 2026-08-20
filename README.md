# Plugins de Agentes F360

Marketplace de plugins de agentes da F360 mantido para uso em Cursor, Codex e Claude, com skills, regras, agentes e configuracoes MCP para fluxos de desenvolvimento, documentacao e produto.

## Plugins incluidos

- **git-workflows** - Fluxos de Git para commits, PRs, CI e resolucao de conflitos de merge
- **documentation** - Skills e agente para documentacao: README, revisoes semanais e convencoes em Markdown
- **f360-libs-csharp** - Skills para o repositorio f360-libs-csharp
- **f360-financas** - Skills, Rules e Agents para o repositorio f360-financas
- **f360-jira** - Skills para interacao com o Jira da F360
- **f360-code-review** - Skills e Agents para solicitar e conduzir code reviews no fluxo de desenvolvimento

## Estrutura do repositorio

- `.cursor-plugin/marketplace.json` - manifesto do marketplace para Cursor
- `.claude-plugin/marketplace.json` - manifesto do marketplace para Claude
- `.agents/plugins/marketplace.json` - manifesto do marketplace para Codex
- `plugins/<nome-do-plugin>/.cursor-plugin/plugin.json` - metadados do plugin para Cursor
- `plugins/<nome-do-plugin>/.claude-plugin/plugin.json` - metadados do plugin para Claude
- `plugins/<nome-do-plugin>/.codex-plugin/plugin.json` - metadados do plugin para Codex
- `plugins/<nome-do-plugin>/rules` - arquivos de regras (`.md`, `.mdc` ou `.markdown`)
- `plugins/<nome-do-plugin>/skills` - pastas de skills com `SKILL.md`
- `plugins/<nome-do-plugin>/agents` - definicoes de subagentes
- `plugins/<nome-do-plugin>/commands` - comandos em Markdown ou texto
- `plugins/<nome-do-plugin>/.mcp.json` - configuracao de servidores MCP, quando o plugin usar MCP
- `plugins/<nome-do-plugin>/assets` - logos e imagens referenciadas pelos manifestos

## Como contribuir

Veja o passo a passo completo em [docs/add-a-plugin.md](docs/add-a-plugin.md).

1. Crie ou edite recursos dentro de `plugins/<nome-do-plugin>/`.
2. Para novos plugins, mantenha os tres manifestos do plugin:
   - `.cursor-plugin/plugin.json`
   - `.claude-plugin/plugin.json`
   - `.codex-plugin/plugin.json`
3. Registre novos plugins nos marketplaces raiz que usam lista publica:
   - `.cursor-plugin/marketplace.json`
   - `.claude-plugin/marketplace.json`
   - `.agents/plugins/marketplace.json`
4. Execute o validador antes de enviar a alteracao:

   ```bash
   node scripts/validate-template.mjs
   ```

   A contribuicao so deve ser subida se a validacao passar sem erros.

## Compatibilidade por cliente

Cada adicao deve continuar instalavel nos tres clientes:

- **Cursor** usa `.cursor-plugin/marketplace.json` no repositorio e `plugins/<nome>/.cursor-plugin/plugin.json` por plugin. O manifesto deve ter `name`, `displayName`, `version`, `description`, `author.name` e caminhos validos para assets ou recursos declarados.
- **Claude** usa `.claude-plugin/marketplace.json` no repositorio e `plugins/<nome>/.claude-plugin/plugin.json` por plugin. O manifesto deve ter `name`, `displayName`, `version`, `description`, `author.name` e, quando declarar `skills`, `agents` ou `mcpServers`, esses caminhos precisam existir.
- **Codex** usa `plugins/<nome>/.codex-plugin/plugin.json` por plugin. O manifesto deve ter `name`, `version`, `description`, `author.name`, `skills` quando houver skills e um bloco `interface` com `displayName`, `shortDescription`, `developerName`, `category`, `capabilities`, `logo` e `composerIcon`.

## Regras de formato

- O nome do plugin deve ser unico, em minusculas, e usar apenas letras, numeros, hifens ou pontos.
- As entradas de marketplace devem apontar para pastas existentes em `plugins/`.
- O `name` de cada manifesto deve bater com o nome registrado no marketplace e com a pasta do plugin.
- Caminhos em manifestos devem ser relativos ao diretorio do plugin, nao podem sair da pasta com `..` e precisam resolver para arquivos ou diretorios existentes.
- `SKILL.md` deve ter frontmatter YAML com `name` e `description`.
- Arquivos em `agents/` e `commands/` devem ter frontmatter YAML com `name` e `description`.
- Arquivos em `rules/` devem ter frontmatter YAML com `description`.
- Hooks e MCP continuam opcionais; declare `hooks`, `mcpServers` ou `.mcp.json` apenas quando o plugin realmente usar esses recursos.

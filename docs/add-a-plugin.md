# Como adicionar um plugin

Use este guia para criar ou alterar plugins mantendo compatibilidade com Cursor, Claude e Codex.

## 1. Crie a pasta do plugin

Crie uma pasta em `plugins/` usando nome em minusculas, no formato kebab-case:

```text
plugins/meu-novo-plugin/
```

Dentro dela, crie os manifestos especificos de cada cliente:

```text
plugins/meu-novo-plugin/.cursor-plugin/plugin.json
plugins/meu-novo-plugin/.claude-plugin/plugin.json
plugins/meu-novo-plugin/.codex-plugin/plugin.json
```

## 2. Adicione os componentes compartilhados

Adicione apenas os recursos que o plugin realmente usa:

- `skills/<nome-da-skill>/SKILL.md` para skills
- `rules/*.mdc`, `rules/*.md` ou `rules/*.markdown` para regras
- `agents/*.md` para agentes
- `commands/*.(md|mdc|markdown|txt)` para comandos
- `hooks/hooks.json` e `scripts/*` para hooks de automacao
- `.mcp.json` para servidores MCP
- `assets/*` para logos e imagens

### Frontmatter obrigatorio

Arquivos de conteudo precisam de frontmatter YAML:

```md
---
name: minha-skill
description: Descreve quando esta skill deve ser usada.
---
```

Regras em `rules/` precisam pelo menos de `description`. Skills, agents e commands precisam de `name` e `description`.

## 3. Crie o manifesto para Cursor

Exemplo de `plugins/meu-novo-plugin/.cursor-plugin/plugin.json`:

```json
{
  "name": "meu-novo-plugin",
  "displayName": "Meu Novo Plugin",
  "version": "0.1.0",
  "description": "Descreva o que este plugin faz.",
  "author": {
    "name": "F360",
    "email": "dev@f360.com.br"
  },
  "license": "MIT",
  "keywords": ["cursor", "plugin", "f360"],
  "logo": "assets/f360-icon.png"
}
```

Inclua campos como `rules`, `skills`, `agents`, `commands`, `hooks` ou `mcpServers` apenas quando o Cursor precisar referencia-los diretamente.

## 4. Crie o manifesto para Claude

Exemplo de `plugins/meu-novo-plugin/.claude-plugin/plugin.json`:

```json
{
  "name": "meu-novo-plugin",
  "displayName": "Meu Novo Plugin",
  "version": "0.1.0",
  "description": "Descreva o que este plugin faz.",
  "author": {
    "name": "F360",
    "email": "dev@f360.com.br"
  },
  "license": "MIT",
  "keywords": ["cursor", "codex", "claude", "plugin", "f360"],
  "skills": "./skills/",
  "logo": "assets/f360-icon.png"
}
```

Se o plugin tiver agentes ou MCP, adicione:

```json
{
  "agents": "./agents/",
  "mcpServers": "./.mcp.json"
}
```

## 5. Crie o manifesto para Codex

Exemplo de `plugins/meu-novo-plugin/.codex-plugin/plugin.json`:

```json
{
  "name": "meu-novo-plugin",
  "version": "0.1.0",
  "description": "Descreva o que este plugin faz.",
  "author": {
    "name": "F360",
    "email": "dev@f360.com.br"
  },
  "license": "MIT",
  "keywords": ["cursor", "codex", "claude", "plugin", "f360"],
  "skills": "./skills/",
  "interface": {
    "displayName": "Meu Novo Plugin",
    "shortDescription": "Descreva o que este plugin faz.",
    "developerName": "F360",
    "category": "Productivity",
    "capabilities": ["Workflow"],
    "logo": "./assets/f360-icon.png",
    "composerIcon": "./assets/f360-icon.png"
  }
}
```

Se o plugin usar MCP, adicione:

```json
{
  "mcpServers": "./.mcp.json"
}
```

## 6. Configure MCP, se necessario

Use `.mcp.json` como arquivo canonico para servidores MCP:

```json
{
  "mcpServers": {
    "Meu-MCP-Server": {
      "url": "https://mcp.exemplo.com/v1/mcp"
    }
  }
}
```

Evite duplicar a mesma configuracao em `.mcp.json` e `mcp.json`. Mantenha `mcp.json` somente quando um cliente ou ferramenta legado ainda depender desse nome.

## 7. Registre o plugin nos marketplaces

### Cursor

Edite `.cursor-plugin/marketplace.json`:

```json
{
  "name": "meu-novo-plugin",
  "source": "meu-novo-plugin",
  "description": "Descreva o que este plugin faz."
}
```

Quando `metadata.pluginRoot` estiver configurado como `plugins`, use apenas o nome da pasta no campo `source`.

### Claude

Edite `.claude-plugin/marketplace.json`:

```json
{
  "name": "meu-novo-plugin",
  "source": "./plugins/meu-novo-plugin",
  "description": "Descreva o que este plugin faz.",
  "version": "0.1.0",
  "author": {
    "name": "F360",
    "email": "dev@f360.com.br"
  },
  "category": "productivity"
}
```

### Codex

Edite `.agents/plugins/marketplace.json`:

```json
{
  "name": "meu-novo-plugin",
  "source": {
    "source": "local",
    "path": "./plugins/meu-novo-plugin"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Productivity"
}
```

## 8. Valide antes de abrir PR

Execute:

```bash
node scripts/validate-template.mjs
```

Corrija todos os erros antes de enviar a alteracao. Avisos sobre hooks ou MCP ausentes podem ser ignorados quando o plugin nao usa esses recursos.

## Erros comuns

- Criar o plugin em `plugins/`, mas esquecer um dos manifestos `.cursor-plugin`, `.claude-plugin` ou `.codex-plugin`.
- Usar nomes com maiusculas, espacos ou underscores.
- Registrar `source` apontando para uma pasta que nao existe.
- Declarar `skills`, `agents`, `mcpServers`, `logo` ou `composerIcon` com caminho quebrado.
- Duplicar MCP em `.mcp.json` e `mcp.json` sem necessidade.
- Esquecer frontmatter em `SKILL.md`, agents, commands ou rules.

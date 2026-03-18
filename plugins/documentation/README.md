# documentation

Plugin focado em documentação: README, revisões, convenções em Markdown e escrita técnica.

## Recursos

| Tipo   | Recurso        | Descrição resumida |
|--------|----------------|--------------------|
| **Skill** | `docs-architect`   | Cria documentação técnica longa a partir do código: analisa arquitetura, padrões e implementação para gerar manuais e ebooks. Inclui descoberta, estruturação e escrita, com diagramas e seções (resumo, arquitetura, decisões, componentes, integrações, etc.). |
| **Skill** | `markdown-naming`   | Convenções de nomenclatura para arquivos Markdown e de configuração do Cursor (rules `.mdc`, agents, skills). Define padrões como `{domínio}-{propósito}.mdc`, `{ação}-{alvo}` para skills e uso de kebab-case. |
| **Skill** | `update-readme`     | Gera ou atualiza o README do repositório com instruções de inicialização e diagrama de arquitetura em Mermaid. Usar ao criar README, atualizar documentação do projeto ou onboarding. |
| **Agent** | `docs-writer`       | Subagente especialista em documentação de código, APIs e guias: docstrings, comentários, referências de API (endpoints, schemas, exemplos) e guias de usuário (getting started, how-to, troubleshooting). |

## Skills

### docs-architect

- **Quando usar:** tarefas de arquitetura de documentação ou necessidade de manuais técnicos longos a partir do codebase.
- **O que faz:** analisa estrutura e dependências do código, extrai padrões e fluxos, organiza em capítulos/seções e produz documentação em Markdown com diagramas e exemplos.

### markdown-naming

- **Quando usar:** ao criar ou renomear arquivos `.md` ou `.mdc` no projeto.
- **O que faz:** aplica kebab-case e padrões por tipo (rules: `{domínio}-{propósito}`, agents: `{role}-{specialization}`, skills: `{ação}-{alvo}`).

### update-readme

- **Quando usar:** criar README, atualizar documentação do projeto, onboarding ou quando o usuário pedir “README”, “guia de inicialização” ou “visão de arquitetura”.
- **O que faz:** analisa o repositório (runtime, CI, config, entry points), monta instruções de startup e diagrama Mermaid de arquitetura e escreve/atualiza o README preservando badges e seções manuais.

## Agents

### docs-writer

- **Quando usar:** quando for explicitamente pedido para escrever ou atualizar documentação.
- **O que faz:** identifica o que documentar e o público-alvo, redige documentação de código (docstrings, tipos), de API (endpoints, schemas, exemplos) e guias (getting started, how-to, configuração, troubleshooting).

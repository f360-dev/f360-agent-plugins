# f360-libs-csharp

Skills para o repositório **f360-libs-csharp** (F360.Reader.Integracoes, F360.Service.API.Integracoes e afins).

## Recursos

| Tipo   | Recurso                 | Descrição resumida |
|--------|-------------------------|--------------------|
| **Skill** | `f360-reader-integrations` | Guia para adicionar ou alterar leitores de **PDV** e de **Adquirente (Operadora de Cartão)** no F360.Reader.Integracoes: Strategy, Reader, Parser, modelos PDVReaderModel/OperadoraCartaoReaderModel e Notas. |
| **Skill** | `f360-service-api-integracoes` | Guia para integrações REST/S3 em **F360.Service.API.Integracoes**: `IntegracaoBase<T>` (Template Method), `IIntegracao`, autenticação, paginação, modelos por strategy, testes com `FakeApi` e `StrategyTestBase`. |

## Skills

### f360-reader-integrations

- **Quando usar:** adicionar novo PDV ou Operadora/Adquirente; implementar ou alterar Strategy/Reader/Parser; mapear arquivos para `PDVReaderModel` ou `OperadoraCartaoReaderModel`; ou quando o usuário citar Reader.Integracoes, CONTRIBUTING, leitor de PDV ou de Adquirente.
- **O que faz:** descreve a arquitetura (Strategy → Reader → Parser → modelo + Notas), a estrutura de pastas obrigatória para PDV e Operadora, passos para novo PDV (Models, VendaParser, Reader, Strategy, testes, DI) e para nova Operadora (idem), contratos de retorno (vendas/notas, cartões/notas), regras de código e checklist antes do PR. Referencia CONTRIBUTING.md, EXEMPLO_PRATICO.md e PADROES_E_BOAS_PRATICAS.md do repositório F360.Reader.Integracoes.

### f360-service-api-integracoes

- **Quando usar:** nova integração na lib **F360.Service.API.Integracoes**; implementar ou alterar uma **Strategy**; criar modelos de response; escrever testes com **FakeApi** / **StrategyTestBase**; ou quando o usuário citar `IntegracaoBase`, `IIntegracao`, `TipoIntegracao`, `ExecutarFluxo`, `Normalizar`, `Desserializar` ou paginação nesse projeto.
- **O que faz:** descreve o padrão Strategy + Template Method (`Executar` → autenticação opcional, `ExecutarFluxo`, desserialização, `ApiRetornouMovimentos`, `Normalizar`), estrutura de pastas por integração, autenticação (OAuth/Bearer/ApiKey), paginação com `ExecutarRequisicaoPaginada`, integrações S3, cenários mínimos de teste (200, 204, erros HTTP) e regras (`TipoIntegracao` único, modelos locais à strategy). Referencia `IntegracaoBase.cs`, `IIntegracao.cs`, `StrategyTestBase` / `FakeApi` e os documentos CONTRIBUTING.md e PADROES_E_BOAS_PRATICAS.md do repositório da lib.

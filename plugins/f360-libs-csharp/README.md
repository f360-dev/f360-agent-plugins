# f360-libs-csharp

Skills para o repositório **f360-libs-csharp** (F360.Reader.Integracoes e afins).

## Recursos

| Tipo   | Recurso                 | Descrição resumida |
|--------|-------------------------|--------------------|
| **Skill** | `f360-reader-integrations` | Guia para adicionar ou alterar leitores de **PDV** e de **Adquirente (Operadora de Cartão)** no F360.Reader.Integracoes: Strategy, Reader, Parser, modelos PDVReaderModel/OperadoraCartaoReaderModel e Notas. |

## Skills

### f360-reader-integrations

- **Quando usar:** adicionar novo PDV ou Operadora/Adquirente; implementar ou alterar Strategy/Reader/Parser; mapear arquivos para `PDVReaderModel` ou `OperadoraCartaoReaderModel`; ou quando o usuário citar Reader.Integracoes, CONTRIBUTING, leitor de PDV ou de Adquirente.
- **O que faz:** descreve a arquitetura (Strategy → Reader → Parser → modelo + Notas), a estrutura de pastas obrigatória para PDV e Operadora, passos para novo PDV (Models, VendaParser, Reader, Strategy, testes, DI) e para nova Operadora (idem), contratos de retorno (vendas/notas, cartões/notas), regras de código e checklist antes do PR. Referencia CONTRIBUTING.md, EXEMPLO_PRATICO.md e PADROES_E_BOAS_PRATICAS.md do repositório F360.Reader.Integracoes.

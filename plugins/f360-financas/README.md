# f360-financas

Skills, Rules e Agents para o repositório **f360-financas**.

## Recursos

| Tipo   | Recurso                         | Descrição resumida |
|--------|---------------------------------|--------------------|
| **Skill** | `f360-adicionar-leitura-adquirente` | Passo a passo para incluir nova leitura de adquirente (arquivo ou API) no F360 Finanças: enums no Domain, factory no FileImporter, roteamento no GlobalBLL, triagem opcional e parâmetros. |

## Skills

### f360-adicionar-leitura-adquirente

- **Quando usar:** adicionar nova adquirente com upload de arquivo (CSV, XLSX etc.), nova API de adquirente cujo retorno é tratado como “arquivo”, ou novo valor de `TipoDeArquivoComplementar` para operadora de cartão.
- **O que faz:** descreve dois caminhos — **A) Integrações (F360.Reader):** Domain (TipoDeArquivoComplementar, OperadoraDeCartao), Strategy no pacote Integracoes, factory no FileImporter, GlobalBLL.tiposPermitidosLeitorPadrao, triagem opcional em ArquivoBLL, catálogo VersaoIntegracao; **B) Leitor específico no repositório:** reader próprio, else-if em ConciliacaoBLL, triagem e ServiceReader/API opcionais. Inclui tabela de arquivos principais e convenções (terminologia adquirente/operadora, pacote F360.Reader.Integracoes, AdditionalInformations).

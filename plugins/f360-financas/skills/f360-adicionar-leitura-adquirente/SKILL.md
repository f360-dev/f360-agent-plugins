---
name: f360-adicionar-leitura-adquirente
description: Step-by-step guide to add new acquirer (adquirente) file readings in F360 Finanças. Covers Domain enums, Integracoes factory, GlobalBLL routing, optional triage and parameters. Use when adding a new adquirente reader, new TipoDeArquivoComplementar for operadora, or integrating a new card acquirer file/API.
---

# Adicionar nova leitura de adquirente no Finanças

Fluxo para incluir uma nova leitura de adquirente (arquivo ou API) no F360 Finanças. Existem dois caminhos: **Integrações (F360.Reader)** — preferencial para leituras via estratégia no pacote — e **leitor específico** no repositório (ex.: API Justa, BankPay).

## Quando usar

- Nova adquirente com importação por **upload de arquivo** (CSV, XLSX, etc.)
- Nova **API de adquirente** (vendas/pagamentos) cujo retorno é processado como “arquivo”
- Novo valor de `TipoDeArquivoComplementar` para operadora de cartão

## Caminho A: Leitura via Integrações (F360.Reader)

Usado quando a leitura é implementada por uma **strategy** do pacote `F360.Reader.Integracoes` e registrada na factory do FileImporter.

### Checklist

```
- [ ] 1. Domain: TipoDeArquivoComplementar
- [ ] 2. Domain: OperadoraDeCartao (se nova operadora)
- [ ] 3. F360.Reader.Integracoes: Strategy (IReaderStrategy<OperadoraCartaoReaderModel>)
- [ ] 4. FileImporter: FactoryIntegracoesReaderOperadora
- [ ] 5. FileImporter (se precisar empresa): FactoryReaderParametersOperadora
- [ ] 6. BLL: GlobalBLL.tiposPermitidosLeitorPadrao
- [ ] 7. (Opcional) Triagem: ArquivoBLL IsAdquirenteXxx
- [ ] 8. (Opcional) Catálogo: VersaoIntegracao
```

### Passo a passo

**1. Domain – tipo de arquivo**

- Arquivo: `T4.Financas.Domain/Extension/Arquivo.cs`
- No enum `TipoDeArquivoComplementar`, adicionar novo valor com `[EnumMember, EnumDescription("Adquirente X - ...")]`.
- Usar numeração consistente com os demais (ex.: blocos de Adquirente* já existentes).

**2. Domain – operadora (só se for nova adquirente)**

- Arquivo: `T4.Financas.Domain/OperadoraDeCartao.cs`
- Adicionar novo valor no enum `OperadoraDeCartao` com `[EnumMember, EnumDescription("...")]`.

**3. F360.Reader.Integracoes (pacote externo)**

- Implementar uma strategy que implemente `IReaderStrategy<OperadoraCartaoReaderModel>`.
- A strategy recebe `ReaderParameters` (Stream, e opcionalmente CodigoEstabelecimento etc.) e retorna o resultado processado pelo `ReaderContext` (cartões + notas).
- Referência de estratégias existentes no pacote: `InfopagoStrategy`, `QlubStrategy`, `InfinitePayLiquidacaoStrategy`, `TicketLogStrategy`, `CredishopStrategy`, `BaneseCardStrategy`, `PagaliXlsxStrategy`.

**4. FileImporter – factory de operadora**

- Arquivo: `T4.Financas.FileImporter.RedeCarbonnel/Readers/OperadoraDeCartao/Factory/FactoryIntegracoesReaderOperadora.cs`
- Adicionar entrada no dicionário `Operadora`:
  - Chave: novo `Arquivo.TipoDeArquivoComplementar`
  - Valor: `(OperadoraDeCartao.Xxx, new XxxStrategy())`

**5. FileImporter – parâmetros (quando exige empresa/estabelecimento)**

- Arquivo: `T4.Financas.FileImporter.RedeCarbonnel/Readers/OperadoraDeCartao/Factory/Parameters/FactoryReaderParametersOperadora.cs`
- Se a leitura precisar de **código de estabelecimento** (importação pela tela de Cartões com empresa selecionada), adicionar no dicionário `_factories`:
  - Chave: mesmo `TipoDeArquivoComplementar`
  - Valor: `new ReaderParametersCodigoEstabelecimentoStrategy()`
- Caso contrário, usa-se `ReaderParametersOperadoraDefaultStrategy()` automaticamente.

**6. BLL – roteamento para IntegracoesReaderOperadora**

- Arquivo: `T4.Financas.BLL/GlobalBLL.cs`
- No dicionário `tiposPermitidosLeitorPadrao`, adicionar:
  - Chave: novo `TipoDeArquivoComplementar`
  - Valor: `true` se a importação exige empresa (AdditionalInformations/CustomerDetail); `false` caso contrário.

Assim o `ConciliacaoBLL` encaminha o arquivo para `IntegracoesReaderOperadora().ImportarAdquirente(arquivo, stream)`.

**7. (Opcional) Triagem automática do tipo de arquivo**

- Arquivo: `T4.Financas.BLL/ArquivoBLL.cs`
- Se a triagem deve reconhecer o arquivo automaticamente, implementar método `IsAdquirenteXxx(...)` (por exemplo analisando header CSV ou primeira planilha XLSX) e, no fluxo de identificação do tipo, retornar:
  - `TipoDeArquivo.ConfirmacaoDaOperadoraDeCartao`
  - `TipoDeArquivoComplementar` = novo valor.

**8. (Opcional) Catálogo de integrações**

- Entidade: `VersaoIntegracao` (Domain e validação em `Model/Controllers/IntegracoesModels/Validators/VersaoIntegracao.cs`).
- Para integrações do tipo Adquirente, usar `Tipo = IntegracoesEnums.TipoIntegracaoEnum.Adquirente` e `TipoComplementar` = novo enum. Campos como `TemAntecipacao` e `TemPix` só são permitidos quando `Tipo == Adquirente`.

---

## Caminho B: Leitor específico no repositório

Usado quando não há strategy no F360.Reader.Integracoes e a leitura é feita por um reader próprio no projeto (ex.: API Justa, BankPay, PayGo).

### Checklist

```
- [ ] 1. Domain: TipoDeArquivoComplementar (e OperadoraDeCartao se nova)
- [ ] 2. FileImporter: criar reader que retorna ImporterModel<Cartao.CartaoModel> ou (Values, Notas)
- [ ] 3. BLL: ConciliacaoBLL – else if (arquivo.TipoComplementar == ...) chamando o reader
- [ ] 4. (Opcional) Triagem em ArquivoBLL
- [ ] 5. (Opcional) ServiceReader/API: se dados vêm de API, gerar “arquivo” com TipoComplementar correto
```

### Pontos de código

- **ConciliacaoBLL**: no método que processa arquivo de confirmação de operadora, adicionar `else if (arquivo.TipoComplementar == Arquivo.TipoDeArquivoComplementar.NovoTipo)` e invocar o reader específico (ex.: `new ReaderApiPayGo().ImportarArquivo(stream)`), preenchendo `confirmacoes` e `notas`.
- **Readers de referência**: `ApiJustaReader`, `BankPayApiReader`, `ReaderApiPayGo`, `OperadoraFinlyReader` (cada um com seu `TipoDeArquivoComplementar`).
- **ServiceReader (API)**: em `T4.Financas.BLL/ServiceReader/Operadoras/`, ao gerar arquivo a partir de API, usar o `tipoComplementar` correspondente (ex.: `ApiAdquirenteJustaVendas`, `ApiAdquirenteBankPayVendas`).

---

## Resumo de arquivos principais

| O quê | Onde |
|-------|------|
| Enum tipo de arquivo | `T4.Financas.Domain/Extension/Arquivo.cs` → `TipoDeArquivoComplementar` |
| Enum operadora | `T4.Financas.Domain/OperadoraDeCartao.cs` |
| Factory operadora (Integrações) | `T4.Financas.FileImporter.RedeCarbonnel/.../FactoryIntegracoesReaderOperadora.cs` |
| Parâmetros (estabelecimento) | `.../Factory/Parameters/FactoryReaderParametersOperadora.cs` |
| Roteamento para Integrações | `T4.Financas.BLL/GlobalBLL.cs` → `tiposPermitidosLeitorPadrao` |
| Processamento de arquivo | `T4.Financas.BLL/ConciliacaoBLL.cs` (fluxo de confirmação de operadora) |
| Triagem de tipo | `T4.Financas.BLL/ArquivoBLL.cs` (métodos `IsAdquirente*`) |
| Parser comum (Integrações) | `.../Readers/Common/OperadoraDeCartaoDefaultReaderParser.cs` |

## Convenções

- **Terminologia**: usar "adquirente" e "operadora" conforme o domínio (ver skill `f360-domain-financeiro`). "Leitura de adquirente" = processar arquivo ou retorno de API da operadora.
- **Pacote**: estratégias do caminho A ficam no pacote `F360.Reader.Integracoes` (referência no projeto: `T4.Financas.FileImporter.RedeCarbonnel`, versão atual 1.0.24). Novas strategies são adicionadas nesse pacote e depois referenciadas na factory.
- **AdditionalInformations**: quando `tiposPermitidosLeitorPadrao[tipo] == true`, o usuário deve importar pela tela de Cartões informando a empresa; `arquivo.AdditionalInformations.CustomerDetail` será o ID da empresa para obter código de estabelecimento.

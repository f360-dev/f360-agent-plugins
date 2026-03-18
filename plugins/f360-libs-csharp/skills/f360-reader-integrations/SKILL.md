---
name: f360-reader-integrations
description: Adds or modifies PDV readers and Adquirente (Operadora de Cartão) readers in F360.Reader.Integracoes. Use when adding a new PDV, new Operadora/Adquirente, implementing Strategy/Reader/Parser, mapping to PDVReaderModel or OperadoraCartaoReaderModel, or when the user refers to Reader.Integracoes, CONTRIBUTING, PDV reader, or Adquirente reader.
---

# F360 Reader Integrations – PDV e Adquirente

Guia para adicionar ou alterar **leitores de PDV** e **leitores de Adquirente (Operadora de Cartão)** no projeto F360.Reader.Integracoes, usando Strategy Pattern, modelos de domínio e Notas.

## When to Use

- Adicionar um novo **PDV** (Ponto de Venda) ou uma nova **Operadora/Adquirente**
- Implementar ou alterar Reader, Parser ou Strategy
- Mapear arquivos (JSON, posicional, XML) para `PDVReaderModel` ou `OperadoraCartaoReaderModel`
- Tratar erros, validações e Notas (`GerenciadorDeNotas`, `F360ParserException`)
- Escrever ou ajustar testes para Readers no Reader.Integracoes

## Arquitetura (resumo)

```
Arquivo → Strategy → Reader (AbstractReaderPDV / AbstractReaderCartao)
                         → Parser → PDVReaderModel ou OperadoraCartaoReaderModel
                         → Notas (Info, Aviso, Erro)
```

- **PDV**: `AbstractReaderPDV` → `BasePdvReaderStrategy<TReader>` → `List<PDVReaderModel>`
- **Operadora**: `AbstractReaderCartao` → `BaseOperadoraReaderStrategy<TReader>` → `List<OperadoraCartaoReaderModel>`

## Estrutura de pastas obrigatória

### Novo PDV (`src/Strategies/Pdvs/[NomePdv]/`)

```
[NomePdv]/
├── Models/
│   └── [NomePdv]Models.cs
├── Parsers/
│   └── VendaParser.cs
├── Readers/
│   └── [NomePdv]Reader.cs
├── Utils/
│   └── [NomePdv]Utils.cs   (opcional)
└── [NomePdv]Strategy.cs
```

### Nova Operadora/Adquirente (`src/Strategies/Operadoras/[NomeOperadora]/`)

```
[NomeOperadora]/
├── Models/
│   └── [NomeOperadora]Models.cs
├── Parsers/
│   └── VendaParser.cs
├── Readers/
│   └── [NomeOperadora]Reader.cs
├── Helpers/
│   └── [NomeOperadora]Helper.cs   (opcional)
└── [NomeOperadora]Strategy.cs
```

## Passos para novo PDV

1. **Criar pastas** em `src/Strategies/Pdvs/[NomePdv]/` conforme acima.
2. **Models**: Classes que espelham o arquivo de entrada (ex.: `ArquivoMeuPdv`, `VendaMeuPdv`, `PagamentoMeuPdv`). Sem validação de negócio; apenas estrutura.
3. **VendaParser**: Transformar venda + pagamento em `PDVReaderModel`. Validar com `ArgumentNullException`/`F360ParserException`; não capturar genérico e relançar.
4. **Reader**: Herdar `AbstractReaderPDV`; implementar `ProcessarArquivo()`; definir `NomePDV`; usar `TransformadorDeStream.ProcessarModeloJson<T>` (ou posicional/XML conforme o caso); para cada venda/pagamento chamar o Parser e adicionar em lista; em erro de parsing usar `GerenciadorDeNotas.CriarNota(ex.Message)` e **continuar** com próximo item.
5. **Strategy**: Classe vazia herdando `BasePdvReaderStrategy<SeuReader>`.
6. **Testes**: Caminho feliz, arquivo vazio, venda sem pagamento, valor inválido; incluir testes de cultura (pt-BR/en-US) se houver datas/números formatados.
7. **DI**: Registrar `IReaderStrategy<PDVReaderModel>` com a nova Strategy no projeto consumidor.

### PDV – Contrato do Reader

- Retorno: `(List<PDVReaderModel> vendas, List<Nota> notas)` via `ProcessarArquivo()`.
- Preencher sempre: **ValorTotal**, **CodigoDoEstabelecimentoPDV** (se necessário para Fechamento de caixa), **TotalDeParcelas**, **Parcelas**.
- Parcelas: usar `pdvModel.GerarParcelamento(dataVencimento)` ou lógica equivalente (ex.: crédito +30d, débito +1d).

### PDV – Notas e erros

- Usar `Nota` (Error, Info, Exception); preferir texto descritivo e número de linha quando existir.
- Erros de parsing: `F360ParserException`; no Reader capturar por tipo e registrar em Nota, sem relançar.

## Passos para nova Operadora/Adquirente

1. **Criar pastas** em `src/Strategies/Operadoras/[NomeOperadora]/` conforme acima.
2. **Models**: Representar cabeçalho, transações e rodapé do arquivo (ex.: formato posicional ou JSON).
3. **VendaParser**: Agrupar transações conforme regra da operadora; criar `OperadoraCartaoReaderModel` (ValorBruto, ValorLiquido, Taxa, Bandeira, NumeroCartao mascarado, etc.); validar e lançar `F360ParserException` quando aplicável.
4. **Reader**: Herdar `AbstractReaderCartao`; definir `NomeOperadoraDeCartao`; implementar `ProcessarArquivo()`; desserializar (JSON/posicional); agrupar transações; chamar Parser por grupo; manter continuidade em erro (Nota + próximo grupo).
5. **Strategy**: Classe vazia herdando `BaseOperadoraReaderStrategy<SeuReader>`.
6. **Testes**: Arquivo válido, sem transações, agrupamento e validações.
7. **DI**: Registrar `IReaderStrategy<OperadoraCartaoReaderModel>` com a nova Strategy.

### Operadora – Contrato

- Retorno: `(List<OperadoraCartaoReaderModel> cartoes, List<Nota> notas)`.
- Mascarar cartão (ex.: primeiros 4 + `****` + últimos 4) no Parser ou Helper.

## Regras de código (resumo)

- **Strategy**: Sem lógica adicional; só herdar da base.
- **Parser**: Validação e mapeamento; usar `F360ParserException` para erros de negócio.
- **Reader**: Desserialização + orquestração + Notas; continuar processando após falha em um registro.
- **Naming**: PascalCase; prefixo do PDV/Operadora nas classes (ex.: `SaiposReader`, `CredishopReader`).
- **Namespaces**: `F360.Reader.Integracoes.Strategies.Pdvs.[NomePdv].*` ou `...Operadoras.[NomeOperadora].*`.
- **Formatos**: JSON → `TransformadorDeStream.ProcessarModeloJson<T>`; posicional → `ProcessarArquivoPosicionalMultiRegistro<T>` ou leitura manual por linha.

## Checklist antes do PR

- [ ] Pastas e nomes conforme padrão (PDV ou Operadora).
- [ ] Strategy herda `BasePdvReaderStrategy<T>` ou `BaseOperadoraReaderStrategy<T>`; Reader herda `AbstractReaderPDV` ou `AbstractReaderCartao`.
- [ ] Modelos fiéis ao arquivo; validações apenas no Parser.
- [ ] Uso de `F360ParserException` e `GerenciadorDeNotas`; sem `catch (Exception)` genérico relançando.
- [ ] Testes unitários (caminho feliz + erros/avisos) e, para PDV, consistência (ValorTotal, parcelas, datas).
- [ ] Exemplos de arquivo de teste em `test/Mock/` se fizer sentido.

## Referências no repositório

- **Guia completo**: `F360.Reader.Integracoes/CONTRIBUTING.md` (arquitetura, passo a passo PDV e Operadora, exemplos de uso, erros e notas).
- **Exemplos práticos**: `F360.Reader.Integracoes/EXEMPLO_PRATICO.md` (MeuSistemaPOS e NovaOperadora com código completo e testes).
- **Padrões e boas práticas**: `F360.Reader.Integracoes/PADROES_E_BOAS_PRATICAS.md` (naming, camadas, tratamento de erros, testes, checklist de code review).
- **Visão geral e quick start**: `F360.Reader.Integracoes/README.md`.

Sempre que precisar de detalhes de implementação, validação ou exemplos de código, leia os arquivos acima no projeto F360.Reader.Integracoes.

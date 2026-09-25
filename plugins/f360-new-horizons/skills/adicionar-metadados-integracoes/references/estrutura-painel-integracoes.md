# Integrações - estrutura do painel e dos Use Cases

Última atualização: 2026-08-27

Escopo: estrutura de back-end que atende o painel de integrações do Finanças.

O módulo `F360.Integracoes.UseCases/Integracoes` fornece ao front a lista de APIs, a definição dos formulários e os dados usados na edição. A interface visual e o envio do formulário ficam no front.

## Visão geral

```text
Front do painel
    |
    v
IntegracoesController
    |
    v
F360.Integracoes.UseCases/Integracoes
    |
    +-- lista as APIs
    +-- obtém o formulário
    +-- prepara campos contextuais
    +-- combina definição e valores na edição
    |
    v
Mongo: DefinicaoCampoWebservice e Webservice
```

## Onde está cada parte

| Local | Papel |
|---|---|
| `F360.Integracoes.UseCases/Integracoes` | Casos de uso do painel. |
| `IntegracoesController.cs` | Endpoints HTTP. |
| `IntegracoesUseCase.cs` | Registros de injeção de dependência. |
| `WebserviceEntity` | Modelos de definição e campos. |
| `DefinicaoCampoWebserviceRepository.cs` | Consulta das definições no Mongo. |
| `WebserviceCampoDetalhe/*.json` | Definições versionadas das integrações. |

Estrutura principal:

```text
Integracoes
|-- RetornarTodasApi
|-- ExibirCamposWebservice
|   |-- PrepararCamposWebservice
|-- Webservice
```

## Collections

| Collection | Função |
|---|---|
| `DefinicaoCampoWebservice` | Define o formulário: campos, tipos, regras, ações e caminhos do payload. |
| `Webservice` | Guarda a integração configurada pelo usuário no formato usado pelas regras de negócio e pelo legado. |

Em resumo, `DefinicaoCampoWebservice` é o molde do formulário e `Webservice` contém os dados preenchidos.

## Endpoints

A rota base é `/financas/Integracoes/v1`.

| Método e rota | Caso de uso | Função |
|---|---|---|
| `GET /apis` | `ObterTodasApiUseCase` | Lista as integrações disponíveis para o cliente. |
| `GET /definicao-campo-webservice` | `ObterCamposFormularioIntegracaoUseCase` | Obtém o formulário de cadastro. |
| `GET /webservice/{id}` | `ObterWebservicePorIdUseCase` | Obtém os dados para edição. |

## Lista de integrações

`ObterTodasApiUseCase` lê `APIEnum`, remove APIs que não devem aparecer e aplica filtros conforme o cliente e suas marcas.

## Cadastro

O cadastro possui duas etapas.

### 1. Exibir o formulário

O front consulta a definição por API e, opcionalmente, por empresa:

```text
API e empresa opcional
    |
    v
ObterCamposFormularioIntegracaoUseCase
    |
    +-- consulta DefinicaoCampoWebservice
    +-- prepara os campos
    +-- ordena por OrdemDeExibicao
    |
    v
Formulário enviado ao front
```

O endpoint `GET /definicao-campo-webservice` apenas devolve os campos e as regras. Ele não cadastra a integração.

### 2. Salvar a integração

O front monta o payload usando `NomeObjetoNoLegado` e escolhe o fluxo conforme `SubmitAction`:

- se `SubmitAction.type` é `none`, não há botão Salvar;
- se `SubmitAction.endpoint` existe, a ação declarativa é executada;
- se `SubmitAction.result` existe sem endpoint, o save genérico roda e o resultado especial é aplicado;
- se `SubmitAction` está ausente, o save genérico legado é usado.

O front envia os dados ao legado, que aplica o fluxo de cadastro e grava a nova integração na collection `Webservice`.

Em resumo: o New Horizons fornece o formulário; o legado cadastra a integração.

## Edição

`ObterWebservicePorIdUseCase` combina a definição com o documento persistido:

```text
ID do webservice
    |
    +-- obtém o documento em Webservice
    +-- identifica a API
    +-- obtém DefinicaoCampoWebservice
    +-- prepara e mapeia os campos
    |
    v
Formulário preenchido para edição
```

Regras principais:

- `NomeObjetoNoLegado` localiza o valor persistido;
- `VisivelNaEdicao` substitui a visibilidade base;
- `ValueTransform: JoinCsv` converte arrays em CSV;
- campos sensíveis podem retornar `HasPersistedValue` sem expor o valor real;
- o front reenvia os dados conforme o contrato e as regras de payload recebidas;
- `EditAction` descreve uma ação especial de edição quando necessária.

## Persistência dos valores salvos e ligação com o legado

O mesmo dado possui formatos diferentes na API New Horizons, no front New Horizons e no legado T4.Finanças.

### 1. Payload da API New Horizons

No cadastro, a API devolve a definição do campo. Ainda não existe um valor digitado:

```json
{
  "campoId": "delivery-direto-client-id",
  "nomeObjetoNoLegado": "DeliveryDireto.ClientId"
}
```

Na edição, a API lê o documento da collection `Webservice` e acrescenta o valor persistido em `value`:

```json
{
  "campoId": "delivery-direto-client-id",
  "nomeObjetoNoLegado": "DeliveryDireto.ClientId",
  "value": ["123"],
  "hasPersistedValue": true
}
```

`value` pertence à resposta de edição da API. Em campos sensíveis, ele pode vir vazio ou sem o valor real, enquanto `hasPersistedValue` informa que já existe um dado salvo.

### 2. Estado do formulário no front New Horizons

O front converte `campoId` em `nomeCampo` e o utiliza como chave do controle. Depois que o usuário digita `123`, o estado interno do formulário fica assim:

```ts
values = {
  "delivery-direto-client-id": "123"
}
```

Esse `values` é um objeto interno do formulário, não é o payload recebido da API nem o payload enviado ao legado. Na edição, o front pega o conteúdo de `value` recebido da API e o associa novamente ao controle identificado por `campoId`.

### 3. Payload enviado ao legado T4.Finanças

No submit, o front lê `values["delivery-direto-client-id"]` e usa `nomeObjetoNoLegado` para montar o formato esperado pelo legado:

```json
{
  "DeliveryDireto": {
    "ClientId": "123"
  }
}
```

Nesse payload, `ClientId` é a propriedade que recebe `123`. `DeliveryDireto` é o objeto que a contém, e o ponto em `DeliveryDireto.ClientId` separa os níveis.

A ligação completa funciona assim:

1. A API New Horizons fornece a definição do campo e, na edição, o valor persistido em `value`.
2. O front New Horizons exibe o controle e mantém o valor em `values`, usando `campoId` como chave.
3. O front usa `nomeObjetoNoLegado` para converter esse estado no payload esperado pelo T4.Finanças.
4. O legado executa suas regras de cadastro ou edição e persiste o documento na collection `Webservice`.

Na edição, a API New Horizons lê o caminho `DeliveryDireto.ClientId` da collection e devolve o resultado em `value`, reiniciando o fluxo.

Em resumo: `campoId` identifica o controle no front; `value` transporta o dado persistido da API para o front; `nomeObjetoNoLegado` define o caminho usado no payload do T4.Finanças; e `SubmitAction` ou `EditAction` definem como a ação deve ser executada.

## PrepararCamposWebservice

`PrepararCamposWebservice` ajusta a definição quando a metadata sozinha não possui uma informação necessária.

Sem preparação, o back apenas lê e devolve os campos. Com preparação, ele consulta o contexto e altera a resposta em memória.

Exemplo da NFe:

- recebe a empresa selecionada;
- verifica se ela possui certificado;
- ajusta a exibição e o valor padrão do campo de certificado;
- devolve o formulário já preparado.

Todo preparador implementa `IPrepararCamposWebservice` e declara suas `ApisSuportadas`. `PrepararDefinicaoCampoWebserviceService` seleciona e executa apenas os preparadores compatíveis.

```csharp
var preparadoresAplicaveis = _preparadores
    .Where(x => x.ApisSuportadas.Contains(definicao.Api));

foreach (var preparador in preparadoresAplicaveis)
    await preparador.PrepararAsync(
        user,
        definicao,
        empresaId,
        webservice,
        cancellationToken);
```

O serviço central não deve possuir `if` ou `switch` por integração.

## Injeção de dependência

Cada preparação é registrada como `IPrepararCamposWebservice`. Assim, o serviço central recebe todas as implementações sem conhecer diretamente cada classe.

```csharp
services.AddScoped<IPrepararCamposWebservice, PrepararCamposNovaIntegracao>();
```

## Como adicionar uma integração

Quando a metadata é suficiente:

1. Criar ou atualizar o JSON em `WebserviceCampoDetalhe`.
2. Definir os campos, regras, ações e caminhos do payload.
3. Validar a migration com `--dry-run`.
4. Testar cadastro, edição e save.

Quando existe uma regra que depende do servidor:

1. Criar uma pasta `DefinicaoNomeDaIntegracao` em `PrepararCamposWebservice`.
2. Implementar `IPrepararCamposWebservice`.
3. Informar `ApisSuportadas`.
4. Registrar a classe na injeção de dependência.
5. Criar os testes da regra.

Não crie um preparador quando a regra já couber em `DisplayRules`, `RequiredRules`, `Action`, `SubmitAction` ou outro campo da metadata.

## Testes

Os testes ficam em `F360.Integracoes.UseCases.UnitTests/Webservice` e cobrem a seleção dos preparadores, a montagem da edição e as ações declarativas.

## Boas práticas

- Prefira metadata a código específico.
- Não crie condições por API no front ou no serviço central.
- Use `empresaId` somente quando a preparação depender da empresa.
- Use `webservice` somente quando depender do documento da edição.
- Não persista ajustes feitos durante a preparação.
- Preserve `CampoId` e `NomeObjetoNoLegado`.
- Não exponha valores sensíveis.
- Mantenha JSON, modelos C# e contrato do front coerentes.

## Checklist

1. Identificar se a mudança pertence à metadata, preparação, edição ou save.
2. Verificar se a metadata já suporta a regra.
3. Alterar somente o componente responsável.
4. Registrar novas preparações na injeção.
5. Atualizar os testes.
6. Executar o `--dry-run` quando alterar JSON.
7. Testar cadastro, edição e save no painel.

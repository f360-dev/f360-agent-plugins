---
name: f360-service-api-integracoes
description: Use when adding a new API integration to F360.Service.API.Integracoes, implementing a new Strategy, creating response models, writing tests with FakeApi/StrategyTestBase, or when the user refers to IntegracaoBase, IIntegracao, TipoIntegracao, ExecutarFluxo, Normalizar, Desserializar, or paginacao in this project.
---

# F360 Service API Integracoes

Adiciona ou modifica integracoes na lib `F360.Service.API.Integracoes` seguindo o padrao **Strategy + Template Method**.

## Quando Usar

- Criar uma nova integracao com API REST ou S3
- Implementar autenticacao (OAuth, Bearer, ApiKey)
- Adicionar paginacao a uma integracao existente
- Criar testes unitarios para uma strategy

## Arquitetura Rapida

```
IIntegracao
    └── IntegracaoBase<T>          ← Template Method (fluxo fixo)
            └── XyzStrategy.cs     ← Sobrescreve apenas o necessario
```

**Fluxo padrao de `Executar(request)`:**
1. `Autenticar` (se `RequerAutenticacao = true`) → salva em `_authToken`
2. `ExecutarFluxo` → chama `ObterEndpoint`, `ObterParametros`, `ObterCabecalhos`
3. `Desserializar` → response bruto para tipo `T`
4. `ApiRetornouMovimentos` → decide `200` vs `204`
5. `Normalizar` → `T` para JSON string em `IntegracaoResponse.Dados`

## Passo a Passo

### 1. Criar a pasta e a strategy

```
src/Strategies/<NomeDaIntegracao>/
    <NomeDaIntegracao>Strategy.cs
    Models/          (opcional — requests e modelos internos)
    Responses/       (opcional — DTOs de response da API)
```

**Strategy minima (sem autenticacao):**

```csharp
using F360.Rest.Integrations;
using F360.Service.API.Integracoes.Core;
using F360.Service.API.Integracoes.Models;
using Newtonsoft.Json;
using Polly;
using RestSharp;
using System.Collections.Generic;

namespace F360.Service.API.Integracoes.Strategies.MinhaApi
{
    public class MinhaApiStrategy : IntegracaoBase<List<MinhaApiResponse>>, IIntegracao
    {
        public MinhaApiStrategy(AbstractApi api, ISyncPolicy<IRestResponse> politicaRetry)
            : base(api, politicaRetry) { }

        protected override TipoIntegracao TipoIntegracao => new TipoIntegracao(999, "MinhaApi");

        protected override string ObterEndpoint(IntegracaoRequestDto req) => "/v1/vendas";

        protected override List<RequestParams> ObterParametros(IntegracaoRequestDto req) =>
            new List<RequestParams>
            {
                new RequestParams { Key = "data_inicio", Value = req.DataInicio.ToString("yyyy-MM-dd") },
                new RequestParams { Key = "data_fim",    Value = req.DataFim.ToString("yyyy-MM-dd") }
            };

        protected override List<RequestHeader> ObterCabecalhos(string token, IntegracaoRequestDto req) =>
            new List<RequestHeader>
            {
                new RequestHeader("Authorization", $"Bearer {token}"),
                new RequestHeader("Content-Type", "application/json")
            };

        protected override List<MinhaApiResponse> Desserializar(IRestResponse resposta) =>
            JsonConvert.DeserializeObject<List<MinhaApiResponse>>(resposta.Content);

        protected override bool ApiRetornouMovimentos(List<MinhaApiResponse> dados) =>
            dados != null && dados.Count > 0;

        protected override string Normalizar(List<MinhaApiResponse> dados) =>
            JsonConvert.SerializeObject(dados);
    }
}
```

### 2. Autenticacao (quando necessario)

Adicione na strategy quando a API exige token:

```csharp
protected override bool RequerAutenticacao => true;

// OAuth2 client_credentials (form-urlencoded)
protected override void Autenticar(IntegracaoRequestDto req)
{
    var parametros = new List<Parameter>
    {
        new Parameter("grant_type", "client_credentials", ParameterType.GetOrPost)
    };
    var resposta = ExecutarRequisicaoUrlFormEncoded(
        ObterEndpointAuth(),
        parametros,
        ObterCabecalhosAuth(req)
    );
    var token = JsonConvert.DeserializeObject<TokenResponse>(resposta.Content);
    _authToken = token?.AccessToken ?? throw new ApiException("Token nao retornado", 401);
}

protected override string ObterEndpointAuth() => "/oauth2/token";

protected override List<RequestHeader> ObterCabecalhosAuth(IntegracaoRequestDto req) =>
    new List<RequestHeader>
    {
        new RequestHeader("Authorization", $"Basic {req.Token}")
    };
```

> Para autenticacao simples (GET/POST JSON), use `ObterEndpointAuth` + `ObterParametrosAuth` + `DesserializarRespostaAuth` sem sobrescrever `Autenticar`.

### 3. Paginacao

```csharp
protected override List<MinhaApiResponse> ExecutarFluxo(IntegracaoRequestDto req)
{
    var cabecalhos = ObterCabecalhos(_authToken, req);

    var todos = ExecutarRequisicaoPaginada<MinhaApiResponse>(
        ObterEndpoint(req),
        pagina => new List<RequestParams>
        {
            new RequestParams { Key = "page",      Value = pagina.ToString() },
            new RequestParams { Key = "page_size", Value = "100" },
            new RequestParams { Key = "data_inicio", Value = req.DataInicio.ToString("yyyy-MM-dd") }
        },
        resposta => JsonConvert.DeserializeObject<List<MinhaApiResponse>>(resposta.Content),
        cabecalhos,
        tamanhoPagina: 100
    );

    return new List<MinhaApiResponse>(todos);
}
```

### 4. Integracoes S3

Use o segundo construtor quando a origem e um bucket S3:

```csharp
public MinhaS3Strategy(ISyncPolicy<IRestResponse> politicaRetry, IS3Factory factory = null)
    : base(politicaRetry, factory) { }
```

Use `StrategyS3TestBase` nos testes.

### 5. Testes unitarios

Crie `test/Strategies/<NomeDaIntegracao>/<NomeDaIntegracao>StrategyTests.cs`:

```csharp
public class MinhaApiStrategyTests : StrategyTestBase<MinhaApiStrategy, List<MinhaApiResponse>>
{
    protected override MinhaApiStrategy CriarStrategy(FakeApi api) =>
        new MinhaApiStrategy(api, RetryPolicy);

    [Fact]
    public void Executar_ComDadosValidos_DeveRetornar200()
    {
        var json = JsonConvert.SerializeObject(new List<MinhaApiResponse> { new MinhaApiResponse { Id = "1" } });
        var strategy = CriarStrategy(CriarFakeApi(json));

        var result = strategy.Executar(CriarRequestFake());

        Assert.True(result.Sucesso);
        Assert.Equal(200, result.StatusCode);
    }

    [Fact]
    public void Executar_SemDados_DeveRetornar204()
    {
        var strategy = CriarStrategy(CriarFakeApi("[]"));
        var result = strategy.Executar(CriarRequestFake());

        Assert.True(result.Sucesso);
        Assert.Equal(204, result.StatusCode);
    }

    [Theory]
    [InlineData(401)]
    [InlineData(403)]
    [InlineData(429)]
    public void Executar_ComErroHTTP_DeveRetornarErro(int statusCode)
    {
        var fakeApi = CriarFakeApi("Erro", (HttpStatusCode)statusCode);
        var strategy = CriarStrategy(fakeApi);

        var result = strategy.Executar(CriarRequestFake());

        Assert.False(result.Sucesso);
        Assert.Equal(statusCode, result.StatusCode);
    }
}
```

**FakeApi com multiplas respostas** (para integracoes com autenticacao):

```csharp
var fakeApi = new FakeApi("http://fake");
fakeApi.AddResponse(tokenJson);   // 1a chamada: autenticacao
fakeApi.AddResponse(vendasJson);  // 2a chamada: dados
```

## Regras Essenciais

| Regra | Detalhe |
|-------|---------|
| `TipoIntegracao.Codigo` | Deve ser **unico** em todo o projeto |
| Modelos | Ficam em `src/Strategies/<Nome>/Models` ou `Responses` — nunca em `src/Models` global |
| Excecoes | Nao capture para retornar `Sucesso = true`. Deixe propagar para `IntegracaoBase` |
| Dados sensiveis | Nunca logue `Token`, `Senha`, `ApiKey`, `SecretKey` |
| Testes minimos | sucesso (200), sem dados (204), erro conhecido (401/403/404/429) |

## Checklist Rapido

- [ ] Pasta `src/Strategies/<NomeDaIntegracao>` criada
- [ ] `TipoIntegracao` com `Codigo` unico definido
- [ ] `Normalizar` retorna JSON consistente
- [ ] Modelos em `Models/` ou `Responses/` da propria strategy
- [ ] Testes em `test/Strategies/<NomeDaIntegracao>`
- [ ] Cenarios: 200, 204 e pelo menos um erro (401/403/404/429)

## Referencias

- `src/Core/IntegracaoBase.cs` — base com todos os hooks virtuais
- `src/Core/IIntegracao.cs` — contrato publico
- `test/StrategyTestBase.cs` e `test/FakeApi.cs` — utilitarios de teste
- `CONTRIBUTING.md` — passo a passo detalhado com exemplos adicionais
- `PADROES_E_BOAS_PRATICAS.md` — checklist de qualidade

# Integrações — referência dos campos dos DTOs

Última atualização da fonte: 2026-07-27

Escopo: contrato de definição de campos usado pelo cadastro dinâmico de integrações do Finanças.

Esta documentação descreve o contrato persistido em Mongo e versionado nas migrations JSON de WebserviceCampoDetalhe. O f360-new-horizons é a fonte da verdade da definição; o front em f360-financas apenas consome, normaliza, renderiza, valida e monta payloads a partir desses metadados.

## Sumário

- Onde está o contrato
- DefinicaoCampoWebservice
- CampoDetalheModel
- Tipos e validações suportadas no front
- Blocos declarativos
- Cadastro e edição
- Boas práticas
- Erros comuns
- Checklist rápido

## Onde está o contrato

| Item | Papel |
|---|---|
| DefinicaoCampoWebservice | Entidade raiz da definição de uma integração. |
| CampoDetalheModel | Contrato persistido de cada campo do formulário. |
| WebserviceCampoDetalhe/*.json | Versões declarativas das definições que alimentam a collection. |
| ObterCamposFormularioIntegracaoViewModel | Resposta do cadastro por API. |
| ObterWebservicePorIdViewModel | Resposta de edição, com valores persistidos. |
| CadastroDeIntegracaoGateway.ts | Tipagem TypeScript do contrato consumido pelo Vue. |

Nomes dos JSONs usam PascalCase por seguirem o domínio C#/Mongo. A resposta HTTP serializada para o front chega em camelCase para os campos comuns; os blocos declarativos internos preservam o formato definido na metadata.

## DefinicaoCampoWebservice

| Campo | Tipo | Uso |
|---|---|---|
| API / Api | APIEnum | Identificador numérico da integração. Nos JSONs aparece como API. |
| Nome | string? | Nome técnico ou amigável da definição. |
| Descricao | string? | Descrição da integração. |
| Ativo | bool | Define se a definição está disponível para consulta. |
| Campos | List<CampoDetalheModel> | Lista ordenável dos campos do formulário. |
| SubmitAction | object? | Ação declarativa do botão Salvar. Quando ausente, o Vue usa o save genérico legado. |
| EditAction | FormularioEditActionModel? | Ação declarativa de edição. Quando ausente, o Vue usa /WebserviceAPI/Edit/. |

Exemplo mínimo:

    {
      "API": 165,
      "Nome": "AdquirenteDeliveryDireto",
      "Descricao": "Integração Delivery Direto",
      "Ativo": true,
      "Campos": []
    }

## CampoDetalheModel

| Campo | Tipo | Uso |
|---|---|---|
| CampoId | string? | Identificador estável do campo. É a chave do estado do formulário e deve ser único dentro da definição. |
| Label | string? | Texto exibido junto ao controle. |
| Tipo | string? | Nome do renderer que o front deve usar. |
| Obrigatorio | bool | Obrigatoriedade base do campo. |
| Criptografado | bool | Indica valor sensível. O front não deve expor valor persistido sensível quando a API retorna apenas HasPersistedValue. |
| Mascara | string? | Máscara nomeada aplicada pelo renderer. |
| Descricao | string? | Texto descritivo complementar, quando o renderer usar. |
| Grupo | string? | Agrupamento visual no formulário. |
| NomeObjetoNoLegado | string? | Caminho usado para montar o payload legado com lodash.set. |
| ValueTransform | string? | Transformação aplicada pelo back ao devolver valor persistido na edição. Hoje há uso de JoinCsv. |
| PayloadTransform | string? | Transformação aplicada pelo front ao montar payload legado. Usa os transforms de payload suportados. |
| IncludeInPayload | bool | Quando false, o campo não entra no payload legado. Default: true. |
| Opcoes | List<Opcao>? | Opções estáticas de selects, radios e grupos. |
| Validacao | Validacao? | Validação legada/compatibilidade. Para validadores novos, preferir regras explícitas aceitas pelo front. |
| LimiteCaracteres | int? | Tamanho máximo. Com MinLength igual, expressa tamanho exato. |
| FieldSize | string? | Largura do campo no grid do front: Small, Medium ou Large. |
| Placeholder | string? | Texto auxiliar dentro do controle. |
| Hint | List<string>? | Textos informativos abaixo do campo. Usar array JSON real. |
| DisplayRules | object? | Regra declarativa de visibilidade. |
| MinLength | int? | Tamanho mínimo. |
| RequiredRules | object? | Obrigatoriedade condicional, independente da visibilidade. |
| OrdemDeExibicao | int | Ordem do campo dentro do formulário. |
| ValorPadrao | object? | Valor inicial quando não há valor persistido. |
| Visivel | bool | Visibilidade base no cadastro. Default: true. |
| VisivelNaEdicao | bool? | Override de visibilidade para fluxo de edição. |
| Desabilitado | bool | Exibe o valor sem permitir edição. |
| Endpoint | string? | Fonte remota de opções ou endpoint associado a uma action. |
| EndpointParameters | object? | Query parameters declarativos para endpoints remotos. |
| Action | object? | Ação declarativa de campo, normalmente em botão ou remote collection. |
| RemoteCollection | object? | Configuração de tabela remota com seleção. |
| RefetchDefinitionParameter | string? | Query parameter usado para rebuscar a definição quando o campo muda. |

Aliases antigos existem apenas para compatibilidade interna e não devem ser usados em novas migrations:

| Nome atual | Alias antigo |
|---|---|
| CampoId | NomeCampo |
| LimiteCaracteres | Tamanho |
| Visivel | TipoVisualizacao |

Exemplo de campo simples:

    {
      "CampoId": "delivery-direto-client-id",
      "Label": "Client Id:",
      "Tipo": "Texto",
      "Obrigatorio": true,
      "Criptografado": true,
      "Grupo": "Delivery Direto",
      "NomeObjetoNoLegado": "DeliveryDireto.ClientId",
      "FieldSize": "Medium",
      "Hint": [],
      "OrdemDeExibicao": 2,
      "Visivel": true
    }

## Tipos e validações suportadas no front

Tipos de campo conhecidos pelo cadastro dinâmico:

| Tipo | Uso esperado |
|---|---|
| Texto | Input de texto. |
| Numero | Input numérico. |
| Data | Campo de data. |
| Checkbox | Valor booleano. |
| Select | Seleção única, estática ou remota. |
| SelectMultiple | Seleção múltipla. |
| Botao | Executa Action ou abre URL. |
| Upload | Arquivo. |
| Divisor | Separador visual. |
| Banner | Aviso informativo. |
| Senha | Input protegido. |
| InputTagNumber | Lista de números. |
| InputTagText | Lista de textos. |
| TextArea | Texto em múltiplas linhas. |
| Radio | Grupo de radio buttons. |
| RemoteCollection | Consulta remota com seleção em tabela. |
| InfoText | Texto informativo. |
| CheckboxGroup | Grupo categorizado de checkboxes. |

Máscaras nomeadas: cnpj, cpf, cep, telefone, percentage.

Validações nomeadas aceitas no front: cnpj, cpf, email, url, httpsUrl, telefone e digits.

## Blocos declarativos

### DisplayRules e RequiredRules

DisplayRules controla visibilidade. RequiredRules controla obrigatoriedade. Os dois usam o mesmo shape.

    {
      "DependsOnFieldId": "f360-public-api-acesso-total",
      "Operator": "Equals",
      "Values": ["false"],
      "VisibleWhenMatched": true,
      "Source": "FieldValue",
      "Attribute": null,
      "Aggregation": "Any"
    }

| Campo | Uso |
|---|---|
| DependsOnFieldId | Campo observado. |
| Operator | Operador da comparação. Hoje o front usa Equals e NotEquals. |
| Values | Valores esperados. |
| VisibleWhenMatched | Define se a regra mostra quando bate ou quando não bate. |
| Source | FieldValue ou SelectedOptionAttribute. |
| Attribute | Nome do atributo da opção selecionada quando a fonte é SelectedOptionAttribute. |
| Aggregation | Any ou All para seleção múltipla. |

Um campo oculto não deve bloquear submit por obrigatoriedade base. Usar RequiredRules quando a obrigatoriedade depender de uma condição diferente da visibilidade.

### EndpointParameters

Monta query parameters para Endpoint, geralmente em selects remotos.

    {
      "empresaId": {
        "CampoId": "n-fe-empresa"
      },
      "tipo": {
        "Valor": "ativo"
      }
    }

CampoId lê o valor atual de outro campo. Valor envia uma constante. Enquanto uma dependência não tiver valor, o front não deve chamar o endpoint.

### Action e SubmitAction

Action pode ser usada por campos. SubmitAction usa o mesmo contrato para o botão Salvar. Quando SubmitAction está ausente, o front monta payload legado e envia para /WebserviceAPI/Save/.

| Campo | Uso |
|---|---|
| type | http, oauthRedirect, conditional, blocked ou none no submit. |
| method | Método HTTP. Default prático: POST. |
| host | Cliente HTTP escolhido pelo front, por exemplo financas. |
| endpoint | Rota chamada. |
| payload | Árvore de referências por CampoId, constantes por Valor e transforms. |
| enableWhen | Lista de campos que precisam estar preenchidos para habilitar a ação. |
| confirm | Configuração de confirmação antes da ação. |
| openUrl | Template de URL externa e parâmetros. |
| postAction | Ação após execução, como logout ou closeDrawer. |
| payloadStrategy | Estratégia pronta: legacy ou legacyMultipart. |
| resultStrategy | Estratégia de interpretação de resposta, por exemplo legacyOperation. |
| result | Mensagem, atualização de campos ou diálogo de segredo. |

Transforms aceitos em payload declarativo e PayloadTransform:

| Transform | Resultado |
|---|---|
| First | Usa o primeiro item quando o valor é array. |
| WrapArray | Garante que o valor seja array. |
| SplitCsv | Converte string CSV em array de strings. |
| SplitCsvNumber | Converte string CSV em array de números. |

Exemplo de submit multipart:

    {
      "SubmitAction": {
        "type": "http",
        "method": "POST",
        "endpoint": "/WebserviceAPI/SaveNFeService",
        "payloadStrategy": "legacyMultipart",
        "resultStrategy": "legacyOperation"
      }
    }

Exemplo de OAuth:

    {
      "Action": {
        "type": "oauthRedirect",
        "enableWhen": ["api-tag-plus-empresa"],
        "openUrl": {
          "template": "https://example.com/oauth?state={empresa}",
          "parameters": {
            "empresa": { "CampoId": "api-tag-plus-empresa" }
          },
          "target": "_blank",
          "features": "noopener"
        },
        "postAction": {
          "type": "logout"
        }
      }
    }

### EditAction

EditAction é tipado no C# como FormularioEditActionModel.

| Campo | Uso |
|---|---|
| type | http, conditional ou blocked. |
| method | Método HTTP. |
| host | Cliente HTTP opcional. |
| endpoint | Rota chamada. |
| payloadStrategy | legacy ou legacyMultipart. |
| resultStrategy | Estratégia de resposta. |
| message | Mensagem para tipo bloqueado ou retorno. |
| when | Condição para conditional. |
| then | Ação executada quando a condição bate. |
| else | Ação executada quando a condição não bate. |

Exemplo condicional:

    {
      "EditAction": {
        "type": "conditional",
        "when": {
          "fieldId": "n-fe-informar-certificado-digital",
          "operator": "Equals",
          "values": [true]
        },
        "then": {
          "type": "http",
          "method": "POST",
          "endpoint": "/WebserviceAPI/SaveNFeService",
          "payloadStrategy": "legacyMultipart",
          "resultStrategy": "legacyOperation"
        },
        "else": {
          "type": "http",
          "method": "POST",
          "endpoint": "/WebserviceAPI/Edit/",
          "payloadStrategy": "legacy",
          "resultStrategy": "legacyOperation"
        }
      }
    }

### RemoteCollection

Usada quando um campo executa uma consulta remota e o usuário precisa selecionar linhas de uma tabela.

    {
      "Tipo": "RemoteCollection",
      "Endpoint": "/WebserviceAPI/ObterLojasGestaoClick",
      "Action": {
        "type": "http",
        "method": "POST",
        "enableWhen": ["gestao-click-access-key", "gestao-click-secret-key"],
        "payload": {
          "accessKey": { "CampoId": "gestao-click-access-key" },
          "secretKey": { "CampoId": "gestao-click-secret-key" }
        }
      },
      "RemoteCollection": {
        "TriggerLabel": "Validar Credenciais e Obter Lojas",
        "IdKey": "Id",
        "LabelKey": "Name",
        "CheckedKey": "Checked",
        "PreserveSelectionBy": "Id",
        "Columns": [
          { "Key": "Name", "Header": "Loja" }
        ],
        "EmptyStateHint": "Nenhuma loja encontrada para essas credenciais."
      }
    }

| Campo | Uso |
|---|---|
| TriggerLabel | Texto do botão que dispara a consulta. |
| IdKey | Chave identificadora da linha. |
| LabelKey | Texto principal da linha. |
| CheckedKey | Chave booleana de seleção. |
| PreserveSelectionBy | Chave usada para manter seleção em novas consultas. |
| Columns | Colunas exibidas na tabela. |
| EmptyStateHint | Mensagem para retorno vazio. |
| InfoHint | Lista de orientações exibidas no componente. |

## Cadastro e edição

No cadastro, o front consulta a definição por API e empresa opcional. No submit:

- se SubmitAction.type é none, não há botão Salvar;
- se SubmitAction.endpoint existe, a ação declarativa é executada;
- se SubmitAction.result existe sem endpoint, o save genérico roda e o resultado especial é aplicado;
- se SubmitAction está ausente, o save genérico legado é usado.

Na edição, o endpoint de webservice por id combina definição e documento persistido. Campos sensíveis podem retornar HasPersistedValue sem valor real. O front envia novamente apenas conforme o contrato recebido e as regras de payload.

## Boas práticas

- Usar CampoId estável, único e sem depender do label.
- Preencher NomeObjetoNoLegado com o caminho exato esperado pelo legado quando usar save genérico.
- Não colocar regra por integração no Vue; modelar como metadata ou resolver no back-end.
- Usar SubmitAction ou EditAction somente quando o fallback legado não representar o fluxo.
- Usar Action para OAuth, validação remota, busca auxiliar e passos que dependem de servidor.
- Usar RefetchDefinitionParameter quando a definição depender de empresa ou de outro campo que o back-end precise conhecer.
- Marcar campos sensíveis com Criptografado: true e não expor segredo persistido em texto puro.
- Manter Hint como array JSON real, não string com aparência de array.
- Preferir reutilizar Tipo, máscaras, transforms e blocos declarativos existentes antes de criar capacidade nova.

## Erros comuns

- Criar if ou switch por API no front para compensar metadata incompleta.
- Usar alias antigo (NomeCampo, Tamanho, TipoVisualizacao) em migration nova.
- Omitir NomeObjetoNoLegado em campo que precisa entrar no payload legado.
- Marcar campo como Obrigatorio sem considerar DisplayRules e RequiredRules.
- Usar IncludeInPayload: false em campo que o legado precisa receber.
- Devolver valor sensível descriptografado no fluxo de edição.
- Alterar DTO C# sem atualizar o tipo TypeScript e os testes do consumidor.

## Checklist rápido ao alterar uma definição

- Conferir o comportamento no legado ou endpoint novo que persiste.
- Atualizar a migration JSON em WebserviceCampoDetalhe.
- Conferir se todos os campos possuem CampoId, Tipo, OrdemDeExibicao e mapeamento de payload quando aplicável.
- Validar blocos declarativos contra exemplos existentes.
- Confirmar se o contrato ainda está coberto por CadastroDeIntegracaoGateway.ts.
- Quando criar capacidade nova, atualizar C#, TypeScript, normalização, renderers e testes correspondentes.

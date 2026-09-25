# Padrões das migrations WebserviceCampoDetalhe

Levantamento executado em 2026-08-18 no repositório f360-new-horizons. Revalidar o repositório em cada tarefa, pois o contrato e os exemplos podem evoluir.

## Fontes atuais

- Diretório obrigatório: F360/F360.Infrastructure/DataAcess/Migrations/WebserviceCampoDetalhe
- Enum de nome e API: F360/F360.Domain.Financas/DomainEntities/Enums/WebserviceRelated/APIEnum.cs
- Entidade raiz: F360/F360.Domain.Financas/DomainEntities/WebserviceEntity/DefinicaoCampoWebservice.cs
- Contrato persistido: F360/F360.Domain.Financas/DomainEntities/WebserviceEntity/CampoDetalheModel.cs
- Shape, mapper e dry-run: F360/F360.Financas.Cli/Infrastructure/Automacoes/Migrations/WebserviceCampoDetalheMigrationCli.cs
- Registro do comando: F360/F360.Financas.Cli/Program.cs

## Evidências do conjunto existente

Foram inspecionados 174 JSONs e 594 campos:

- 174/174 arquivos têm nome-base exatamente igual a Nome, com comparação sensível a caixa;
- 174/174 usam JSON válido, UTF-8 sem BOM, CRLF, dois espaços por nível e nenhuma tabulação;
- 594/594 CampoId usam kebab-case ASCII minúsculo;
- não há API, CampoId ou OrdemDeExibicao duplicados;
- irregularidades históricas de caixa e sublinhado são preservadas porque vêm de APIEnum, por exemplo APIPdvClinicorp, PDVDataSystem e F360_public_api.

Usar como regra de nomenclatura:

1. Localizar o membro exato em APIEnum.
2. Usar seu valor numérico em API.
3. Usar o identificador exato do enum em Nome.
4. Salvar como Nome.json sem corrigir caixa, siglas ou sublinhados.

## Ordem estrutural

Ordem raiz predominante:

1. API
2. Nome
3. Descricao
4. Ativo
5. SubmitAction, quando existir
6. EditAction, quando existir
7. Campos

Ordem-base presente em 564 de 594 campos:

1. CampoId
2. Label
3. Tipo
4. Obrigatorio
5. Criptografado
6. Mascara
7. Descricao
8. Grupo
9. NomeObjetoNoLegado
10. Opcoes
11. Validacao
12. LimiteCaracteres
13. FieldSize
14. Placeholder
15. Hint
16. DisplayRules
17. OrdemDeExibicao
18. ValorPadrao
19. Visivel
20. Endpoint

Posicionar propriedades opcionais conforme os exemplos reais:

- ValueTransform, PayloadTransform e IncludeInPayload: depois de NomeObjetoNoLegado e antes de Opcoes;
- MinLength: depois de LimiteCaracteres e antes de FieldSize;
- RequiredRules: depois de DisplayRules e antes de OrdemDeExibicao;
- VisivelNaEdicao e Desabilitado: depois de Visivel e antes de Endpoint;
- EndpointParameters e RefetchDefinitionParameter: depois de Endpoint;
- Action: depois de Endpoint;
- RemoteCollection: depois de Action.

Em arquivo existente, preservar a ordem local mesmo que ela não coincida com a ordem predominante. Não serializar novamente o documento inteiro para fazer uma alteração pequena.

## Exemplos por capacidade

| Necessidade | Molde recomendado | Motivo |
|---|---|---|
| Estrutura simples, campos e endpoint de empresa | AdquirenteDeliveryDireto.json | Usa a ordem-base completa. |
| Resultado especial após save e edição legada | F360_public_api.json | Combina SubmitAction.result e EditAction. |
| Submit desabilitado, edição bloqueada e OAuth | ApiTagPlus.json | Usa none, blocked e oauthRedirect. |
| Submit/edit multipart, visibilidade de edição e refetch | NFe.json | Combina SubmitAction, EditAction, Upload e RefetchDefinitionParameter. |
| DisplayRules avançada, RequiredRules e tamanho exato | NFSe.json | Usa SelectedOptionAttribute, MinLength e RequiredRules. |
| Endpoint dependente de outro campo | ApiEVO.json | Usa EndpointParameters por CampoId. |
| Consulta e seleção em tabela | GestaoClick.json | Único exemplo atual de RemoteCollection. |
| Actions, contexto, transforms e exclusão do payload | Rede.json | Usa Action, IncludeInPayload, ValueTransform e PayloadTransform. |
| RequiredRules com checkbox | PdvCake.json | Segundo exemplo atual de obrigatoriedade condicional. |

Pesquisar novamente com rg antes de escolher um molde. Preferir exemplos que exercitem exatamente a combinação necessária e validar os valores contra contrato/consumo atual. Um valor histórico isolado não prova que ele deve ser usado em metadata nova; por exemplo, a documentação atual limita FieldSize a Small, Medium ou Large mesmo que arquivos antigos contenham Short.

## Validação local

Executar a partir da raiz do repositório.

### 1. Revisar somente o alvo

    git diff --check -- F360/F360.Infrastructure/DataAcess/Migrations/WebserviceCampoDetalhe/<Nome>.json
    git diff -- F360/F360.Infrastructure/DataAcess/Migrations/WebserviceCampoDetalhe/<Nome>.json

Confirmar que nenhum arquivo adicional foi alterado. Se houver mudanças pré-existentes do usuário, não as modificar.

### 2. Validar JSON e invariantes

Fazer parse do arquivo com profundidade suficiente e verificar:

- raiz com API, Nome, Descricao, Ativo e Campos;
- Nome idêntico ao nome-base do arquivo;
- API correspondente ao membro localizado em APIEnum;
- CampoId, Tipo e OrdemDeExibicao presentes em todos os campos;
- CampoId únicos e em kebab-case ASCII minúsculo;
- OrdemDeExibicao única;
- dependências por CampoId apontando para campos existentes;
- Hint como array JSON real;
- ausência dos aliases NomeCampo, Tamanho e TipoVisualizacao;
- NomeObjetoNoLegado presente quando o save/payload legado exigir;
- segredos com Criptografado verdadeiro;
- tipos, máscaras, validações, transforms e blocos declarativos documentados;
- encoding UTF-8 sem BOM, CRLF, dois espaços e nenhuma tabulação.

Exemplo mínimo de parse sem reescrever o arquivo:

    $targetMetadata = 'F360/F360.Infrastructure/DataAcess/Migrations/WebserviceCampoDetalhe/<Nome>.json'
    $rawMetadata = [System.IO.File]::ReadAllText(
      (Resolve-Path $targetMetadata),
      [System.Text.UTF8Encoding]::new($false, $true)
    )
    $definitionMetadata = $rawMetadata | ConvertFrom-Json -Depth 100

Usar o objeto somente para checagens; não serializá-lo de volta, pois isso reordena e reformata conteúdo.

### 3. Executar o dry-run oficial

Comando registrado em Program.cs:

    dotnet run --project F360/F360.Financas.Cli -- migracao:webservice-campo-detalhe --path F360/F360.Infrastructure/DataAcess/Migrations/WebserviceCampoDetalhe --dry-run

O dry-run processa todos os JSONs, valida o shape pelo WebserviceCampoDetalheMigrationMapper e compara com a collection sem gravar. Ele ainda resolve o repositório e pode depender da configuração/conexão do ambiente.

Se o dry-run não estiver disponível:

1. executar as validações estáticas restantes;
2. registrar o comando tentado e o erro exato;
3. declarar a validação incompleta;
4. não afirmar que a metadata está pronta ou validada integralmente.

Erros esperados do mapper incluem Campo sem CampoId e Validacao em formato invalido. Relacionar qualquer erro ao arquivo correspondente e não corrigir outras integrações sem aprovação explícita.

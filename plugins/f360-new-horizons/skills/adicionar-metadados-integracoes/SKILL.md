---
name: adicionar-metadados-integracoes
description: >-
  Cria e atualiza exclusivamente arquivos JSON de metadata do cadastro dinâmico
  de integrações da F360 em
  F360/F360.Infrastructure/DataAcess/Migrations/WebserviceCampoDetalhe,
  respeitando o contrato, a nomenclatura, a estrutura, a formatação e as
  validações existentes. Use quando o usuário pedir para adicionar, montar,
  corrigir ou alterar a metadata, a definição de campos ou a migration JSON de
  uma integração específica, inclusive DisplayRules, RequiredRules, Validacao,
  Opcoes, Action, SubmitAction, EditAction, RemoteCollection e demais
  propriedades já suportadas. Não use como fluxo principal para investigação
  ponta a ponta do legado nem para implementar mudanças no contrato, back-end
  ou front Vue.
---

# Adicionar metadados de integrações

## Aplicar as fontes

1. Ler integralmente [references/contrato-campos-integracoes.md](references/contrato-campos-integracoes.md) antes de editar. Tratar essa documentação como fonte semântica principal.
2. Ler [references/padroes-migrations.md](references/padroes-migrations.md) para localizar o contrato atual, escolher moldes, preservar a ordem das propriedades e executar as validações.
3. Consultar [references/estrutura-painel-integracoes.md](references/estrutura-painel-integracoes.md) como referência secundária quando for necessário entender o fluxo entre metadata, painel, cadastro, edição, persistência ou preparação contextual. Usar esse conteúdo como contexto, não como autorização para alterar back-end, front-end ou ampliar o escopo.
4. Conferir no repositório o contrato C#/CLI e os exemplos reais mais próximos. Se a documentação, o contrato atual e os exemplos divergirem, interromper e relatar a divergência; não adivinhar.

## Restringir o escopo

- Criar ou alterar somente o JSON da integração solicitada dentro de F360/F360.Infrastructure/DataAcess/Migrations/WebserviceCampoDetalhe.
- Manter qualquer arquivo novo obrigatoriamente nessa pasta.
- Não modificar outra integração, CampoDetalheModel.cs, o mapper/shape da CLI, DTOs, endpoints, tipos TypeScript, normalização ou código Vue sem aprovação explícita.
- Não criar tipos, renderizadores, validadores, regras genéricas ou soluções híbridas como parte do fluxo padrão.
- Não fazer refatorações, correções oportunistas ou reformatações fora da metadata solicitada.

## Executar o fluxo

1. **Compreender a regra.** Registrar comportamento esperado, condições, valores, obrigatoriedade, visibilidade, persistência, ações e evidências disponíveis. Marcar ambiguidades para revisão humana; não inventar valores, opções, hints ou comportamento.
2. **Identificar a integração.** Localizar o membro exato em APIEnum.cs, o número da API e o JSON existente. Para arquivo novo, usar exatamente o nome do membro do enum como Nome e como nome do arquivo, preservando caixa e sublinhados.
3. **Selecionar moldes.** Procurar com rg integrações que usem a mesma capacidade. Ler o arquivo-alvo e pelo menos o exemplo funcional mais semelhante. Preferir o molde pela combinação de Tipo, regra, action e estratégia de payload, não apenas pelo nome da integração.
4. **Esgotar o contrato atual.** Verificar todas as propriedades aplicáveis. Priorizar composição de DisplayRules, RequiredRules, Validacao, Opcoes, Visivel, VisivelNaEdicao, Obrigatorio, LimiteCaracteres, MinLength, Action, SubmitAction, EditAction, EndpointParameters, RemoteCollection, transforms e demais estruturas documentadas.
5. **Editar somente a metadata.** Usar apply_patch e limitar o diff ao arquivo-alvo. Em arquivo novo, copiar primeiro o exemplo mais semelhante para preservar encoding e finais de linha e então substituir o conteúdo necessário.
6. **Preservar o formato.** Manter UTF-8 sem BOM, CRLF, indentação de 2 espaços, ordem existente das propriedades e conteúdo não relacionado. Inserir propriedades opcionais na posição usada pelos exemplos equivalentes.
7. **Validar.** Executar todas as checagens aplicáveis descritas em padroes-migrations.md, incluindo parse JSON, invariantes estruturais, revisão do diff e dry-run da migration quando disponível.

## Bloquear evolução de contrato

Considerar propriedade nova uma exceção. Se nenhuma composição do contrato atual representar a regra:

1. Interromper a implementação antes de alterar o JSON para um formato não suportado ou qualquer outra camada.
2. Explicar por que cada propriedade candidata não atende.
3. Apresentar evidências da regra e dos exemplos analisados.
4. Propor a menor evolução genérica possível, preferencialmente com nome em inglês e sem referência a uma integração.
5. Listar impactos previstos no JSON, WebserviceCampoDetalheMigrationCampo e mapper da CLI, CampoDetalheModel/Mongo, endpoint/DTOs, tipos TypeScript, normalização, renderer/validador, consumo Vue e testes.
6. Solicitar aprovação explícita e encerrar sem implementar a proposta.

Aplicar o mesmo bloqueio antes de:

- modificar CampoDetalheModel.cs;
- modificar WebserviceCampoDetalheMigrationCampo ou o mapeamento da CLI;
- modificar DTOs ou contratos do endpoint;
- modificar qualquer código Vue;
- criar tipos, renderizadores, validadores ou regras genéricas;
- implementar abordagem híbrida entre metadata, front-end e back-end;
- modificar arquivos de outras integrações não nomeadas explicitamente pelo usuário.

Após aprovação, tratar apenas as camadas aprovadas como expansão explícita do escopo e replanejar antes de editar.

## Evitar atalhos

- Não criar propriedade por conveniência nem duplicar capacidade existente.
- Não usar aliases antigos em migration nova.
- Não hardcodar regra pelo nome, código ou API da integração.
- Não deduzir suporte apenas porque um JSON histórico contém um valor; validar contra a documentação e o consumo atual.
- Não alterar back-end ou front-end silenciosamente.
- Não criar o arquivo fora da pasta nem definir seu nome sem conferir APIEnum e os arquivos existentes.
- Não reordenar, reindentar ou normalizar conteúdo não relacionado.
- Não afirmar que a metadata está pronta sem executar e informar as validações aplicáveis.

## Entregar o resultado

Informar de forma objetiva:

1. regra de negócio compreendida;
2. arquivos semelhantes usados como referência;
3. propriedades existentes escolhidas e justificativa;
4. caminho e nomenclatura do JSON criado ou alterado;
5. alterações realizadas exclusivamente na metadata;
6. comandos e resultados das validações;
7. ambiguidades que exigem revisão humana.

Se o contrato for insuficiente, entregar separadamente a proposta de evolução e o pedido de aprovação, sem mudanças adicionais.

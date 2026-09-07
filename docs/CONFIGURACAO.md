# Configuração por operação

O arquivo `config/operation.js` define `window.NOCFLOW_CONFIG` e é carregado antes da aplicação. Use somente dados autorizados ao disponibilizar uma instalação. Na edição pública, os valores padrão devem permanecer inequivocamente fictícios.

| Campo | Uso |
| --- | --- |
| `version` | Versão exibida pela interface |
| `operationName` | Cabeçalho da operação |
| `client` | Identificação e razão social fictícia do cliente |
| `contacts.noc` | Contato no comunicado de abertura |
| `carriers` | Opções dos formulários de atualização e normalização |
| `severities`, `defaultSeverity` | Seletor de severidade para novos alertas |
| `templates` | Modelos de alerta, atualização e normalização |
| `workflowGuidance.nextStepsBySituation` | Sugestões de Próximos Passos por Situação Atual |
| `workflowGuidance.additionalNormalizationActions` | Ações corretivas adicionais exibidas na Normalização |
| `base.records` | Unidades e links por unidade |
| `estimatesMinutesPerAction` | `null` por padrão: nenhuma economia medida |

Os modelos substituem campos como `{site}`, `{numeroChamado}` e `{dataHoraEvento}` por texto simples. Não executam HTML nem JavaScript. Preserve os campos essenciais ao editar.

## Próximos Passos contextuais

A v1.1.0 permite orientar o operador sem engessar a tratativa. Cada valor de `Situação Atual` pode ter uma lista de próximos passos associada. A interface sempre acrescenta `Outros` quando necessário.

Exemplo:

```js
workflowGuidance: {
  nextStepsBySituation: {
    "Em análise pelo time interno": [
      "Aguardar retorno do time interno.",
      "Monitorar o serviço.",
      "Validar a solução após atuação do time interno."
    ]
  },
  additionalNormalizationActions: [
    "Energia elétrica restabelecida na localidade"
  ]
}
```

As opções são sugestões de interface. O comunicado continua usando o valor efetivamente escolhido pelo operador.

## Base Operacional

Cada unidade contém `ibm` (identificador legado do esquema, exibido como ID da unidade), `centroCusto`, `bandeira`, `cnpj`, `unidade`, `telefone`, `endereco` e `links`. Cada link, `WAN 1` ou `WAN 2`, contém `operadora`, `designacao` e `velocidade`.

Na configuração pública:

- `base.environment` deve permanecer `DEMO`;
- identificadores e circuitos devem usar padrões visivelmente fictícios, como `DEMO-*`;
- CNPJ, telefone, endereço e contatos não devem reproduzir valores reais;
- operadoras de demonstração devem ser identificadas como fictícias.

Para importar JSON, use um objeto com `records` ou uma lista de registros nesse formato. CSV/TSV aceita `UNIDADE`, `ID`, `CENTRO DE CUSTO`, `BANDEIRA`, `CNPJ`, `TELEFONE`, `ENDERECO` e as colunas dos links reconhecidas em `assets/js/operational-base.js`. JSON é preferível para preservar explicitamente os dois links.

Uma importação cria uma substituição **local** da base no navegador. Esse arquivo não deve ser adicionado ao repositório público quando contiver dados reais.

## Isolamento

A configuração representa uma operação por instalação. Para operações simultâneas, sirva cada instalação em origens distintas. O prefixo `nocflow_v1_` isola esta edição de outros produtos e foi mantido na v1.1.0 para compatibilidade dos dados locais da linha 1.x.

O formato genérico de monitoramento é `DD-MM-AAAA HH:MM:SS Monitoramento Unidade - SP_ID - WAN 1 com problemas!`. Para integrar outro formato, adapte e teste o parser.

Os valores `alert`, `update`, `normalization` e `shiftReport` em `estimatesMinutesPerAction` só devem ser definidos a partir de uma amostra cronometrada e documentada. Mesmo configurados, o resultado é estimativa, não medição individual.

Antes de publicar novos exemplos, consulte [Publicação segura](PUBLICACAO_SEGURA.md).

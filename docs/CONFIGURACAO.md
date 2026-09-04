# Configuração por operação

O arquivo `config/operation.js` define `window.NOCFLOW_CONFIG` e é carregado antes da aplicação. Use somente dados autorizados ao disponibilizar uma instalação.

| Campo | Uso |
| --- | --- |
| `operationName` | Cabeçalho da operação |
| `client` | Identificação e razão social fictícia do cliente |
| `contacts.noc` | Contato no comunicado de abertura |
| `carriers` | Opções dos formulários de atualização e normalização |
| `severities`, `defaultSeverity` | Seletor de severidade para novos alertas |
| `templates` | Modelos de alerta, atualização e normalização |
| `base.records` | Unidades e links por unidade |
| `estimatesMinutesPerAction` | `null` por padrão: nenhuma economia medida |

Os modelos substituem campos como `{site}`, `{numeroChamado}` e `{dataHoraEvento}` por texto simples. Não executam HTML nem JavaScript. Os campos disponíveis estão nos modelos padrão; preserve os campos essenciais ao editar.

Cada unidade contém `ibm` (identificador legado do esquema, exibido como ID da unidade), `centroCusto`, `bandeira` (cliente/grupo), `cnpj`, `unidade`, `telefone`, `endereco` e `links`. Cada link, `WAN 1` ou `WAN 2`, contém `operadora`, `designacao` e `velocidade`. Os identificadores numéricos da demonstração são inventados.

Para importar JSON, use um objeto com `records` ou uma lista de registros nesse formato. CSV/TSV aceita `UNIDADE`, `ID`, `CENTRO DE CUSTO`, `BANDEIRA`, `CNPJ`, `TELEFONE`, `ENDERECO` e as colunas dos links reconhecidas em `assets/js/operational-base.js`. JSON é preferível para preservar explicitamente os dois links. Uma importação cria uma substituição local da base; restaurar a base embarcada volta à configuração do projeto.

A configuração representa uma operação por instalação. Para operações simultâneas, sirva cada instalação em origens distintas. O prefixo `nocflow_v1_` isola esta edição de outros produtos, mas duas instalações NOC Flow na mesma origem compartilham os dados.

O formato genérico de monitoramento é `DD-MM-AAAA HH:MM:SS Monitoramento Unidade - SP_ID - WAN 1 com problemas!`. Para integrar outro formato, adapte e teste o parser.

Os valores `alert`, `update`, `normalization` e `shiftReport` em `estimatesMinutesPerAction` só devem ser definidos a partir de uma amostra cronometrada e documentada. Mesmo configurados, o resultado é estimativa, não medição individual.

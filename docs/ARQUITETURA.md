# Decisões técnicas

- **Preservar interface e regras existentes:** a edição usa os fluxos consolidados, sem reescrita de framework.
- **Separar configuração e funcionamento:** `config/operation.js` concentra cadastros e modelos. `config.js` aplica as opções com APIs DOM e substitui campos como texto.
- **Separar módulos:** `parser.js`, `shift.js`, `app.js`, `operational-base.js` e `demo.js` tornam a revisão mais simples.
- **Persistência local:** adequada à demonstração sem infraestrutura. Não equivale a banco central ou colaboração entre analistas.
- **Isolamento:** todas as chaves desta edição usam `nocflow_v1_`. Não existe migração automática de dados de outro produto. Backups exigem esquema próprio e filtram o namespace.
- **Minimizar dados publicados:** somente três unidades inventadas, contatos não preenchidos e circuitos identificados como DEMO. O projeto público não depende da base original.
- **Sem números inventados:** contagens vêm dos eventos locais e a economia de tempo permanece não medida.
- **Histórico independente:** primeiro commit criado a partir de arquivos revisados, sem ancestrais ou objetos do repositório de origem.

O diagrama no README é uma representação do fluxo, não uma captura de tela. Não foram incluídas imagens antigas, pois poderiam conter informações operacionais.

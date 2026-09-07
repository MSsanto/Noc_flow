# Decisões técnicas

- **Preservar interface e regras existentes:** a edição usa os fluxos consolidados, sem reescrita de framework.
- **Separar configuração e funcionamento:** `config/operation.js` concentra cadastros fictícios, modelos e orientações de fluxo. `config.js` aplica as opções com APIs DOM e carrega a camada de UX.
- **Separar módulos:** `parser.js`, `shift.js`, `app.js`, `operational-base.js` e `demo.js` mantêm responsabilidades funcionais distintas.
- **Evoluir UX sem reescrever o núcleo:** a v1.1.0 adiciona `ux-v1.1.js` e `ux-v1.1.css`. Essa camada reorganiza navegação, feedback e ergonomia usando os controles existentes.
- **Persistência local:** adequada à demonstração sem infraestrutura. Não equivale a banco central ou colaboração entre analistas.
- **Isolamento:** todas as chaves desta edição usam `nocflow_v1_`. O namespace foi mantido na v1.1.0 para preservar compatibilidade dentro da linha 1.x. Não existe migração automática de dados de outro produto.
- **Minimizar dados publicados:** somente três unidades inventadas, contatos não preenchidos e circuitos identificados como `DEMO-`. O projeto público não depende de base real.
- **Configuração demonstrativa testável:** `tests/public-config.test.cjs` valida que a base padrão permanece marcada como DEMO, com valores fictícios e sem atribuições de segredos hard-coded.
- **Sem números inventados de desempenho:** contagens vêm dos eventos locais e a economia de tempo permanece não medida.
- **Histórico independente:** o repositório público mantém seu próprio histórico e não importa commits de uma ferramenta privada.

## Fluxo de carregamento

1. `config/operation.js` define a operação demonstrativa.
2. `config.js` aplica configurações e registra a camada UX v1.1 para carregamento após a aplicação.
3. `parser.js` interpreta alertas.
4. `shift.js` calcula o plantão operacional.
5. `app.js` executa o ciclo de alerta, atualização, normalização, relatórios, métricas e persistência.
6. `operational-base.js` oferece consulta/importação local e geração de abertura para operadora.
7. `demo.js` carrega exemplos sintéticos sob confirmação.
8. `ux-v1.1.js` reorganiza navegação e feedback sem substituir o núcleo funcional.

O diagrama no README é uma representação do fluxo, não uma captura de dados reais. Imagens e exemplos publicados devem obedecer `docs/PUBLICACAO_SEGURA.md`.

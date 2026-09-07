# UX/UI — NOC Flow v1.1.0

A v1.1.0 evolui a ergonomia da edição pública sem alterar o objetivo principal do produto: registrar ocorrências de NOC, padronizar comunicados, acompanhar tratativas e preparar a passagem de turno.

## Princípio

A experiência do operador pode evoluir sem reescrever o núcleo funcional. Por isso, a v1.1.0 mantém `app.js`, parser, regras de turno e Base Operacional como módulos independentes e adiciona uma camada de UX em:

- `assets/js/ux-v1.1.js`
- `assets/css/ux-v1.1.css`

A camada é carregada pelo bootstrap de configuração após a aplicação principal.

## Melhorias

### Navegação
- Sidebar reorganizada em **Operação**, **Apoio ao plantão**, **Dados** e **Sistema**.
- Rolagem vertical independente.
- Somente a ação operacional selecionada recebe estado ativo.
- Atalhos deslocam o foco para o bloco correspondente com destaque temporário.

### Contexto do plantão
- O turno atual aparece no topo usando `NocFlowShift.getOperationalShift()`.
- A regra continua sendo 06:00–18:00 para o período diurno e 18:00–06:00 para o noturno.
- A madrugada permanece associada ao plantão noturno iniciado no dia anterior.

### Dashboard e listas
- Cards de Alertas, Atualizações e Normalizações funcionam como atalhos.
- O placeholder da busca informa a aba pesquisada.
- O critério de ordenação selecionado recebe estado visual.

### Feedback
- Operações rotineiras de sucesso podem usar toast.
- Erros, conflitos e ações destrutivas continuam usando feedback bloqueante.
- Atualização e Normalização mostram se uma ocorrência ativa foi localizada, se há ambiguidade ou se o registro seguirá sem vínculo local.

### Formulários
- `Próximos Passos` é preenchido com opções coerentes com a `Situação Atual`.
- As opções são configuradas em `workflowGuidance.nextStepsBySituation`.
- `Outros` continua disponível para não limitar a decisão do operador.
- A Normalização recebe a opção genérica `Energia elétrica restabelecida na localidade` em Ação Corretiva.

### Reinício do plantão
- A ação fica isolada no grupo Sistema.
- Exige confirmação.
- Gera backup JSON automaticamente antes da limpeza.
- Remove alertas ativos e dados do turno corrente.
- Preserva tema, Base Operacional local e dados de outros turnos.

## Escopo

Esta é uma implementação genérica de portfólio. Os textos demonstrativos, operadoras, unidades e cadastros da configuração pública são fictícios e não representam uma operação específica.

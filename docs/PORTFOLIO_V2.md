# NOC Flow Cloud — Portfolio v2

Esta evolução transforma o NOC Flow de uma aplicação local em uma aplicação web full stack, preservando a edição estática existente como referência funcional.

## Objetivo

Demonstrar competências de engenharia de software aplicadas a um domínio real de operações de TI:

- Angular 22 no frontend;
- FastAPI no backend;
- API REST versionada e documentada com OpenAPI;
- testes automatizados de frontend e backend;
- CI com GitHub Actions;
- deploy no Microsoft Azure;
- infraestrutura como código;
- observabilidade e health checks;
- desenvolvimento orientado a branches e pull requests.

## Arquitetura alvo

```text
Angular 22
   |
   | HTTPS / JSON
   v
FastAPI /api/v1
   |
   +-- ocorrencias
   +-- atualizacoes
   +-- normalizacoes
   +-- unidades
   +-- operadoras
   +-- passagem-de-turno
   |
   v
Persistencia

Azure
   +-- Static Web Apps ........ frontend
   +-- App Service Linux ...... FastAPI
   +-- Application Insights ... observabilidade
   +-- Key Vault .............. segredos
   +-- Bicep .................. infraestrutura como codigo
```

## API implementada

A fundação já expõe um primeiro contrato REST de domínio:

| Método | Endpoint | Objetivo |
| --- | --- | --- |
| `GET` | `/health` | health check da aplicação |
| `GET` | `/api/v1` | metadados da versão da API |
| `GET` | `/api/v1/incidents` | listar ocorrências |
| `POST` | `/api/v1/incidents` | abrir uma ocorrência |
| `GET` | `/api/v1/incidents/{id}` | consultar uma ocorrência |
| `PATCH` | `/api/v1/incidents/{id}/status` | registrar atualização ou normalização |

A máquina de estados impede retorno para `alert` e trata `normalized` como estado final. O armazenamento ainda é em memória de forma deliberada nesta fundação; persistência e migrations pertencem ao próximo incremento.

## Estratégia de migração

A aplicação HTML/JS atual permanece funcional enquanto a versão v2 é desenvolvida em `apps/web` e `apps/api`. A migração será incremental para permitir comparação de comportamento e regressão.

### Fase 1 — Fundação

- [x] branch isolada de desenvolvimento;
- [x] documento de arquitetura;
- [x] health check da API;
- [x] testes da API;
- [x] shell Angular;
- [x] CI para frontend e backend.

### Fase 2 — Domínio

- [x] criação, listagem e consulta de ocorrências;
- [x] transições Alerta -> Atualização -> Normalização;
- [ ] persistência e migrations;
- [ ] validação de duplicidade;
- [ ] cálculo de turno;
- [x] testes das regras de negócio iniciais.

### Fase 3 — Integração

- [ ] Angular consumindo a API;
- [ ] tratamento de loading/error/empty state;
- [ ] testes de componentes e serviços;
- [ ] testes E2E dos fluxos críticos.

### Fase 4 — Azure

- [x] baseline Bicep para frontend e API;
- [ ] deploy de preview por PR;
- [ ] deploy de produção após merge;
- [ ] Application Insights;
- [ ] documentação de custos e teardown.

## Critérios de qualidade

Toda mudança relevante deve entrar por Pull Request. O CI deverá bloquear merge quando build, lint ou testes falharem. Cobertura é usada como indicador de risco, não como meta artificial isolada.

A fundação da API alcançou 100% de cobertura de statements e branches no CI do primeiro contrato de domínio. Esse número deve cair naturalmente quando o domínio crescer; a meta mínima automatizada permanece em 80% para evitar otimização artificial do indicador.

**Desenvolvido por Matheus Santo**

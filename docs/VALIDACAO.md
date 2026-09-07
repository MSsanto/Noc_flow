# Validação da versão 1.1.0

Execute:

```bash
npm test
```

ou diretamente:

```bash
node --test tests/*.test.cjs
```

com Node.js 22 ou posterior.

## Cobertura existente

Os testes cobrem agrupamento de WANs, separação entre unidades, rejeição de entrada incompleta, virada de turno, carga da demonstração, atualização, normalização, geração de relatório, abertura com operadora, backup/restauração, isolamento do armazenamento e ausência de estimativas presumidas.

A integração usa um DOM simulado para executar os scripts reais. Não substitui validação visual em navegadores reais.

## Validações adicionadas na v1.1.0

`tests/public-config.test.cjs` verifica que:

- a versão configurada é 1.1.0;
- a Base Operacional padrão permanece em ambiente `DEMO`;
- as três unidades embarcadas continuam claramente fictícias;
- circuitos usam prefixo `DEMO-LINK-`;
- operadoras são identificadas como fictícias;
- CNPJ, telefone e endereço não são valores reais na configuração padrão;
- a orientação contextual de Próximos Passos permanece configurável;
- a nova Ação Corretiva de energia está disponível;
- os arquivos JavaScript públicos não possuem atribuições simples de segredo hard-coded.

Esse teste é uma proteção adicional; revisão humana continua obrigatória para imagens, documentação, exemplos e novos formatos de dados.

## Checklist visual/manual v1.1.0

- [ ] Abrir em 1366×768 e 1920×1080 a 100% de zoom.
- [ ] Confirmar rolagem independente da sidebar.
- [ ] Validar os quatro grupos da navegação.
- [ ] Validar plantão atual no topo.
- [ ] Validar atalhos dos cards e destaque do destino.
- [ ] Validar busca por aba e seleção visual da ordenação.
- [ ] Testar cada Situação Atual e suas opções de Próximos Passos.
- [ ] Testar a Ação Corretiva `Energia elétrica restabelecida na localidade`.
- [ ] Validar feedback de vínculo em Atualização e Normalização.
- [ ] Validar Reiniciar plantão, incluindo backup automático e preservação da Base Operacional/tema.
- [ ] Validar tema claro e escuro.
- [ ] Confirmar que a demonstração continua usando apenas dados fictícios.

## Publicação

A edição pública não deve conter identidade empresarial real, exemplos internos, contatos operacionais, planilhas de origem, backups ou números de cadastro/circuito reais. Consulte `docs/PUBLICACAO_SEGURA.md` antes de publicar alterações.

A revisão técnica não determina titularidade do código nem substitui a confirmação de autorização de publicação pelo autor conforme suas obrigações profissionais.

# Publicação segura

O NOC Flow é um projeto público de portfólio. Todo conteúdo versionado deve ser suficiente para demonstrar arquitetura, fluxo e decisões técnicas sem expor informações de uma operação real.

## Pode ser publicado

- nomes de unidades inventados;
- identificadores iniciados por `DEMO-` ou faixas reservadas à demonstração;
- operadoras explicitamente marcadas como fictícias;
- endereços descritivos sem localização real;
- CNPJ, telefone e contatos indicados como não informados/fictícios;
- exemplos sintéticos de alertas, chamados e relatórios;
- regras de UX, arquitetura e testes genéricos.

## Não deve ser publicado

- nome, marca ou razão social de cliente real;
- CNPJ, telefone, endereço ou contato operacional real;
- designação/circuito real;
- IDs internos, números de chamados ou protocolos reais;
- backups de navegador ou exportações de produção;
- planilhas usadas por uma operação real;
- credenciais, senhas, tokens, PINs, chaves de API ou dados de acesso remoto;
- comentários, nomes de arquivos ou exemplos que permitam inferir uma operação específica.

## Base Operacional

`config/operation.js` deve permanecer demonstrativo. A configuração padrão precisa manter:

- `base.environment = "DEMO"`;
- registros fictícios e facilmente identificáveis como demonstração;
- ausência de números que se pareçam com CNPJ ou telefone reais;
- circuitos com prefixo `DEMO-`;
- operadoras identificadas como fictícias.

A aplicação permite importação local de JSON/CSV/TSV para testes. Esses arquivos permanecem no navegador do usuário e **não devem ser commitados** no repositório.

## Revisão antes de publicar

1. Executar `npm test`.
2. Revisar alterações em `config/`, `docs/` e exemplos.
3. Confirmar que imagens não exibem dados reais.
4. Confirmar que nenhum backup/export foi adicionado ao Git.
5. Verificar se novos exemplos são sintéticos e não derivados por simples anonimização de registros reais.

## Princípio

Quando houver dúvida entre realismo e privacidade, prefira um exemplo claramente fictício. O objetivo do repositório é demonstrar engenharia e experiência de produto, não reproduzir uma operação de cliente.

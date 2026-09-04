# Validação da versão 1.0.0

Execute `node --test tests/*.test.cjs` com Node.js 22 ou posterior.

Os testes cobrem agrupamento de WANs, separação entre unidades, rejeição de entrada incompleta, virada de turno, carga da demonstração, atualização, normalização, geração de relatório, abertura com operadora, backup/restauração, isolamento do armazenamento e ausência de estimativas presumidas.

A integração usa um DOM simulado para executar os scripts reais. Não houve teste visual em navegador; aparência, responsividade, downloads e acesso ao clipboard ainda requerem validação manual.

A revisão de publicação removeu a base embarcada original, identidade empresarial, exemplos internos, contato do NOC, nomes de arquivos de origem, migração antiga e números presumidos de economia. Foi feita comparação dos arquivos entregues com CNPJs, telefones, identificadores, endereços e circuitos da base de origem. Nenhum valor identificador foi encontrado.

A revisão técnica não determina titularidade do código nem substitui a confirmação de autorização de publicação pelo autor conforme suas obrigações profissionais.

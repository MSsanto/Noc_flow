// Desenvolvido por Matheus Santo
// Configuração pública: somente dados fictícios.
window.NOCFLOW_CONFIG = {
  "product": "NOC Flow",
  "version": "1.1.0",
  "operationName": "Operação Demonstração",
  "client": {
    "name": "Cliente Demonstração",
    "legalName": "Cliente Demonstração — organização fictícia"
  },
  "contacts": {
    "noc": "Não informado (demonstração)"
  },
  "carriers": [
    "Operadora Alfa (fictícia)",
    "Operadora Beta (fictícia)"
  ],
  "severities": [
    "Desastre",
    "Alta",
    "Média",
    "Baixa"
  ],
  "defaultSeverity": "Desastre",
  "templates": {
    "alert": "⛔Comunicado de Alerta:⛔\n\nData/Hora do Evento: {dataHoraEvento}\nIC’s/ Host: {site}\nNúmero do Chamado: {numeroChamado}\nSeveridade: {severidade}\nServico Impactado: {servicoImpactado}\nSintoma Observado: {sintomaObservado}\nAnalise Inicial: {analiseInicial}\nAcoes Imediatas em Andamento: {acoesImediatas}",
    "update": "🔄Comunicado de Atualização:🔄\nData/Hora da Atualização: {dataHoraAtualizacao}\nSite: {site}\nNúmero do chamado: {numeroChamado}\nSituacao Atual: {situacaoAtual}\nAcoes Realizadas: {acoesRealizadas}\nProximos Passos: {proximosPassos}",
    "normalization": "✅Comunicado de Normalizacao:✅\nData/Hora Normalizacao: {dataHoraNormalizacao}\nSite: {site}\nNúmero do Chamado: {numeroChamado}\nServico Afetado: {servicoAfetado}\nCausa Identificada: {causaIdentificada}\nAcao Corretiva: {acaoCorretivaRealizada}\nStatus Final: {statusFinal}"
  },
  "workflowGuidance": {
    "nextStepsBySituation": {
      "__ABRINDO_OPERADORA__": [
        "Aguardar retorno da operadora com o protocolo de atendimento.",
        "Acompanhar a abertura do chamado junto à operadora.",
        "Monitorar o serviço enquanto aguarda retorno da operadora."
      ],
      "__AGUARDANDO_OPERADORA__": [
        "Aguardar a atuação da equipe de campo da operadora.",
        "Acompanhar o chamado junto à operadora conforme o SLA.",
        "Monitorar o serviço."
      ],
      "Aguardando retorno da Energia Elétrica na localidade": [
        "Aguardar o restabelecimento da energia elétrica na localidade.",
        "Manter contato com o responsável pela unidade.",
        "Após o retorno da energia, validar a conectividade da unidade."
      ],
      "Em análise pelo time interno": [
        "Aguardar retorno do time interno.",
        "Monitorar o serviço.",
        "Validar a solução após atuação do time interno."
      ],
      "Problema resolvido, aguardando validação": [
        "Validar solução com a unidade.",
        "Monitorar o serviço.",
        "Normalizar a ocorrência após validação."
      ],
      "Enviado para verificação do field": [
        "Aguardar retorno da equipe de campo.",
        "Acompanhar a atuação da equipe de campo.",
        "Validar o serviço após a atuação da equipe de campo."
      ],
      "Outros": [
        "Monitorar o serviço.",
        "Aguardar retorno do responsável pela tratativa.",
        "Validar a solução após a próxima atuação.",
        "Outros"
      ]
    },
    "additionalNormalizationActions": [
      "Energia elétrica restabelecida na localidade"
    ]
  },
  "estimatesMinutesPerAction": null,
  "base": {
    "source": "Dados fictícios criados para demonstração",
    "environment": "DEMO",
    "records": [
      {
        "ibm": "9000001",
        "centroCusto": "DEMO-CC-001",
        "bandeira": "Cliente Demonstração",
        "cnpj": "Não informado (fictício)",
        "unidade": "Unidade Aurora",
        "telefone": "Não informado (fictício)",
        "endereco": "Endereço fictício da unidade 1 — sem localização real",
        "links": {
          "WAN 1": {
            "designacao": "DEMO-LINK-001-1",
            "operadora": "Operadora Alfa (fictícia)",
            "velocidade": "100 MB"
          },
          "WAN 2": {
            "designacao": "DEMO-LINK-001-2",
            "operadora": "Operadora Beta (fictícia)",
            "velocidade": "100 MB"
          }
        }
      },
      {
        "ibm": "9000002",
        "centroCusto": "DEMO-CC-002",
        "bandeira": "Cliente Demonstração",
        "cnpj": "Não informado (fictício)",
        "unidade": "Unidade Horizonte",
        "telefone": "Não informado (fictício)",
        "endereco": "Endereço fictício da unidade 2 — sem localização real",
        "links": {
          "WAN 1": {
            "designacao": "DEMO-LINK-002-1",
            "operadora": "Operadora Alfa (fictícia)",
            "velocidade": "100 MB"
          },
          "WAN 2": {
            "designacao": "DEMO-LINK-002-2",
            "operadora": "Operadora Beta (fictícia)",
            "velocidade": "100 MB"
          }
        }
      },
      {
        "ibm": "9000003",
        "centroCusto": "DEMO-CC-003",
        "bandeira": "Cliente Demonstração",
        "cnpj": "Não informado (fictício)",
        "unidade": "Unidade Estrela",
        "telefone": "Não informado (fictício)",
        "endereco": "Endereço fictício da unidade 3 — sem localização real",
        "links": {
          "WAN 1": {
            "designacao": "DEMO-LINK-003-1",
            "operadora": "Operadora Alfa (fictícia)",
            "velocidade": "100 MB"
          },
          "WAN 2": {
            "designacao": "DEMO-LINK-003-2",
            "operadora": "Operadora Beta (fictícia)",
            "velocidade": "100 MB"
          }
        }
      }
    ]
  }
};

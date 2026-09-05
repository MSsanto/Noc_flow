from fastapi import FastAPI

app = FastAPI(
    title="NOC Flow API",
    version="0.1.0",
    description="API do NOC Flow Cloud para gerenciamento de ocorrencias de rede.",
)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "noc-flow-api"}


@app.get("/api/v1", tags=["meta"])
def api_root() -> dict[str, str]:
    return {
        "name": "NOC Flow API",
        "version": "v1",
        "docs": "/docs",
    }

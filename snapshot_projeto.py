import os
from datetime import datetime

# ── Configuração ─────────────────────────────────────────────────

# Diretórios ignorados na varredura
IGNORAR_DIRS = {
    "node_modules",
    ".git",
    ".next",
    ".husky",
    "dist",
    "build",
    ".cache",
    "coverage",
    "teacher-output",
}

# Extensões capturadas
EXTENSOES = {
    ".ts", ".tsx", ".js", ".jsx",
    ".json", ".md", ".css", ".html",
    ".env.example", ".mjs", ".cjs",
}

# Arquivos ignorados pelo nome exato
IGNORAR_ARQUIVOS = {
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
}

SAIDA = f"snapshot_{datetime.now().strftime('%Y%m%d_%H%M')}.md"


# ── Utilitários ──────────────────────────────────────────────────

def extensao_linguagem(nome: str) -> str:
    ext = nome.rsplit(".", 1)[-1].lower()
    mapa = {
        "ts": "typescript",
        "tsx": "typescript",
        "js": "javascript",
        "jsx": "javascript",
        "mjs": "javascript",
        "cjs": "javascript",
        "json": "json",
        "md": "markdown",
        "css": "css",
        "html": "html",
    }
    return mapa.get(ext, "")


def deve_capturar(nome: str) -> bool:
    if nome in IGNORAR_ARQUIVOS:
        return False
    _, ext = os.path.splitext(nome)
    return ext in EXTENSOES


def coletar_arquivos(raiz: str) -> list[tuple[str, str]]:
    """Retorna lista de (caminho_relativo, caminho_absoluto) ordenada."""
    resultado = []

    for dirpath, dirnames, filenames in os.walk(raiz):
        # Remove dirs ignorados in-place para evitar descida
        dirnames[:] = sorted(
            d for d in dirnames if d not in IGNORAR_DIRS
        )

        for nome in sorted(filenames):
            if deve_capturar(nome):
                abs_path = os.path.join(dirpath, nome)
                rel_path = os.path.relpath(abs_path, raiz).replace("\\", "/")
                resultado.append((rel_path, abs_path))

    return resultado


def ler_arquivo(caminho: str) -> str:
    try:
        with open(caminho, "r", encoding="utf-8") as f:
            return f.read()
    except UnicodeDecodeError:
        return "*[arquivo binário ou encoding não-UTF-8 — ignorado]*\n"
    except Exception as e:
        return f"*[erro ao ler arquivo: {e}]*\n"


# ── Geração do snapshot ──────────────────────────────────────────

def gerar_snapshot(raiz: str) -> None:
    arquivos = coletar_arquivos(raiz)

    linhas = []
    linhas.append(f"# Snapshot — the-blog")
    linhas.append(f"*Gerado em {datetime.now().strftime('%d/%m/%Y %H:%M')}*")
    linhas.append(f"*Raiz: `{raiz}`*\n")
    linhas.append("---\n")

    # Índice
    linhas.append("## Índice\n")
    for rel, _ in arquivos:
        ancora = rel.replace("/", "").replace(".", "").replace("_", "").lower()
        linhas.append(f"- [`{rel}`](#{ancora})")
    linhas.append("\n---\n")

    # Conteúdo
    linhas.append("## Arquivos\n")
    for rel, abs_path in arquivos:
        lang = extensao_linguagem(rel)
        conteudo = ler_arquivo(abs_path)
        linhas.append(f"### `{rel}`\n")
        linhas.append(f"```{lang}")
        linhas.append(conteudo.rstrip())
        linhas.append("```\n")

    saida_final = "\n".join(linhas)
    saida_path = os.path.join(raiz, SAIDA)

    with open(saida_path, "w", encoding="utf-8") as f:
        f.write(saida_final)

    print(f"\n✓ Snapshot gerado: {saida_path}")
    print(f"  Arquivos capturados: {len(arquivos)}")


# ── Entry point ──────────────────────────────────────────────────

if __name__ == "__main__":
    raiz = os.getcwd()
    gerar_snapshot(raiz)

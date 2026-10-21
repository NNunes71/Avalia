from __future__ import annotations

import argparse
import json
import re
import shutil
import unicodedata
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit


ROOT = Path(__file__).resolve().parent
PROJECTS = ROOT / "projetos"
MAX_JSON_BYTES = 25 * 1024 * 1024
MAX_FILE_BYTES = 100 * 1024 * 1024


def _safe_folder_name(name: str) -> str:
    ascii_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    folder = re.sub(r"[^A-Za-z0-9_-]+", "-", ascii_name).strip("-_").lower()
    return folder[:64] or "projeto"


def _read_project(folder: Path) -> dict:
    manifest = folder / "project.json"
    if manifest.exists():
        record = json.loads(manifest.read_text(encoding="utf-8"))
        if not isinstance(record, dict):
            raise ValueError(f"Manifesto inválido: {manifest}")
    else:
        record = {"id": folder.name, "name": folder.name, "builtin": False}
    record["id"] = str(record.get("id") or folder.name)
    record["name"] = str(record.get("name") or folder.name)
    record["folder"] = folder.name
    return record


def _project_records() -> list[dict]:
    PROJECTS.mkdir(parents=True, exist_ok=True)
    records = [_read_project(folder) for folder in PROJECTS.iterdir() if folder.is_dir()]
    return sorted(records, key=lambda record: (record["name"].casefold(), record["id"]))


def _find_project(project_id: str) -> Path | None:
    for folder in PROJECTS.iterdir():
        if folder.is_dir() and _read_project(folder)["id"] == project_id:
            return folder
    return None


def _storage_file(folder: Path, project_id: str, key: str) -> Path:
    base_bank_key = f"va_bank_{project_id}"
    if key == base_bank_key or key.startswith(base_bank_key + "_"):
        suffix = key[len(base_bank_key):].strip("_") or "s1"
        safe_suffix = re.sub(r"[^A-Za-z0-9_-]+", "-", suffix).strip("-_")
        if not safe_suffix:
            raise ValueError("Chave de banco inválida.")
        return folder / "bancos" / f"{safe_suffix}.json"

    progress_keys = {
        f"va_{project_id}_saved": "testes-guardados.json",
        f"va_{project_id}_counter": "contador.json",
        f"va_{project_id}_seen": "perguntas-vistas.json",
        f"va_{project_id}_wrong": "perguntas-erradas.json",
    }
    if key in progress_keys:
        return folder / "progresso" / progress_keys[key]
    raise ValueError("A chave não pertence a este projeto.")


class AprovaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _json_response(self, status: int, payload) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self, limit: int) -> bytes:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as exc:
            raise ValueError("Content-Length inválido.") from exc
        if length < 0 or length > limit:
            raise ValueError("O ficheiro enviado excede o limite permitido.")
        return self.rfile.read(length)

    def _read_json_body(self):
        return json.loads(self._read_body(MAX_JSON_BYTES).decode("utf-8"))

    def _route(self):
        parsed = urlsplit(self.path)
        parts = [unquote(part) for part in parsed.path.strip("/").split("/") if part]
        if not parts or parts[0] != "api":
            return False

        try:
            if parts == ["api", "projects"] and self.command == "GET":
                self._json_response(200, _project_records())
                return True

            if parts == ["api", "projects"] and self.command == "PUT":
                self._save_projects(self._read_json_body())
                return True

            if len(parts) == 3 and parts[:2] == ["api", "projects"] and self.command == "DELETE":
                self._delete_project(parts[2])
                return True

            if len(parts) == 4 and parts[:2] == ["api", "projects"] and parts[3] == "storage":
                self._project_storage(parts[2], parsed.query)
                return True

            if len(parts) == 5 and parts[:2] == ["api", "projects"] and parts[3] == "files":
                self._project_file(parts[2], parts[4])
                return True

            self._json_response(404, {"error": "Endpoint da API não encontrado."})
            return True
        except (ValueError, json.JSONDecodeError) as exc:
            self._json_response(400, {"error": str(exc)})
            return True
        except OSError as exc:
            self._json_response(500, {"error": f"Erro de ficheiros: {exc}"})
            return True

    def _save_projects(self, records) -> None:
        if not isinstance(records, list):
            raise ValueError("A lista de projetos é inválida.")
        PROJECTS.mkdir(parents=True, exist_ok=True)

        for record in records:
            if not isinstance(record, dict) or not record.get("id") or not record.get("name"):
                raise ValueError("Cada projeto precisa de um identificador e nome.")
            project_id = str(record["id"])
            current = _find_project(project_id)
            requested_folder = record.get("folder")

            if current is None and requested_folder:
                requested_folder = str(requested_folder)
                if Path(requested_folder).name != requested_folder:
                    continue
                candidate = PROJECTS / requested_folder
                if candidate.is_dir():
                    current = candidate
                else:
                    continue

            if current is None:
                folder_name = _safe_folder_name(str(record["name"]))
                candidate = PROJECTS / folder_name
                index = 2
                while candidate.exists():
                    candidate = PROJECTS / f"{folder_name}-{index}"
                    index += 1
                candidate.mkdir()
                current = candidate
            else:
                desired_name = _safe_folder_name(str(record["name"]))
                if current.name.casefold() != desired_name.casefold():
                    candidate = PROJECTS / desired_name
                    index = 2
                    while candidate.exists() and candidate != current:
                        candidate = PROJECTS / f"{desired_name}-{index}"
                        index += 1
                    if candidate != current:
                        current.rename(candidate)
                        current = candidate

            saved = dict(record)
            saved["id"] = project_id
            saved["name"] = str(record["name"])
            saved["folder"] = current.name
            self._atomic_write(
                current / "project.json",
                json.dumps(saved, ensure_ascii=False, indent=2).encode("utf-8"),
            )

        self._json_response(200, _project_records())

    def _atomic_write(self, destination: Path, content: bytes) -> None:
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = destination.with_name(destination.name + ".tmp")
        temporary.write_bytes(content)
        temporary.replace(destination)

    def _delete_project(self, project_id: str) -> None:
        folder = _find_project(project_id)
        if folder is None:
            self._json_response(404, {"error": "A pasta do projeto não existe."})
            return
        if folder.parent.resolve() != PROJECTS.resolve():
            raise ValueError("O caminho do projeto é inválido.")
        shutil.rmtree(folder)
        self._json_response(200, {"deleted": project_id})

    def _project_storage(self, project_id: str, query: str) -> None:
        folder = _find_project(project_id)
        if folder is None:
            self._json_response(404, {"error": "Projeto não encontrado."})
            return
        params = parse_qs(query)
        if self.command == "GET":
            key = (params.get("key") or [""])[0]
            target = _storage_file(folder, project_id, key)
            value = target.read_text(encoding="utf-8") if target.is_file() else None
            self._json_response(200, {"value": value})
            return
        if self.command == "PUT":
            payload = self._read_json_body()
            if not isinstance(payload, dict) or not isinstance(payload.get("key"), str) or not isinstance(payload.get("value"), str):
                raise ValueError("Os dados do projeto são inválidos.")
            target = _storage_file(folder, project_id, payload["key"])
            self._atomic_write(target, payload["value"].encode("utf-8"))
            self._json_response(200, {"saved": True})
            return
        if self.command == "DELETE":
            key = (params.get("key") or [""])[0]
            target = _storage_file(folder, project_id, key)
            if target.is_file():
                target.unlink()
            self._json_response(200, {"deleted": True})
            return
        self._json_response(405, {"error": "Método não permitido."})

    def _project_file(self, project_id: str, kind: str) -> None:
        if kind not in {"book", "exam"}:
            self._json_response(400, {"error": "Tipo de ficheiro inválido."})
            return
        folder = _find_project(project_id)
        if folder is None:
            self._json_response(404, {"error": "Projeto não encontrado."})
            return
        target = folder / "ficheiros" / f"{kind}.pdf"
        if self.command == "GET":
            if not target.is_file():
                self._json_response(404, {"error": "O ficheiro não existe."})
                return
            content = target.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(content)
            return
        if self.command == "PUT":
            content = self._read_body(MAX_FILE_BYTES)
            self._atomic_write(target, content)
            self._json_response(200, {"saved": True})
            return
        if self.command == "DELETE":
            if target.is_file():
                target.unlink()
            self._json_response(200, {"deleted": True})
            return
        self._json_response(405, {"error": "Método não permitido."})

    def do_GET(self):
        if not self._route():
            super().do_GET()

    def do_PUT(self):
        self._route()

    def do_DELETE(self):
        self._route()

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Servidor local da aplicação Aprova!")
    parser.add_argument("--port", type=int, default=8731)
    args = parser.parse_args()
    PROJECTS.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), AprovaHandler)
    url = f"http://localhost:{args.port}/app/Testes_Treino_Visual_Analysis.html"
    print(f"Aprova! disponível em {url}")
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

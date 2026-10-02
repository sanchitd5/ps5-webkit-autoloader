#!/usr/bin/env python3
"""Minimal HTTP server for the PS5 WebKit Autoloader exploit delivery.

The PS5 browser requests the User's Guide at a path like
/document/en/ps5/index.html, and the autoloader frontend itself
hardcodes /app/... for its asset/cache structure. Both need to be
rewritten back onto the flat frontend/autoloader/ directory this
server actually has on disk — the same mapping host.py's
DualDirHandler does for the standalone PC host build.
"""
import http.server
import os
import posixpath
import socketserver
import time
import urllib.parse

PORT = 8080
BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "www", "autoloader")


class RewritingHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, fmt, *args):
        print("[HTTP] " + (fmt % args))

    def _relative_path(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]

        if path.startswith("/document/") and "/ps5/" in path:
            path = "/" + path.split("/ps5/", 1)[1]

        if path.startswith("/app/"):
            path = path[4:]

        try:
            path = urllib.parse.unquote(path, errors="surrogatepass")
        except UnicodeDecodeError:
            path = urllib.parse.unquote(path)
        path = posixpath.normpath(path)
        words = [
            word for word in path.split("/")
            if word and not (os.path.dirname(word) or word in (os.curdir, os.pardir))
        ]
        return "/".join(words)

    def send_head(self):
        raw_path = self.path.split("?", 1)[0].split("#", 1)[0]
        rel = self._relative_path()

        if rel.endswith("selected_exploit") or rel == "selected_exploit":
            body = b"relapse\n"
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            import io
            return io.BytesIO(body)

        candidates = [rel]
        if not rel or rel.endswith("/"):
            candidates = [rel + name for name in ("index.html", "index.htm")]

        for candidate in candidates:
            full = os.path.join(BASE_DIR, candidate)
            if os.path.isfile(full):
                self.path = "/" + candidate
                return super().send_head()

        self.send_error(404, "File not found")
        print(f"[HTTP] {self.command} {raw_path} -> Not Found")
        return None


if __name__ == "__main__":
    with socketserver.ThreadingTCPServer(("0.0.0.0", PORT), RewritingHandler) as httpd:
        print(f"[+] Serving {BASE_DIR} on 0.0.0.0:{PORT}")
        httpd.serve_forever()

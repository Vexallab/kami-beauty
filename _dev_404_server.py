"""Temporary local dev server that mimics how GitHub Pages / Netlify / Cloudflare
Pages serve a custom 404.html — any missing path gets 404.html back with a real
404 status, instead of Python's plain-text default error page. Not part of the
site; safe to delete after testing (see cleanup note printed on exit)."""

import http.server
import os

PORT = 8845
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open("404.html", "rb") as f:
                self.wfile.write(f.read())
            return
        return super().send_error(code, message, explain)


if __name__ == "__main__":
    print(f"Serving on http://localhost:{PORT}  (Ctrl+C to stop)")
    http.server.HTTPServer(("localhost", PORT), Handler).serve_forever()

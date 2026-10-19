"""Bygger tre varianter av appen från src/app.html + calc.js:
  preview.html      – förhandsvisning (utan html/head-skal)
  index.html        – webbversionen för GitHub Pages
  app/www/          – Android-appen (Capacitor), helt offline med lokala typsnitt
Kör: python3 build.py
"""
import json
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).parent
version = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
src = (ROOT / "src/app.html").read_text(encoding="utf-8")
calc = (ROOT / "calc.js").read_text(encoding="utf-8")
body = src.replace("/*CALC*/", calc).replace("/*VERSION*/", version)


def wrap(body, extra_head):
    head_end = body.index("</style>") + len("</style>")
    return ('<!doctype html>\n<html lang="sv">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<meta name="theme-color" content="#e0661b">\n' + extra_head
            + body[:head_end] + '\n</head>\n<body>\n' + body[head_end:] + '\n</body>\n</html>\n')


# 1) Förhandsvisning
(ROOT / "preview.html").write_text(body, encoding="utf-8")

# 2) Webbversion
(ROOT / "index.html").write_text(wrap(body, (
    '<link rel="manifest" href="manifest.webmanifest">\n'
    '<link rel="icon" href="icon.svg" type="image/svg+xml">\n'
    '<link rel="apple-touch-icon" href="icon.svg">\n')), encoding="utf-8")

# 3) Android-app: byt Google Fonts mot lokala filer
www = ROOT / "app/www"
if www.exists():
    shutil.rmtree(www)
(www / "fonts").mkdir(parents=True)
fonts = {
    "familjen-grotesk": ("Familjen Grotesk", [500, 700]),
    "instrument-sans": ("Instrument Sans", [400, 500, 600]),
}
face_css = []
for pkg, (family, weights) in fonts.items():
    for w in weights:
        name = f"{pkg}-latin-{w}-normal.woff2"
        shutil.copy(ROOT / f"node_modules/@fontsource/{pkg}/files/{name}", www / "fonts" / name)
        face_css.append(f'@font-face{{font-family:"{family}";font-style:normal;font-weight:{w};'
                        f'font-display:swap;src:url(fonts/{name}) format("woff2")}}')
app_body = re.sub(r'<link rel="preconnect"[^>]*>\n', "", body)
app_body = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>\n',
                  "<style>" + "".join(face_css) + "</style>\n", app_body)
assert "fonts.googleapis" not in app_body and "fonts.gstatic" not in app_body
(www / "index.html").write_text(wrap(app_body, ""), encoding="utf-8")
print(f"Byggt version {version}: preview.html, index.html, app/www/")

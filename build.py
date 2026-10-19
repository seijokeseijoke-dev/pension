import pathlib
src = pathlib.Path("src/app.html").read_text(encoding="utf-8")
calc = pathlib.Path("calc.js").read_text(encoding="utf-8")
body = src.replace("/*CALC*/", calc)
pathlib.Path("preview.html").write_text(body, encoding="utf-8")
head_end = body.index("</style>") + len("</style>")
full = ('<!doctype html>\n<html lang="sv">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="theme-color" content="#e0661b">\n<link rel="manifest" href="manifest.webmanifest">\n'
        '<link rel="icon" href="icon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="icon.svg">\n'
        + body[:head_end] + '\n</head>\n<body>\n' + body[head_end:] + '\n</body>\n</html>\n')
pathlib.Path("index.html").write_text(full, encoding="utf-8")

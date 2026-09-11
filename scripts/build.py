#!/usr/bin/env python3
"""Assemble pages from src/layout.html + src/pages/*.html."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
INCLUDE_RE = re.compile(r"\{\{include:([\w-]+)\}\}")

PAGES = [
    {
        "src": "home.html",
        "out": "index.html",
        "title": "Диана Чикан – Продуктовый дизайнер",
        "root": "",
        "home": "index.html",
        "footer": False,
    },
    {
        "src": "yasmy.html",
        "out": "yasmy/index.html",
        "title": "От хранения рецептов к продукту, принимающему решения",
        "root": "../",
        "home": "../index.html",
        "footer": True,
    },
    {
        "src": "product-restart.html",
        "out": "product-restart/index.html",
        "title": "Перезапуск B2B-продукта и смена стратегии",
        "root": "../",
        "home": "../index.html",
        "footer": True,
    },
    {
        "src": "gantt.html",
        "out": "gantt/index.html",
        "title": "От ручного планирования к системе управления процессами",
        "root": "../",
        "home": "../index.html",
        "footer": True,
    },
    {
        "src": "startech.html",
        "out": "startech/index.html",
        "title": "Анкета стартапа как инструмент внешней коммуникации",
        "root": "../",
        "home": "../index.html",
        "footer": True,
    },
    {
        "src": "design-system.html",
        "out": "design-system/index.html",
        "title": "Дизайн-система для B2B-продукта",
        "root": "../",
        "home": "../index.html",
        "footer": True,
    },
]


def expand_includes(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        path = SRC / "partials" / f"{match.group(1)}.html"
        if not path.exists():
            raise FileNotFoundError(f"Missing partial: {path.name}")
        return path.read_text().rstrip()

    return INCLUDE_RE.sub(repl, text)


def render(page: dict) -> str:
    html = (SRC / "layout.html").read_text()
    body = expand_includes((SRC / "pages" / page["src"]).read_text()).rstrip() + "\n"
    footer = (SRC / "footer.html").read_text() if page["footer"] else ""
    return (
        html.replace("{{title}}", page["title"])
        .replace("{{root}}", page["root"])
        .replace("{{home}}", page["home"])
        .replace("{{footer}}", footer.replace("{{root}}", page["root"]))
        .replace("{{body}}", body)
    )


def main() -> None:
    for page in PAGES:
        dest = ROOT / page["out"]
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(render(page))
        print("wrote", page["out"])


if __name__ == "__main__":
    main()

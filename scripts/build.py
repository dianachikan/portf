#!/usr/bin/env python3
"""Assemble pages from src/layout.html + src/pages/*.html."""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).parent))
from typograf import typograf_html
from components import render_components
from localize import translate

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
        "title": "Ясми: от хранения рецептов к готовому меню",
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
        "title": "Как планируют обходы оборудования в ServiceVizor",
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


def render(page: dict, typography: bool = True) -> str:
    if page["src"] == "home.html":
        html = render_components(expand_includes((SRC / "pages" / "home.html").read_text()))
        rendered = html.replace("{{root}}", page["root"]).replace("{{home}}", page["home"])
        return typograf_html(rendered) if typography else rendered
    html = render_components(expand_includes((SRC / "layout.html").read_text()))
    body = render_components(expand_includes((SRC / "pages" / page["src"]).read_text())).rstrip() + "\n"
    footer = (SRC / "footer.html").read_text() if page["footer"] else ""
    rendered = (
        html.replace("{{title}}", page["title"])
        .replace("{{root}}", page["root"])
        .replace("{{home}}", page["home"])
        .replace("{{footer}}", footer.replace("{{root}}", page["root"]))
        .replace("{{body}}", body)
    )
    return typograf_html(rendered) if typography else rendered


def main() -> None:
    for page in PAGES:
        dest = ROOT / page["out"]
        dest.parent.mkdir(parents=True, exist_ok=True)
        rendered = render(page)
        dest.write_text(rendered)
        print("wrote", page["out"])
        if page["src"] == "home.html":
            continue
        english_source = render(page, typography=False).replace(
            'content="Портфолио продуктового дизайнера"',
            'content="Product design portfolio by Diana Chikan"',
        )
        english = translate(english_source, Path(page["src"]).stem)
        english = english.replace('<html lang="ru">', '<html lang="en">')
        english = english.replace('="../assets/', '="../../assets/')
        english = english.replace('href="../index.html', 'href="../../index.html?lang=en')
        english = english.replace('href="https://t.me/vot_dumay"', 'href="https://www.linkedin.com/in/diana-chikan-0b086a3b4"')
        english = english.replace('aria-label="Telegram channel"', 'aria-label="LinkedIn"')
        english = english.replace('<span data-en="linkedin">channel</span>', '<span data-en="linkedin">linkedin</span>')
        english = english.replace('src="../../assets/redesign/channel.svg"', 'src="../../assets/redesign/linkedin.svg"')
        en_dest = ROOT / "en" / page["out"]
        en_dest.parent.mkdir(parents=True, exist_ok=True)
        en_dest.write_text(english)
        print("wrote", en_dest.relative_to(ROOT))


if __name__ == "__main__":
    main()

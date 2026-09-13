"""Russian hanging-preposition typograf for HTML text nodes."""

from __future__ import annotations

import re

NB = "\u00a0"
TAG_RE = re.compile(r"(<[^>]+>)")

# Longer first so «из-за» wins over «из».
AFTER = (
    "из-за",
    "без",
    "для",
    "над",
    "под",
    "при",
    "про",
    "через",
    "или",
    "во",
    "со",
    "ко",
    "об",
    "от",
    "из",
    "за",
    "по",
    "до",
    "на",
    "не",
    "ни",
    "но",
    "и",
    "а",
    "в",
    "к",
    "о",
    "с",
    "у",
)

AFTER_RE = re.compile(
    r"(?<![0-9A-Za-zА-Яа-яЁё])(" + "|".join(re.escape(w) for w in AFTER) + r")[ \t]+",
    re.IGNORECASE,
)
PARTICLE_RE = re.compile(r"(?<=[0-9A-Za-zА-Яа-яЁё]) (же|бы|ли)(?![0-9A-Za-zА-Яа-яЁё])", re.IGNORECASE)
NUMBER_RE = re.compile(r"(?<=\d) (?=[A-Za-zА-Яа-яЁё%])")


def _fix_text(text: str) -> str:
    text = text.replace(NB, " ").replace("&nbsp;", " ")
    text = AFTER_RE.sub(lambda m: m.group(1) + NB, text)
    text = PARTICLE_RE.sub(NB + r"\1", text)
    text = NUMBER_RE.sub(NB, text)
    return text.replace(NB, "&nbsp;")


def typograf_html(html: str) -> str:
    parts = TAG_RE.split(html)
    return "".join(part if part.startswith("<") else _fix_text(part) for part in parts)

"""Build English case pages from the same HTML as the Russian originals."""

import re
import hashlib
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CYRILLIC = re.compile(r"[А-Яа-яЁё]")
TRANSLATABLE_ATTRS = {"alt", "aria-label", "label", "title"}


class Localizer(HTMLParser):
    def __init__(self, translations=None):
        super().__init__(convert_charrefs=False)
        self.translations = translations
        self.found = []
        self.output = []

    def _translate(self, value):
        if not CYRILLIC.search(value):
            return value
        leading = value[: len(value) - len(value.lstrip())]
        trailing = value[len(value.rstrip()):]
        original = value.strip()
        self.found.append(original)
        if self.translations is None:
            return value
        index = len(self.found) - 1
        if index >= len(self.translations) or not self.translations[index]:
            raise ValueError(f"Missing English translation {index}: {original}")
        return leading + self.translations[index] + trailing

    def handle_starttag(self, tag, attrs):
        source = self.get_starttag_text()
        for name, value in attrs:
            if name in TRANSLATABLE_ATTRS and value and CYRILLIC.search(value):
                translated = self._translate(value)
                pattern = re.compile(r'(?<![\w-])' + re.escape(name) + r'=("|\x27)(.*?)\1', re.DOTALL)
                source = pattern.sub(lambda m: name + '=' + m.group(1) + translated + m.group(1), source, count=1)
        self.output.append(source)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        self.output.append(f"</{tag}>")

    def handle_data(self, data):
        self.output.append(self._translate(data))

    def handle_entityref(self, name):
        self.output.append(f"&{name};")

    def handle_charref(self, name):
        self.output.append(f"&#{name};")

    def handle_comment(self, data):
        self.output.append(f"<!--{data}-->")

    def handle_decl(self, decl):
        self.output.append(f"<!{decl}>")


def translate(html, page_name):
    path = ROOT / "src" / "i18n" / "en" / f"{page_name}.txt"
    translations = path.read_text().splitlines() if path.exists() else None
    parser = Localizer(translations)
    parser.feed(html)
    if translations is None:
        raise ValueError(f"Missing English translation: {path}")
    if len(translations) != len(parser.found):
        raise ValueError(f"English translation count for {page_name}: {len(translations)} != {len(parser.found)}")
    fingerprint = hashlib.sha256("\n".join(parser.found).encode()).hexdigest()
    expected = path.with_suffix(".sha256").read_text().strip()
    if fingerprint != expected:
        raise ValueError(f"Russian copy changed in {page_name}; review its English translation")
    result = "".join(parser.output)
    if CYRILLIC.search(result):
        raise ValueError(f"Russian copy remains in English {page_name}")
    return result

"""Render reusable case blocks into semantic HTML during the site build."""

from __future__ import annotations

import html
import re
from html.parser import HTMLParser
from pathlib import Path
from string import Template

COMPONENTS = Path(__file__).resolve().parents[1] / "src" / "components"
COMPONENT_RE = re.compile(
    r"<case-(text|callout|media)\b([^>]*)>(.*?)</case-\1>", re.DOTALL
)


class _Attributes(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.values: dict[str, str] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.values = {key: value or "" for key, value in attrs}


def _attributes(source: str) -> dict[str, str]:
    parser = _Attributes()
    parser.feed(f"<component {source}>")
    return parser.values


def _required(attrs: dict[str, str], name: str, component: str) -> str:
    value = attrs.get(name, "").strip()
    if not value:
        raise ValueError(f"case-{component} requires {name}")
    return value


def render_components(source: str) -> str:
    """Expand case component tags; their contents remain ordinary page HTML."""

    def replace(match: re.Match[str]) -> str:
        kind, raw_attrs, raw_body = match.groups()
        attrs = _attributes(raw_attrs)
        body = render_components(raw_body).strip()
        template = Template((COMPONENTS / f"case-{kind}.html").read_text())

        if kind == "text":
            component_id = _required(attrs, "id", kind)
            title = _required(attrs, "title", kind)
            if not re.fullmatch(r"[\w-]+", component_id):
                raise ValueError(f"Invalid case-text id: {component_id}")
            return template.substitute(
                id=html.escape(component_id, quote=True),
                title=html.escape(title),
                body=body,
            )

        if kind == "callout":
            label = _required(attrs, "label", kind)
            variant = attrs.get("variant", "")
            if variant not in ("", "closing"):
                raise ValueError(f"Unknown case-callout variant: {variant}")
            return template.substitute(
                variant_class=" case-highlight--closing" if variant else "",
                aria_label=html.escape(attrs.get("aria-label", label), quote=True),
                label=html.escape(label),
                body=body,
            )

        src = _required(attrs, "src", kind)
        alt = _required(attrs, "alt", kind)
        width = _required(attrs, "width", kind)
        height = _required(attrs, "height", kind)
        if not width.isdecimal() or not height.isdecimal():
            raise ValueError("case-media width and height must be pixel dimensions")
        variant = attrs.get("variant", "inline")
        if variant not in ("inline", "cover"):
            raise ValueError(f"Unknown case-media variant: {variant}")
        return template.substitute(
            class_name="case-cover" if variant == "cover" else "case-media",
            src=html.escape(src, quote=True),
            alt=html.escape(alt, quote=True),
            width=width,
            height=height,
            fetch_priority=' fetchpriority="high"' if variant == "cover" else ' loading="lazy"',
            caption_html=f"  <figcaption>{body}</figcaption>\n" if body else "",
        )

    rendered = COMPONENT_RE.sub(replace, source)
    if "<case-" in rendered:
        raise ValueError("Unclosed or unsupported case component")
    return rendered

#!/usr/bin/env python3
"""Shared helpers for the CA list engine."""
from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
UA = "Mozilla/5.0 (compatible; CreativeAlternatives-Research/1.0)"
STOP = {
    "the", "and", "for", "with", "from", "that", "this", "your", "our",
    "are", "was", "were", "have", "has", "will", "can", "not", "you",
    "all", "any", "but", "out", "how", "what", "when", "who", "why",
    "into", "more", "than", "then", "them", "they", "their", "about",
    "home", "page", "click", "here", "read", "learn", "menu", "skip",
    "open", "close", "search", "content", "main", "toggle", "mobile",
    "desktop", "header", "footer", "nav", "true", "false", "type",
    "https", "http", "www", "com", "org", "html", "css", "font",
    "display", "swap", "url", "static", "wixstatic", "ufonts", "woff",
    "format", "src", "class", "div", "span", "site", "color", "palette",
    "unit", "value", "enabled", "layout", "href", "button", "social",
}


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n")


def norm_domain(raw: str) -> str:
    s = (raw or "").strip().lower()
    s = s.replace("https://", "").replace("http://", "").split("/")[0]
    if s.startswith("www."):
        s = s[4:]
    return s


def load_suppress() -> dict:
    data = load_json(ROOT / "suppress.json")
    return {
        "domains": {norm_domain(d) for d in data.get("domains", [])},
        "names": [n.lower() for n in data.get("name_contains", [])],
    }


def is_suppressed(name: str, domain: str, suppress: dict) -> str:
    d = norm_domain(domain)
    n = (name or "").lower()
    if d and d in suppress["domains"]:
        return f"domain:{d}"
    for frag in suppress["names"]:
        if frag and frag in n:
            return f"name:{frag}"
    return ""


def strip_html(html: str) -> str:
    for tag in ("script", "style", "nav", "footer", "svg", "head", "noscript"):
        html = re.sub(rf"<{tag}[\s\S]*?</{tag}>", " ", html, flags=re.I)
    # Drop leftover CSS / JSON blobs school CMS pages leak into the body.
    html = re.sub(r"\{[^{}]{0,400}\}", " ", html)
    html = re.sub(r"url\([^)]+\)", " ", html)
    html = re.sub(r"<[^>]+>", " ", html)
    html = (html.replace("&nbsp;", " ").replace("&amp;", "&")
                .replace("&#39;", "'").replace("&quot;", '"'))
    return re.sub(r"\s+", " ", html).strip()


def ngrams(text: str, n: int) -> list[str]:
    words = [w for w in re.findall(r"[a-z0-9']+", text.lower()) if w not in STOP and len(w) > 2]
    out = []
    for i in range(len(words) - n + 1):
        gram = " ".join(words[i:i + n])
        out.append(gram)
    return out


def top_ngrams(text: str, n: int, k: int = 12) -> list[tuple[str, int]]:
    counts: dict[str, int] = {}
    for g in ngrams(text, n):
        counts[g] = counts.get(g, 0) + 1
    return sorted(counts.items(), key=lambda x: (-x[1], x[0]))[:k]


def fetch(domain: str, timeout: int = 12) -> tuple[str, str]:
    """Return (status, text). status is live|fail."""
    import urllib.error
    import urllib.request

    d = norm_domain(domain)
    if not d:
        return "fail", ""
    last_err = ""
    for url in (f"https://{d}", f"https://www.{d}", f"http://{d}"):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read(120_000)
                text = raw.decode("utf-8", errors="ignore")
                return "live", strip_html(text)[:8000]
        except Exception as e:
            last_err = str(e)
            continue
    return "fail", last_err

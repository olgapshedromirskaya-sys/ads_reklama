import inspect
import re
from collections import defaultdict
from collections import namedtuple

import pymorphy2

TOKEN_RE = re.compile(r"[a-zA-Zа-яА-ЯёЁ0-9]+")


if not hasattr(inspect, "getargspec"):
    ArgSpec = namedtuple("ArgSpec", "args varargs keywords defaults")

    def getargspec(func):
        full = inspect.getfullargspec(func)
        return ArgSpec(full.args, full.varargs, full.varkw, full.defaults)

    inspect.getargspec = getargspec  # type: ignore[attr-defined]

_STOP_WORDS = {
    "и",
    "в",
    "во",
    "на",
    "по",
    "для",
    "с",
    "со",
    "из",
    "за",
    "у",
    "от",
    "до",
    "под",
}

_morph = pymorphy2.MorphAnalyzer()


def _to_root(token: str) -> str | None:
    if len(token) < 3:
        return None
    lowered = token.lower()
    if lowered in _STOP_WORDS:
        return None

    parsed = _morph.parse(lowered)
    if not parsed:
        return None
    normal = parsed[0].normal_form

    # Lightweight root approximation for minus-words generation.
    if len(normal) >= 8:
        return normal[:-3]
    if len(normal) >= 6:
        return normal[:-2]
    if len(normal) >= 4:
        return normal[:-1]
    return normal


def extract_roots(text: str) -> set[str]:
    roots: set[str] = set()
    for raw in TOKEN_RE.findall(text):
        root = _to_root(raw)
        if root:
            roots.add(root)
    return roots


def generate_minus_words(queries: list[str]) -> dict[str, list[str]]:
    root_to_queries: dict[str, set[str]] = defaultdict(set)
    for query in queries:
        for root in extract_roots(query):
            root_to_queries[root].add(query)
    return {root: sorted(list(source_queries)) for root, source_queries in root_to_queries.items()}

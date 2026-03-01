import inspect
import re
from collections import defaultdict
from collections import namedtuple
from collections.abc import Sequence
from datetime import UTC, datetime
from difflib import SequenceMatcher

import pymorphy3 as pymorphy2
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entities import MinusWord, QueryLabel, QueryLabelStatus, SearchQuery

TOKEN_RE = re.compile(r"[a-zA-Zа-яА-ЯёЁ0-9]+(?:[/-][a-zA-Zа-яА-ЯёЁ0-9]+)*")


if not hasattr(inspect, "getargspec"):
    ArgSpec = namedtuple("ArgSpec", "args varargs keywords defaults")

    def getargspec(func):
        full = inspect.getfullargspec(func)
        return ArgSpec(full.args, full.varargs, full.varkw, full.defaults)

    inspect.getargspec = getargspec  # type: ignore[attr-defined]

_STOP_WORDS = {
    "и",
    "а",
    "но",
    "или",
    "либо",
    "да",
    "то",
    "же",
    "что",
    "чтобы",
    "как",
    "когда",
    "если",
    "кто",
    "где",
    "куда",
    "откуда",
    "чем",
    "при",
    "без",
    "над",
    "о",
    "об",
    "обо",
    "про",
    "не",
    "ни",
    "ли",
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

_SKIPPED_PARTS_OF_SPEECH = {"PREP", "CONJ", "PRCL", "INTJ"}
_morph = pymorphy2.MorphAnalyzer()


def classify_query_relevancy(ctr: float, impressions: int, orders: int, spend: float) -> QueryLabelStatus:
    """
    Automatic query classification:
    - relevant: CTR > 1.5% and orders > 0
    - not_relevant: CTR < 0.3% or (impressions > 1000 and orders == 0 and spend > 500)
    - pending: otherwise
    """
    if ctr > 1.5 and orders > 0:
        return QueryLabelStatus.RELEVANT
    if ctr < 0.3 or (impressions > 1000 and orders == 0 and spend > 500):
        return QueryLabelStatus.NOT_RELEVANT
    return QueryLabelStatus.PENDING


def _common_prefix_len(left: str, right: str) -> int:
    limit = min(len(left), len(right))
    idx = 0
    while idx < limit and left[idx] == right[idx]:
        idx += 1
    return idx


def _script_bucket(token: str) -> str:
    sanitized = token.replace("/", "").replace("-", "")
    if re.fullmatch(r"[а-яё]+", sanitized):
        return "cyrillic"
    if re.fullmatch(r"[a-z]+", sanitized):
        return "latin"
    return "mixed"


def _is_similar_word(left: str, right: str) -> bool:
    if left == right:
        return True
    if _script_bucket(left) != _script_bucket(right):
        return False
    prefix_len = _common_prefix_len(left, right)
    if prefix_len >= 4:
        return True
    ratio = SequenceMatcher(None, left, right).ratio()
    return prefix_len >= 3 and ratio >= 0.84


def _group_similar_words(words: Sequence[str]) -> list[list[str]]:
    groups: list[list[str]] = []
    for word in sorted(set(words), key=lambda item: (-len(item), item)):
        target_group: list[str] | None = None
        for group in groups:
            if any(_is_similar_word(word, existing) for existing in group):
                target_group = group
                break
        if target_group is None:
            groups.append([word])
            continue
        target_group.append(word)
    return groups


def _normalize_token(token: str) -> str | None:
    lowered = token.lower().strip()
    if not lowered:
        return None
    if lowered in {"б/у", "бу"}:
        return "б/у"
    if lowered.isdigit():
        return None
    if len(lowered) < 2:
        return None
    if lowered in _STOP_WORDS:
        return None

    parsed = _morph.parse(lowered)
    if not parsed:
        return lowered
    first = parsed[0]
    if first.tag.POS in _SKIPPED_PARTS_OF_SPEECH:
        return None
    normal = first.normal_form
    if normal in _STOP_WORDS:
        return None
    if len(normal) < 2:
        return None
    return normal


def extract_normalized_words(text: str) -> set[str]:
    normalized_words: set[str] = set()
    for raw in TOKEN_RE.findall(text):
        normalized = _normalize_token(raw)
        if normalized:
            normalized_words.add(normalized)
    return normalized_words


def generate_minus_words(queries: list[str]) -> dict[str, list[str]]:
    word_to_queries: dict[str, set[str]] = defaultdict(set)
    for query in queries:
        for word in extract_normalized_words(query):
            word_to_queries[word].add(query)

    grouped = _group_similar_words(list(word_to_queries.keys()))
    root_to_queries: dict[str, set[str]] = {}
    for group in grouped:
        # Prefer the most frequent and compact form as representative.
        representative = sorted(group, key=lambda item: (-len(word_to_queries[item]), len(item), item))[0]
        merged_queries: set[str] = set()
        for word in group:
            merged_queries.update(word_to_queries[word])
        root_to_queries[representative] = merged_queries

    return {
        root: sorted(source_queries)
        for root, source_queries in sorted(root_to_queries.items(), key=lambda item: item[0])
    }


def upsert_minus_words(db: Session, campaign_id: int, source_queries: Sequence[str]) -> list[str]:
    if not source_queries:
        return []
    roots_map = generate_minus_words(list(source_queries))
    for root, query_list in roots_map.items():
        minus_word = db.execute(
            select(MinusWord).where(MinusWord.campaign_id == campaign_id, MinusWord.word_root == root)
        ).scalar_one_or_none()
        if minus_word is None:
            db.add(MinusWord(campaign_id=campaign_id, word_root=root, source_queries=query_list))
            continue
        existing_queries = set(minus_word.source_queries if isinstance(minus_word.source_queries, list) else [])
        minus_word.source_queries = sorted(existing_queries.union(query_list))
    db.commit()
    return sorted(roots_map.keys())


def auto_classify_campaign_queries(db: Session, campaign_id: int) -> dict[str, int]:
    rows = db.execute(
        select(
            SearchQuery.query,
            func.coalesce(func.sum(SearchQuery.impressions), 0),
            func.coalesce(func.sum(SearchQuery.clicks), 0),
            func.coalesce(func.sum(SearchQuery.spend), 0),
            func.coalesce(func.sum(SearchQuery.orders), 0),
        )
        .where(SearchQuery.campaign_id == campaign_id)
        .group_by(SearchQuery.query)
    ).all()

    updated = 0
    relevant = 0
    not_relevant = 0
    pending = 0
    labeled_at = datetime.now(UTC)
    for query_text, impressions, clicks, spend, orders in rows:
        impressions_int = int(impressions or 0)
        clicks_int = int(clicks or 0)
        orders_int = int(orders or 0)
        spend_float = float(spend or 0)
        ctr = (clicks_int * 100 / impressions_int) if impressions_int > 0 else 0.0
        label_value = classify_query_relevancy(
            ctr=ctr,
            impressions=impressions_int,
            orders=orders_int,
            spend=spend_float,
        )

        query_label = db.execute(
            select(QueryLabel).where(QueryLabel.campaign_id == campaign_id, QueryLabel.query == str(query_text))
        ).scalar_one_or_none()
        if query_label is None:
            query_label = QueryLabel(campaign_id=campaign_id, query=str(query_text))
            db.add(query_label)

        query_label.label = label_value
        query_label.labeled_by = None
        query_label.labeled_at = labeled_at
        updated += 1
        if label_value == QueryLabelStatus.RELEVANT:
            relevant += 1
        elif label_value == QueryLabelStatus.NOT_RELEVANT:
            not_relevant += 1
        else:
            pending += 1

    db.commit()
    return {
        "updated": updated,
        "relevant": relevant,
        "not_relevant": not_relevant,
        "pending": pending,
    }


def regenerate_minus_words_for_campaign(db: Session, campaign_id: int) -> list[str]:
    not_relevant_queries = [
        query
        for query in db.execute(
            select(QueryLabel.query).where(
                QueryLabel.campaign_id == campaign_id,
                QueryLabel.label == QueryLabelStatus.NOT_RELEVANT,
            )
        ).scalars().all()
        if query
    ]
    return upsert_minus_words(db, campaign_id, not_relevant_queries)


def estimate_not_relevant_daily_spend(db: Session, campaign_id: int) -> float:
    latest_date = db.execute(
        select(func.max(SearchQuery.date)).where(SearchQuery.campaign_id == campaign_id)
    ).scalar_one_or_none()
    if latest_date is None:
        return 0.0

    wasted_spend = db.execute(
        select(func.coalesce(func.sum(SearchQuery.spend), 0))
        .join(
            QueryLabel,
            (QueryLabel.campaign_id == SearchQuery.campaign_id) & (QueryLabel.query == SearchQuery.query),
        )
        .where(
            SearchQuery.campaign_id == campaign_id,
            SearchQuery.date == latest_date,
            QueryLabel.label == QueryLabelStatus.NOT_RELEVANT,
        )
    ).scalar_one()
    return float(wasted_spend or 0)

from app.models.entities import QueryLabelStatus, SearchQuery
from app.services.morphology import classify_query_relevancy


def classify_query_default(
    ctr: float,
    impressions: int,
    orders: int,
    spend: float = 0.0,
    clicks: int = 0,
) -> QueryLabelStatus:
    """
    Default auto-label strategy (query cleanup baseline):
    - not_relevant: any hard rule fired
      1) clicks > 30 and orders == 0 and spend > 300
      2) ctr < 0.3 and impressions > 2000
      3) spend > 1000 and orders == 0
    - relevant: orders > 0 and ctr >= 1.0
    - pending: otherwise
    """
    if (clicks > 30 and orders == 0 and spend > 300) or (ctr < 0.3 and impressions > 2000) or (spend > 1000 and orders == 0):
        return QueryLabelStatus.NOT_RELEVANT
    if orders > 0 and ctr >= 1.0:
        return QueryLabelStatus.RELEVANT
    return classify_query_relevancy(ctr=ctr, impressions=impressions, orders=orders, spend=spend)


def classify_row_color(query: SearchQuery) -> str:
    label = classify_query_default(
        ctr=query.ctr,
        impressions=query.impressions,
        orders=query.orders,
        spend=float(query.spend),
        clicks=query.clicks,
    )
    if label == QueryLabelStatus.RELEVANT:
        return "green"
    if label == QueryLabelStatus.NOT_RELEVANT:
        return "red"
    return "yellow"

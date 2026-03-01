from app.models.entities import QueryLabelStatus, SearchQuery
from app.services.morphology import classify_query_relevancy


def classify_query_default(ctr: float, impressions: int, orders: int, spend: float = 0.0) -> QueryLabelStatus:
    """
    Default auto-label strategy (automatic minus-words pipeline):
    - relevant: CTR > 1.5% and orders > 0
    - not_relevant: CTR < 0.3% or (impressions > 1000 and orders == 0 and spend > 500)
    - pending: otherwise
    """
    return classify_query_relevancy(ctr=ctr, impressions=impressions, orders=orders, spend=spend)


def classify_row_color(query: SearchQuery) -> str:
    label = classify_query_default(
        ctr=query.ctr,
        impressions=query.impressions,
        orders=query.orders,
        spend=float(query.spend),
    )
    if label == QueryLabelStatus.RELEVANT:
        return "green"
    if label == QueryLabelStatus.NOT_RELEVANT:
        return "red"
    return "yellow"

from app.models.entities import QueryLabelStatus, SearchQuery


def classify_query_default(ctr: float, impressions: int, orders: int) -> QueryLabelStatus:
    """
    Default auto-label strategy:
    - likely relevant: CTR > 3% or at least one order
    - potentially irrelevant: CTR < 1% and impressions > 300
    - otherwise pending
    """
    if orders > 0 or ctr > 3.0:
        return QueryLabelStatus.RELEVANT
    if ctr < 1.0 and impressions > 300:
        return QueryLabelStatus.NOT_RELEVANT
    return QueryLabelStatus.PENDING


def classify_row_color(query: SearchQuery) -> str:
    if query.ctr > 2.0 and query.orders > 0:
        return "green"
    if 1.0 <= query.ctr <= 2.0:
        return "yellow"
    if query.ctr < 1.0 and query.orders == 0:
        return "red"
    return "yellow"

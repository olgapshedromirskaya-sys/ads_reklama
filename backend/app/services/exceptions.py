class MarketplaceAPIError(Exception):
    """Generic marketplace API error."""


class MarketplaceAuthError(MarketplaceAPIError):
    """Invalid or expired account credentials."""

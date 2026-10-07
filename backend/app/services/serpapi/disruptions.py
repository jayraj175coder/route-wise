from typing import List
from app.models.domain import DisruptionSignal
from app.services.serpapi.client import SerpApiClient

def fetch_live_disruption_signals(origin: str, destination: str, client: SerpApiClient) -> List[DisruptionSignal]:
    """
    Searches Google News and Google Web Search via SerpApi for live route disruptions,
    accidents, road closures, and train/metro delays.
    Normalizes evidence into structured DisruptionSignal domain objects.
    """
    if not client.is_available():
        return []

    signals: List[DisruptionSignal] = []

    # 1. Query Google News for breaking delays & transit disruptions
    news_queries = [
        f"{origin} {destination} highway traffic delay today",
        f"{origin} train disruption delay today",
    ]

    for idx, q in enumerate(news_queries):
        news_data = client.search_google_news(q)
        if not news_data:
            continue

        news_items = news_data.get("news_results", [])[:2]
        for n_idx, item in enumerate(news_items):
            title = item.get("title", f"Traffic delay reported on {origin} corridor")
            source = item.get("source", {}).get("name", "Google News") if isinstance(item.get("source"), dict) else item.get("source", "Google News")
            link = item.get("link", "https://news.google.com")
            date_str = item.get("date", "Today")
            snippet = item.get("snippet", "").lower()

            if any(k in snippet for k in ["accident", "blocked", "closed", "severe delay", "landslide", "flooding"]):
                severity = "high"
                impact = 40.0
            elif any(k in snippet for k in ["traffic jam", "slowdown", "heavy traffic", "congestion", "maintenance"]):
                severity = "medium"
                impact = 20.0
            else:
                severity = "low"
                impact = 10.0

            signals.append(
                DisruptionSignal(
                    id=f"live-news-{idx}-{n_idx}",
                    source=source,
                    title=title,
                    published_time=date_str,
                    url=link,
                    signal_type="news_incident",
                    severity=severity,
                    location=f"{origin} to {destination}",
                    confidence=0.88,
                    impact_minutes=impact
                )
            )

    # 2. Query Google Web Search for road closures and highway status
    web_query = f"{origin} to {destination} road closure maintenance today"
    web_data = client.search_google_web(web_query)
    if web_data:
        organic_results = web_data.get("organic_results", [])[:2]
        for w_idx, org in enumerate(organic_results):
            snippet = org.get("snippet", "").lower()
            if any(k in snippet for k in ["closed", "diversion", "construction", "blocked"]):
                signals.append(
                    DisruptionSignal(
                        id=f"live-web-{w_idx}",
                        source="Google Search Alert",
                        title=org.get("title", f"Road advisory for {origin} - {destination}"),
                        published_time="Recent",
                        url=org.get("link", "https://google.com"),
                        signal_type="road_advisory",
                        severity="medium",
                        location=f"{origin} corridor",
                        confidence=0.80,
                        impact_minutes=15.0
                    )
                )

    return signals

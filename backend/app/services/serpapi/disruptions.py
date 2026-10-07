from typing import List
from app.models.domain import DisruptionSignal
from app.services.serpapi.client import SerpApiClient

def fetch_live_disruption_signals(origin: str, destination: str, client: SerpApiClient) -> List[DisruptionSignal]:
    """
    Searches Google News/Search via SerpApi for live route disruptions, accidents, closures.
    Normalizes evidence into structured DisruptionSignal domain objects.
    """
    if not client.is_available():
        return []

    queries = [
        f"{origin} {destination} highway traffic disruption today",
        f"{origin} {destination} train delay disruption today",
        f"{origin} road closure traffic delay"
    ]

    signals: List[DisruptionSignal] = []

    for idx, q in enumerate(queries):
        data = client.search_disruptions(q)
        if not data or "news_results" not in data:
            continue

        news_list = data.get("news_results", [])[:2]
        for n_idx, news in enumerate(news_list):
            title = news.get("title", "Traffic disruption reported")
            source = news.get("source", "Google News")
            link = news.get("link", "https://news.google.com")
            date_str = news.get("date", "Today")
            snippet = news.get("snippet", "").lower()

            # Determine severity & impact
            if any(k in snippet for k in ["accident", "blocked", "closed", "severe delay", "landslide"]):
                severity = "high"
                impact = 35.0
            elif any(k in snippet for k in ["traffic jam", "slowdown", "heavy traffic", "delay"]):
                severity = "medium"
                impact = 18.0
            else:
                severity = "low"
                impact = 8.0

            signals.append(
                DisruptionSignal(
                    id=f"live-sig-{idx}-{n_idx}",
                    source=source,
                    title=title,
                    published_time=date_str,
                    url=link,
                    signal_type="traffic_news",
                    severity=severity,
                    location=f"{origin} to {destination}",
                    confidence=0.85,
                    impact_minutes=impact
                )
            )

    return signals

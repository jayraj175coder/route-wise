from typing import List
import logging
from app.models.domain import DisruptionSignal
from app.services.serpapi.client import SerpApiClient

logger = logging.getLogger(__name__)

def fetch_live_disruption_signals(origin: str, destination: str, client: SerpApiClient) -> List[DisruptionSignal]:
    """
    Searches Google News for live route disruptions, accidents, road closures, and delays.
    Designed to return quickly with zero perceptible lag.
    """
    if not client.is_available():
        return []

    signals: List[DisruptionSignal] = []

    try:
        # Single targeted query for live disruption signals
        query = f"{origin} {destination} traffic delay accident"
        news_data = client.search_google_news(query)

        if news_data:
            news_items = news_data.get("news_results", [])[:2]
            for n_idx, item in enumerate(news_items):
                title = item.get("title", f"Traffic advisory: {origin} - {destination}")
                source = item.get("source", {}).get("name", "Google News") if isinstance(item.get("source"), dict) else item.get("source", "Google News")
                link = item.get("link", "https://news.google.com")
                date_str = item.get("date", "Recent")
                snippet = item.get("snippet", "").lower()

                if any(k in snippet for k in ["accident", "blocked", "closed", "severe", "landslide", "flooding"]):
                    severity = "high"
                    impact = 40.0
                elif any(k in snippet for k in ["slowdown", "heavy traffic", "jam", "congestion", "work"]):
                    severity = "medium"
                    impact = 20.0
                else:
                    severity = "low"
                    impact = 10.0

                signals.append(
                    DisruptionSignal(
                        id=f"live-news-{n_idx}",
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
    except Exception as e:
        logger.warning(f"Error fetching live disruption signals: {e}")

    return signals

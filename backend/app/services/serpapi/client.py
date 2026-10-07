import os
import logging
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class SerpApiClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SERPAPI_API_KEY")
        self.base_url = "https://serpapi.com/search.json"

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def search_google_directions(
        self,
        start_addr: str,
        end_addr: str,
        travel_mode: str = "0"  # 0=driving, 1=bicycling, 2=walking, 3=transit
    ) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            logger.info("SERPAPI_API_KEY not configured. Falling back to demo mode / internal generator.")
            return None

        params = {
            "engine": "google_maps_directions",
            "start_addr": start_addr,
            "end_addr": end_addr,
            "travel_mode": travel_mode,
            "api_key": self.api_key
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"SerpApi returned status code {response.status_code}: {response.text}")
                return None
        except Exception as e:
            logger.error(f"SerpApi request failed: {e}")
            return None

    def search_disruptions(self, query: str) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            return None

        params = {
            "engine": "google",
            "q": query,
            "tbm": "nws",  # news search
            "api_key": self.api_key
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=8)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f"SerpApi disruption search failed: {e}")
            return None

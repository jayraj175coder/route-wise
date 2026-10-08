import os
import logging
import requests
from typing import Dict, Any, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class SerpApiClient:
    """
    Dedicated SerpApi Integration Client
    Implements:
    1. Google Maps Directions
    2. Google Maps / Local Transit & Places
    3. Google Web Search
    4. Google News for Real-Time Disruption Intelligence
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SERPAPI_API_KEY")
        self.base_url = "https://serpapi.com/search.json"

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def test_connection(self) -> Dict[str, Any]:
        """Validates API key status against SerpApi account endpoint."""
        if not self.is_available():
            return {
                "configured": False,
                "message": "SERPAPI_API_KEY environment variable is not set."
            }
        try:
            res = requests.get(
                "https://serpapi.com/account",
                params={"api_key": self.api_key},
                timeout=5
            )
            if res.status_code == 200:
                data = res.json()
                return {
                    "configured": True,
                    "valid": True,
                    "plan": data.get("plan_id", "active"),
                    "searches_remaining": data.get("total_searches_left", "N/A"),
                }
            return {
                "configured": True,
                "valid": False,
                "status_code": res.status_code,
                "message": res.text
            }
        except Exception as e:
            return {
                "configured": True,
                "valid": False,
                "error": str(e)
            }

    # 1. Google Maps Directions
    def search_google_directions(
        self,
        start_addr: str,
        end_addr: str,
        travel_mode: str = "0"  # 0=driving, 1=bicycling, 2=walking, 3=transit
    ) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            logger.info("SERPAPI_API_KEY not configured. Falling back to dynamic internal engine.")
            return None

        params = {
            "engine": "google_maps_directions",
            "start_addr": start_addr,
            "end_addr": end_addr,
            "travel_mode": travel_mode,
            "api_key": self.api_key
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=5)
            if response.status_code == 200:
                return response.json()
            logger.warning(f"SerpApi directions status {response.status_code}: {response.text}")
            return None
        except Exception as e:
            logger.error(f"SerpApi directions call failed: {e}")
            return None

    # 2. Google Maps / Local (Transit hubs, stations, nearby transfer points)
    def search_google_maps_local(self, query: str, location: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            return None

        params = {
            "engine": "google_maps",
            "q": query,
            "api_key": self.api_key
        }
        if location:
            params["ll"] = location

        try:
            response = requests.get(self.base_url, params=params, timeout=3)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f"SerpApi local search failed: {e}")
            return None

    # 3. Google Web Search (Road closures, general highway updates)
    def search_google_web(self, query: str) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            return None

        params = {
            "engine": "google",
            "q": query,
            "api_key": self.api_key
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=3)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f"SerpApi web search failed: {e}")
            return None

    # 4. Google News (Real-time live disruption signals, accidents, traffic delays)
    def search_google_news(self, query: str) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            return None

        params = {
            "engine": "google_news",
            "q": query,
            "api_key": self.api_key
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=3)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f"SerpApi news search failed: {e}")
            return None

    # Alias for backward compatibility
    def search_disruptions(self, query: str) -> Optional[Dict[str, Any]]:
        return self.search_google_news(query)

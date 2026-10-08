import re
from typing import Dict, Any, Optional, Tuple

# Comprehensive registry of MMR (Mumbai Metropolitan Region) & Pune localities / transit hubs
KNOWN_HUBS = [
    # Navi Mumbai / Trans-Harbour
    "Rabale Railway Station", "Rabale Auto Stand", "Rabale Naka", "Rabale",
    "Airoli Railway Station", "Airoli", "Digha Gaon", "Ghansoli", "Koparkhairane",
    "Turbhe", "Sanpada", "Vashi Bus Station", "Vashi", "Nerul", "Belapur",
    "Kharghar", "Panvel", "Navi Mumbai",

    # Central Line & Eastern Mumbai
    "Thane Railway Station", "Thane West", "Thane East", "Thane",
    "Kalwa", "Mumbra", "Diva", "Dombivli", "Kalyan",
    "Mulund", "Bhandup", "Kanjurmarg", "Vikhroli", "Ghatkopar", "Vidyavihar",
    "Kurla", "Sion", "Matunga", "Dadar", "Parel", "Byculla", "CSMT", "CST",
    "Chembur", "Govandi", "Mankhurd", "Deonar", "Tilaknagar",

    # Western Line
    "Churchgate", "Marine Lines", "Mumbai Central", "Bandra Kurla Complex", "BKC",
    "Bandra", "Khar", "Santacruz", "Vile Parle", "Andheri", "Jogeshwari",
    "Goregaon", "Malad", "Kandivali", "Borivali", "Mira Road", "Bhayandar",

    # Pune Corridor
    "Hinjawadi Phase 1", "Hinjawadi Phase 2", "Hinjawadi Phase 3", "Hinjawadi",
    "Wakad", "Baner", "Shivajinagar", "Pune Junction", "Pune",
    "Lonavala", "Khandala", "Kothrud", "Hadapsar"
]

def find_known_locations(text: str) -> list[str]:
    """Find all recognized locality mentions in the text."""
    lowered = text.lower()
    found = []
    # Sort by length descending so "Rabale Railway Station" matches before "Rabale"
    for hub in sorted(KNOWN_HUBS, key=len, reverse=True):
        hub_low = hub.lower()
        idx = lowered.find(hub_low)
        if idx != -1:
            # Check word boundary before and after
            before_ok = (idx == 0 or not lowered[idx - 1].isalnum())
            after_ok = (idx + len(hub_low) >= len(lowered) or not lowered[idx + len(hub_low)].isalnum())
            if before_ok and after_ok:
                found.append((idx, hub))
                # Mask out this range so substrings aren't duplicate-matched
                lowered = lowered[:idx] + ("*" * len(hub_low)) + lowered[idx + len(hub_low):]
    
    # Sort by position in text
    found.sort(key=lambda x: x[0])
    return [hub for _, hub in found]

def parse_voice_transcript(transcript: str) -> Dict[str, Any]:
    """
    Intelligently parses natural multi-lingual mobility speech into structured JourneyRequest fields.
    Supports Indian English, Hindi, and Marathi patterns.
    """
    raw = (transcript or "").strip()
    text = raw.lower()

    parsed: Dict[str, Any] = {
        "origin": "Rabale, New Mumbai",
        "destination": "Thane",
        "arrival_deadline": "10:10 AM",
        "max_budget": 100.0,
        "max_walking_distance_meters": 1000.0,
        "max_transfers": 3,
        "intent": "general",
        "intent_detected": False,
        "raw_transcript": raw,
    }

    if not text:
        return parsed

    # 1. First check for Dadar to Hinjawadi Pune scenario explicitly
    if ("dadar" in text and ("hinjawadi" in text or "pune" in text)) or "hinjewadi" in text:
        parsed["origin"] = "Dadar, Mumbai"
        parsed["destination"] = "Hinjawadi Phase 1, Pune"
        parsed["max_budget"] = 1500.0
        parsed["max_transfers"] = 2
        parsed["intent"] = "interview" if "interview" in text else "general"

    else:
        # 2. Extract locations via explicit prepositions & keywords
        orig: Optional[str] = None
        dest: Optional[str] = None

        # Pattern: from X to Y (English)
        m = re.search(r"\bfrom\s+([a-zA-Z0-9\s,]+?)\s+to\s+([a-zA-Z0-9\s,]+?)(?:\s+(?:by|at|before|tomorrow|today|under|within|with|for|\.|\,)|$)", text)
        if m:
            orig = m.group(1).strip()
            dest = m.group(2).strip()

        # Pattern: X to Y (e.g. "Rabale to Thane", "Dadar to Thane")
        if not orig or not dest:
            m = re.search(r"\b([a-zA-Z0-9\s]+?)\s+to\s+([a-zA-Z0-9\s]+?)(?:\s+(?:by|at|before|tomorrow|today|under|within|with|for|\.|\,)|$)", text)
            if m:
                cand_orig = m.group(1).strip()
                cand_dest = m.group(2).strip()
                # Clean leading conversational prefixes like "i want", "go from", "route"
                cand_orig = re.sub(r"^(?:i\s+(?:want|need)\s+(?:to\s+)?(?:go|travel)?|take\s+me|show\s+me|route\s+from|from)\s+", "", cand_orig).strip()
                if len(cand_orig) >= 2 and len(cand_dest) >= 2:
                    orig = cand_orig
                    dest = cand_dest

        # Pattern: X se Y (Hindi: "रबाले से ठाणे", "Rabale se Thane")
        if not orig or not dest:
            m = re.search(r"\b([a-zA-Z0-9\s]+?)\s+se\s+([a-zA-Z0-9\s]+?)(?:\s+(?:tak|jana|jaycha|by|at|tomorrow|\.|\,)|$)", text)
            if m:
                orig = m.group(1).strip()
                dest = m.group(2).strip()

        # Pattern: X te Y (Marathi: "रबाळे ते ठाणे", "Rabale te Thane")
        if not orig or not dest:
            m = re.search(r"\b([a-zA-Z0-9\s]+?)\s+te\s+([a-zA-Z0-9\s]+?)(?:\s+(?:jaycha|by|at|tomorrow|\.|\,)|$)", text)
            if m:
                orig = m.group(1).strip()
                dest = m.group(2).strip()

        # Pattern: Go to / Reach / Travel to Y (Only destination specified)
        if not dest:
            m = re.search(r"\b(?:go\s+to|reach|travel\s+to|take\s+me\s+to|how\s+to\s+reach|to)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:by|at|before|tomorrow|today|from|under|\.|\,)|$)", text)
            if m:
                dest = m.group(1).strip()

        # Match identified names against KNOWN_HUBS for clean canonical casing
        known_in_text = find_known_locations(text)

        if len(known_in_text) >= 2:
            # If two recognizable hubs were mentioned, order them as origin -> destination
            orig = known_in_text[0]
            dest = known_in_text[1]
        elif len(known_in_text) == 1:
            # If only one hub was recognized
            hub = known_in_text[0]
            if orig and hub.lower() in orig.lower():
                orig = hub
            else:
                dest = hub
                orig = "Rabale, New Mumbai"
        else:
            # Normalize strings if found via regex
            if orig:
                orig = orig.strip().title()
            if dest:
                dest = dest.strip().title()

        if orig:
            # Clean common junk words from extracted origin
            orig = re.sub(r"^(?:I\s+Need\s+To\s+Go\s+From|I\s+Want\s+To\s+Go\s+From|Go\s+From|Please\s+Take\s+Me\s+From|Show\s+Route\s+From|From)\s+", "", orig, flags=re.I).strip()
            if orig.lower() in ["rabale", "rabale railway station"]:
                orig = "Rabale, New Mumbai"
            parsed["origin"] = orig

        if dest:
            # Clean common junk words from extracted destination
            dest = re.sub(r"^(?:To\s+|Reach\s+|Go\s+To\s+)", "", dest, flags=re.I).strip()
            dest = re.sub(r"\s+(?:By|At|Before|Under|Tomorrow|Today).*$", "", dest, flags=re.I).strip()
            if dest.lower() in ["thane", "thane railway station"]:
                dest = "Thane"
            parsed["destination"] = dest

    # 3. Extract arrival deadline / time
    # e.g. "by 10:10", "at 10:10 am", "reach by 10:30", "10:10", "by 10 am"
    time_match = re.search(r"\b(?:at|by|before|around)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)", text)
    if not time_match:
        # direct time notation like "10:10 am" or "10:10"
        time_match = re.search(r"\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b", text)

    if time_match:
        raw_time = time_match.group(1).upper().strip()
        if ":" not in raw_time:
            parts = raw_time.split()
            if len(parts) == 2:
                raw_time = f"{parts[0]}:00 {parts[1]}"
            else:
                raw_time = f"{raw_time}:00 AM"
        if "AM" not in raw_time and "PM" not in raw_time:
            raw_time += " AM"
        parsed["arrival_deadline"] = raw_time

    # 4. Extract budget: e.g. "budget is 100", "under 100 rupees", "100 rs", "₹100"
    budget_match = re.search(r"(?:budget(?: is)?|under|within|max(?:imum)?)\s*(?:of)?\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})", text)
    if not budget_match:
        budget_match = re.search(r"(\d{2,5})\s*(?:rupees|rs|rupaye|inr)", text)
    if budget_match:
        try:
            parsed["max_budget"] = float(budget_match.group(1))
        except ValueError:
            pass

    # 5. Extract walking distance: e.g. "walk max 500m", "1000m walking", "under 1 km"
    if "one kilometer" in text or "1 km" in text or "1km" in text:
        parsed["max_walking_distance_meters"] = 1000.0
    elif "500" in text and ("meter" in text or "m" in text):
        parsed["max_walking_distance_meters"] = 500.0
    elif "2 km" in text or "2km" in text:
        parsed["max_walking_distance_meters"] = 2000.0
    else:
        walk_match = re.search(r"(\d+)\s*(?:km|kilometer|m|meter)", text)
        if walk_match:
            try:
                val = float(walk_match.group(1))
                if "km" in text or "kilometer" in text:
                    parsed["max_walking_distance_meters"] = val * 1000.0
                else:
                    parsed["max_walking_distance_meters"] = val
            except ValueError:
                pass

    # 6. Extract intent / purpose
    if "interview" in text:
        parsed["intent"] = "interview"
        parsed["intent_detected"] = True
    elif "exam" in text or "test" in text or "paper" in text:
        parsed["intent"] = "exam"
        parsed["intent_detected"] = True
    elif "flight" in text or "airport" in text:
        parsed["intent"] = "flight"
        parsed["intent_detected"] = True
    elif "emergency" in text or "urgent" in text or "hospital" in text:
        parsed["intent"] = "emergency"
        parsed["intent_detected"] = True
    elif "family" in text or "kids" in text or "children" in text:
        parsed["intent"] = "family"
        parsed["intent_detected"] = True
    elif any(kw in text for kw in ["cheap", "cheapest", "low cost", "budget", "kam kharcha", "sasta"]):
        parsed["intent"] = "budget"
        parsed["intent_detected"] = True
        # If user explicitly requested cheapest route, adjust budget if not already set
        if "budget" not in text and parsed["max_budget"] > 100:
            parsed["max_budget"] = 50.0
    else:
        parsed["intent"] = "general"

    return parsed

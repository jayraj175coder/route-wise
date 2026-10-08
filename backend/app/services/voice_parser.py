import re
from typing import Dict, Any

def parse_voice_transcript(transcript: str) -> Dict[str, Any]:
    """
    Parses conversational Indian mobility speech into structured JourneyRequest fields.
    Handles phrases like:
    'I need to go from Dadar to Hinjawadi Pune tomorrow morning. I have an interview at 10:30,
     my budget is 1500 rupees and I don't want to walk more than one kilometer.'
    """
    text = transcript.strip().lower()

    # Default baseline
    parsed = {
        "origin": "Dadar, Mumbai",
        "destination": "Hinjawadi Phase 1, Pune",
        "arrival_deadline": "10:10 AM",
        "max_budget": 1500,
        "max_walking_distance_meters": 1000,
        "max_transfers": 2,
        "intent": "general",
        "intent_detected": False,
        "raw_transcript": transcript,
    }

    # Extract origin & destination patterns
    # Pattern 1: "from X to Y"
    from_to_match = re.search(r"from\s+([a-zA-Z0-9\s,]+?)\s+to\s+([a-zA-Z0-9\s,]+?)(?:\s+(?:tomorrow|at|my|by|before|in|with|for|\.|\,)|$)", text)
    # Pattern 2: "to/reach Y from X"
    to_from_match = re.search(r"(?:reach|go to|travel to|to)\s+([a-zA-Z0-9\s,]+?)\s+from\s+([a-zA-Z0-9\s,]+?)(?:\s+(?:tomorrow|at|my|by|before|in|with|for|\.|\,)|$)", text)
    # Pattern 3: "X to Y"
    x_to_y_match = re.search(r"(?:i need|want|route|going|travel|commute)?\s*([a-zA-Z0-9\s,]+?)\s+to\s+([a-zA-Z0-9\s,]+?)(?:\s+(?:tomorrow|at|my|by|before|in|with|for|\.|\,)|$)", text)

    orig, dest = None, None
    if from_to_match:
        orig = from_to_match.group(1).strip().title()
        dest = from_to_match.group(2).strip().title()
    elif to_from_match:
        dest = to_from_match.group(1).strip().title()
        orig = to_from_match.group(2).strip().title()
    elif x_to_y_match and len(x_to_y_match.group(1).strip()) > 2 and len(x_to_y_match.group(2).strip()) > 2:
        orig = x_to_y_match.group(1).strip().title()
        dest = x_to_y_match.group(2).strip().title()

    if orig and dest:
        # Clean filler words
        for filler in ["I Need To Go", "I Want To Go", "Go", "Travel", "Please"]:
            if orig.startswith(filler):
                orig = orig[len(filler):].strip()
        if "Dadar" in orig and "Mumbai" not in orig:
            orig = f"{orig}, Mumbai"
        if "Hinjawadi" in dest and "Pune" not in dest:
            dest = f"{dest}, Pune"
        if orig and dest:
            parsed["origin"] = orig
            parsed["destination"] = dest

    # Extract arrival deadline: e.g. "at 10:30", "10:10 am", "reach by 11", "deadline 10:30"
    time_match = re.search(r"(?:at|by|before)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)", text)
    if time_match:
        raw_time = time_match.group(1).upper().strip()
        if ":" not in raw_time:
            # e.g. "10 AM" -> "10:00 AM"
            parts = raw_time.split()
            if len(parts) == 2:
                raw_time = f"{parts[0]}:00 {parts[1]}"
            else:
                raw_time = f"{raw_time}:00 AM"
        if "AM" not in raw_time and "PM" not in raw_time:
            raw_time += " AM"
        parsed["arrival_deadline"] = raw_time

    # Extract budget: e.g. "budget is 1500", "under 2000 rupees", "1500 rs", "₹1200"
    budget_match = re.search(r"(?:budget(?: is)?|under|within|max)\s*(?:of)?\s*(?:rs|inr|₹)?\s*(\d{3,5})", text)
    if not budget_match:
        budget_match = re.search(r"(\d{3,5})\s*(?:rupees|rs|inr)", text)
    if budget_match:
        try:
            parsed["max_budget"] = float(budget_match.group(1))
        except ValueError:
            pass

    # Extract walking: e.g. "walk more than one kilometer", "walk max 500m", "1 km"
    if "one kilometer" in text or "1 km" in text or "1km" in text:
        parsed["max_walking_distance_meters"] = 1000
    elif "two kilometer" in text or "2 km" in text or "2km" in text:
        parsed["max_walking_distance_meters"] = 2000
    elif "500" in text and ("meter" in text or "m" in text):
        parsed["max_walking_distance_meters"] = 500
    else:
        walk_match = re.search(r"(\d+)\s*(?:km|kilometer|m|meter)", text)
        if walk_match:
            val = float(walk_match.group(1))
            if "km" in text or "kilometer" in text:
                parsed["max_walking_distance_meters"] = val * 1000
            else:
                parsed["max_walking_distance_meters"] = val

    # Extract purpose / intent
    if "interview" in text:
        parsed["intent"] = "interview"
        parsed["intent_detected"] = True
    elif "exam" in text or "test" in text:
        parsed["intent"] = "exam"
        parsed["intent_detected"] = True
    elif "flight" in text or "airport" in text:
        parsed["intent"] = "flight"
        parsed["intent_detected"] = True
    elif "emergency" in text or "urgent" in text or "hospital" in text:
        parsed["intent"] = "emergency"
        parsed["intent_detected"] = True
    elif "family" in text or "kids" in text or "parents" in text:
        parsed["intent"] = "family"
        parsed["intent_detected"] = True
    elif "cheap" in text or "budget" in text and "low" in text:
        parsed["intent"] = "budget"
        parsed["intent_detected"] = True
    else:
        parsed["intent"] = "general"

    return parsed

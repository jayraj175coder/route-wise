from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, default="anonymous_user", index=True)
    travel_style = Column(String, default="balanced")
    walking_limit = Column(Float, default=1.0)
    max_transfers = Column(Integer, default=2)
    prefer_public_transport = Column(Boolean, default=True)
    avoid_tolls = Column(Boolean, default=True)
    avoid_stairs = Column(Boolean, default=False)
    accessibility_mode = Column(String, default="standard")
    prefer_flights = Column(Boolean, default=True)
    safety_priority = Column(Boolean, default=True)
    voice_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RecentSearch(Base):
    __tablename__ = "recent_searches"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, default="anonymous_user", index=True)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    deadline = Column(String, default="10:10 AM")
    budget = Column(Float, default=1500.0)
    walking_limit = Column(Float, default=1000.0)
    max_transfers = Column(Integer, default=2)
    purpose = Column(String, default="general")
    created_at = Column(DateTime, default=datetime.utcnow)

class JourneySession(Base):
    __tablename__ = "journey_sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, default="anonymous_user", index=True)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    deadline = Column(String, default="10:10 AM")
    budget = Column(Float, default=1500.0)
    selected_route = Column(String, nullable=True)
    routewise_score = Column(Float, default=92.0)
    created_at = Column(DateTime, default=datetime.utcnow)

"""
Natkhat AI - Backend Server
FastAPI + MongoDB. All third-party API calls are proxied here (never expose keys to frontend).
"""

import logging
import os
import random
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---------- DB ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# ---------- App ----------
app = FastAPI(title="Natkhat AI")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("natkhat")


# ---------- Portal metadata ----------
PORTALS: List[dict] = [
    {"id": "question", "name": "Question Portal", "emoji": "❓", "color": "#FB923C", "tagline": "Ask Leo anything!", "free": True, "xp": 15, "order": 1},
    {"id": "toystory", "name": "Toy Story", "emoji": "🧸", "color": "#EC4899", "tagline": "Bring toys to life!", "free": True, "xp": 20, "order": 2},
    {"id": "glitch", "name": "Story Machine", "emoji": "🌀", "color": "#8B5CF6", "tagline": "Impossible combos!", "free": True, "xp": 25, "order": 3},
    {"id": "pattern", "name": "Pattern Hunter", "emoji": "🔷", "color": "#06B6D4", "tagline": "Shape hunt!", "free": False, "xp": 20, "order": 4},
    {"id": "sound", "name": "Sound Trainer", "emoji": "🐯", "color": "#F59E0B", "tagline": "Train Bubbles!", "free": False, "xp": 20, "order": 5},
    {"id": "word", "name": "Word Capture", "emoji": "🔤", "color": "#10B981", "tagline": "Trap the letters!", "free": False, "xp": 15, "order": 6},
    {"id": "bolega", "name": "Leo Bolega!", "emoji": "🗣️", "color": "#F43F5E", "tagline": "English speaking daily!", "free": False, "xp": 20, "order": 7},
    {"id": "shloka", "name": "Shloka Spark", "emoji": "🕉️", "color": "#FB923C", "tagline": "Little wisdom stories!", "free": False, "xp": 25, "order": 8},
    {"id": "body", "name": "Body Commander", "emoji": "💪", "color": "#10B981", "tagline": "Superhero moves!", "free": False, "xp": 25, "order": 9},
    {"id": "feeling", "name": "Feeling Finder", "emoji": "💗", "color": "#EC4899", "tagline": "Find your feelings!", "free": False, "xp": 20, "order": 10},
]

LEVELS = [
    {"level": 1, "title": "Baby Explorer", "emoji": "🐣", "xp": 0},
    {"level": 2, "title": "Curious Cub", "emoji": "🐾", "xp": 150},
    {"level": 3, "title": "Question Master", "emoji": "🔍", "xp": 350},
    {"level": 4, "title": "Star Adventurer", "emoji": "⭐", "xp": 600},
    {"level": 5, "title": "Junior Leo", "emoji": "🦁", "xp": 900},
    {"level": 6, "title": "Galaxy Ranger", "emoji": "🚀", "xp": 1300},
    {"level": 7, "title": "Wisdom Keeper", "emoji": "🧠", "xp": 1800},
    {"level": 8, "title": "Diamond Guardian", "emoji": "💎", "xp": 2500},
    {"level": 9, "title": "Super Natkhat", "emoji": "🌟", "xp": 3300},
    {"level": 10, "title": "Leo's Champion", "emoji": "👑", "xp": 4500},
]

BHASHAS = [
    {"code": "Hindi", "sarvam": "hi-IN", "endearment": "beta", "label": "हिंदी"},
    {"code": "Tamil", "sarvam": "ta-IN", "endearment": "kanna", "label": "தமிழ்"},
    {"code": "Telugu", "sarvam": "te-IN", "endearment": "babu", "label": "తెలుగు"},
    {"code": "Malayalam", "sarvam": "ml-IN", "endearment": "kutti", "label": "മലയാളം"},
    {"code": "Punjabi", "sarvam": "pa-IN", "endearment": "putt", "label": "ਪੰਜਾਬੀ"},
    {"code": "Bengali", "sarvam": "bn-IN", "endearment": "shona", "label": "বাংলা"},
    {"code": "Marathi", "sarvam": "mr-IN", "endearment": "baala", "label": "मराठी"},
    {"code": "Kannada", "sarvam": "kn-IN", "endearment": "magoo", "label": "ಕನ್ನಡ"},
    {"code": "Gujarati", "sarvam": "gu-IN", "endearment": "dikra", "label": "ગુજરાતી"},
    {"code": "Odia", "sarvam": "or-IN", "endearment": "pua", "label": "ଓଡ଼ିଆ"},
    {"code": "Assamese", "sarvam": "as-IN", "endearment": "mor xon", "label": "অসমীয়া"},
    {"code": "Maithili", "sarvam": "hi-IN", "endearment": "baua", "label": "मैथिली"},
]

DANGER_KEYWORDS = ["knife", "fire", "hurt", "kill", "blood", "gun", "die", "poison"]


def level_from_xp(xp: int) -> dict:
    current = LEVELS[0]
    next_lvl = None
    for i, lvl in enumerate(LEVELS):
        if xp >= lvl["xp"]:
            current = lvl
            next_lvl = LEVELS[i + 1] if i + 1 < len(LEVELS) else None
    return {
        "level": current["level"],
        "title": current["title"],
        "emoji": current["emoji"],
        "current_level_xp": current["xp"],
        "next_level_xp": next_lvl["xp"] if next_lvl else current["xp"],
        "next_level_title": next_lvl["title"] if next_lvl else "Max Level!",
    }


def endearment_for(bhasha: str) -> str:
    for b in BHASHAS:
        if b["code"].lower() == (bhasha or "").lower():
            return b["endearment"]
    return "beta"


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


# ---------- Models ----------
class OTPSendReq(BaseModel):
    mobile: str


class OTPVerifyReq(BaseModel):
    mobile: str
    otp: str
    name: Optional[str] = None
    email: Optional[str] = None


class ChildProfileCreate(BaseModel):
    parent_id: str
    child_name: str
    age: int
    bhasha: str = "Hindi"


class LeoMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class LeoReq(BaseModel):
    child_id: Optional[str] = None
    child_name: str
    bhasha: str = "Hindi"
    portal_name: str = "Question Portal"
    messages: List[LeoMessage]
    max_tokens: int = 400


class SessionLogReq(BaseModel):
    child_id: str
    portal_id: str
    question_asked: Optional[str] = None
    leo_response: Optional[str] = None
    topic_tag: Optional[str] = None
    mission_completed: bool = False
    xp_earned: int = 0
    duration_seconds: int = 0


class MoodLogReq(BaseModel):
    child_id: str
    emotion: str
    release_mission_done: bool = False
    family_mission_done: bool = False
    xp_earned: int = 0


class SafetyAlertReq(BaseModel):
    child_id: str
    alert_type: str
    severity: str = "routine"
    content: Optional[str] = None
    portal_id: Optional[str] = None


class MissionVerifyReq(BaseModel):
    verification_id: str
    verified: bool = True


class PaymentCreateReq(BaseModel):
    child_id: str
    plan: str  # "portal_70" | "all_399" | "sixmonth_1999"
    portal_id: Optional[str] = None


class PaymentVerifyReq(BaseModel):
    child_id: str
    order_id: str
    payment_id: str
    signature: str
    plan: str
    portal_id: Optional[str] = None


class SeenIntroReq(BaseModel):
    child_id: str


# ---------- Routes: meta ----------
@api_router.get("/")
async def root():
    return {"app": "Natkhat AI", "status": "ok", "time": now_utc().isoformat()}


@api_router.get("/portals")
async def get_portals():
    return {"portals": PORTALS, "levels": LEVELS, "bhashas": BHASHAS}


# ---------- Routes: auth (mock OTP) ----------
@api_router.post("/auth/otp/send")
async def send_otp(req: OTPSendReq):
    # Mock OTP - accept 123456 in preview. Real Firebase Phone OTP wired at build time.
    otp = "123456"
    await db.otp_codes.update_one(
        {"mobile": req.mobile},
        {"$set": {"mobile": req.mobile, "otp": otp, "created_at": now_utc().isoformat()}},
        upsert=True,
    )
    logger.info("Mock OTP sent to %s (dev otp=%s)", req.mobile, otp)
    return {"ok": True, "mock": True, "dev_otp": otp, "message": "Use 123456 in dev preview"}


@api_router.post("/auth/otp/verify")
async def verify_otp(req: OTPVerifyReq):
    row = await db.otp_codes.find_one({"mobile": req.mobile}, {"_id": 0})
    accept = req.otp == "123456" or (row and row.get("otp") == req.otp)
    if not accept:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    parent = await db.parents.find_one({"mobile": req.mobile}, {"_id": 0})
    if not parent:
        parent = {
            "id": str(uuid.uuid4()),
            "mobile": req.mobile,
            "name": req.name or "Parent",
            "email": req.email,
            "created_at": now_utc().isoformat(),
        }
        await db.parents.insert_one(parent.copy())

    child = await db.child_profiles.find_one({"parent_id": parent["id"]}, {"_id": 0})
    return {"ok": True, "parent": parent, "child": child, "has_child": child is not None}


# ---------- Routes: child profile ----------
@api_router.post("/child/profile")
async def create_child(req: ChildProfileCreate):
    child = {
        "id": str(uuid.uuid4()),
        "parent_id": req.parent_id,
        "child_name": req.child_name.strip(),
        "age": req.age,
        "bhasha": req.bhasha,
        "xp": 0,
        "level": 1,
        "streak_days": 1,
        "last_active_date": date.today().isoformat(),
        "has_seen_intro": False,
        "unlocked_portals": ["question", "toystory", "glitch"],
        "subscription_type": "free",
        "subscription_expiry": None,
        "created_at": now_utc().isoformat(),
    }
    await db.child_profiles.insert_one(child.copy())
    return {"ok": True, "child": child}


@api_router.get("/child/{child_id}")
async def get_child(child_id: str):
    child = await db.child_profiles.find_one({"id": child_id}, {"_id": 0})
    if not child:
        raise HTTPException(404, "Child not found")

    # Streak refresh
    today = date.today()
    last = date.fromisoformat(child.get("last_active_date", today.isoformat()))
    streak = child.get("streak_days", 1)
    if last == today - timedelta(days=1):
        streak += 1
    elif last < today - timedelta(days=1):
        streak = 1
    if streak != child.get("streak_days") or last != today:
        await db.child_profiles.update_one(
            {"id": child_id},
            {"$set": {"streak_days": streak, "last_active_date": today.isoformat()}},
        )
        child["streak_days"] = streak
        child["last_active_date"] = today.isoformat()

    child["level_info"] = level_from_xp(child.get("xp", 0))
    return {"ok": True, "child": child}


@api_router.post("/child/seen-intro")
async def seen_intro(req: SeenIntroReq):
    await db.child_profiles.update_one({"id": req.child_id}, {"$set": {"has_seen_intro": True}})
    return {"ok": True}


# ---------- Routes: Leo (Claude via Emergent LLM) ----------
def leo_system_prompt(child_name: str, endearment: str, portal_name: str) -> str:
    return (
        f"You are Leo the Caretaker — a warm, maternal AI persona for Indian children aged 4-6.\n"
        f"CHILD'S NAME: {child_name} (use EXACTLY in EVERY response, never skip)\n"
        f"ENDEARMENT: {endearment} (from child's home language, use 1-2 times naturally)\n"
        f"PORTAL: {portal_name}\n\n"
        "STRICT RULES:\n"
        "1. MAXIMUM 2-3 sentences. NEVER more.\n"
        "2. EVERY response MUST include: (a) funny cartoon analogy, (b) a physical mission using household objects.\n"
        "3. Indian English. Dramatic, warm, silly. Use sound effects: WHOOOOSH! ZING! AREY! DHOOM!\n"
        f"4. Start every response with the child's name ({child_name}) said with ENERGY.\n"
        "5. Missions: run, count, touch, find, or build with household items.\n"
        "6. NEVER be robotic or formal.\n"
        f"SAFETY: If dangerous/inappropriate content detected, say: '{child_name} {endearment}, Leo needs to tell Mama/Papa about that! Let's ask them right now! 🦁'"
    )


def _safety_scan(text: str) -> bool:
    t = (text or "").lower()
    return any(k in t for k in DANGER_KEYWORDS)


@api_router.post("/leo")
async def leo_brain(req: LeoReq):
    endearment = endearment_for(req.bhasha)
    last_user = next((m.content for m in reversed(req.messages) if m.role == "user"), "")

    # Safety pre-gate — never call LLM on dangerous input
    if _safety_scan(last_user):
        safe_text = (
            f"{req.child_name} {endearment}, Leo needs to tell Mama/Papa about that! "
            f"Let's go find them right now, ok? 🦁"
        )
        if req.child_id:
            await db.safety_alerts.insert_one(
                {
                    "id": str(uuid.uuid4()),
                    "child_id": req.child_id,
                    "alert_type": "dangerous_keyword",
                    "severity": "urgent",
                    "content": last_user[:500],
                    "portal_id": req.portal_name,
                    "resolved": False,
                    "created_at": now_utc().isoformat(),
                }
            )
        return {"content": [{"type": "text", "text": safe_text}], "safety_triggered": True}

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        # Graceful fallback if key missing
        fallback = (
            f"{req.child_name}!! AREY! Leo's brain is taking a chai break! "
            f"Quick — go touch three orange things in your room and come back {endearment}! 🦁"
        )
        return {"content": [{"type": "text", "text": fallback}], "fallback": True}

    system = leo_system_prompt(req.child_name, endearment, req.portal_name)
    session_id = f"leo-{req.child_id or 'anon'}-{req.portal_name}"

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        # Build the full conversation into one call by feeding history as previous turns
        # Simpler + reliable: just send the latest user message; history is stored client-side.
        user_msg = UserMessage(text=last_user or "Hello Leo!")
        text = await chat.send_message(user_msg)
        return {"content": [{"type": "text", "text": text}]}
    except Exception as exc:
        logger.exception("Leo LLM call failed: %s", exc)
        fallback = (
            f"Arey {req.child_name}! Leo's internet is taking a nap! "
            f"Quickly go jump 5 times like a bunny {endearment}, and try again! 🐰"
        )
        return {"content": [{"type": "text", "text": fallback}], "fallback": True}


# ---------- Routes: TTS / STT / Vision / Emotion (stubs) ----------
@api_router.post("/tts")
async def tts_proxy(payload: dict):
    """Sarvam Bulbul v2 TTS proxy. Stubbed until SARVAM_API_KEY provided."""
    if not os.environ.get("SARVAM_API_KEY"):
        return {"ok": False, "stub": True, "audio_base64": "", "note": "Add SARVAM_API_KEY to enable Leo's voice"}
    # Real impl left as adapter placeholder to slot in when key arrives
    return {"ok": False, "stub": True, "note": "TTS adapter placeholder"}


@api_router.post("/stt")
async def stt_proxy(payload: dict):
    """Sarvam Saarika STT proxy. Stubbed."""
    if not os.environ.get("SARVAM_API_KEY"):
        return {"ok": False, "stub": True, "transcript": "", "note": "Add SARVAM_API_KEY"}
    return {"ok": False, "stub": True, "note": "STT adapter placeholder"}


@api_router.post("/vision")
async def vision_proxy(payload: dict):
    """Google Cloud Vision (object detection + OCR). Stubbed."""
    if not os.environ.get("GOOGLE_CLOUD_VISION_KEY"):
        return {"ok": False, "stub": True, "labels": ["toy", "block"], "text": ""}
    return {"ok": False, "stub": True, "note": "Vision adapter placeholder"}


@api_router.post("/safety/camera")
async def safety_camera(payload: dict):
    """AWS Rekognition moderation on every frame. Stub returns SAFE."""
    return {"ok": True, "safe": True, "stub": not bool(os.environ.get("AWS_ACCESS_KEY_ID"))}


@api_router.post("/emotion")
async def emotion_proxy(payload: dict):
    """Hume AI voice emotion. Stubbed."""
    return {"ok": True, "stub": True, "distress_score": 0.0}


# ---------- Routes: session / mood / safety / mission ----------
@api_router.post("/session/log")
async def log_session(req: SessionLogReq):
    row = {
        "id": str(uuid.uuid4()),
        **req.model_dump(),
        "created_at": now_utc().isoformat(),
    }
    await db.session_logs.insert_one(row.copy())
    if req.xp_earned:
        await db.child_profiles.update_one(
            {"id": req.child_id}, {"$inc": {"xp": int(req.xp_earned)}}
        )
    return {"ok": True, "session": row}


@api_router.post("/mood/log")
async def log_mood(req: MoodLogReq):
    row = {
        "id": str(uuid.uuid4()),
        **req.model_dump(),
        "logged_date": date.today().isoformat(),
        "created_at": now_utc().isoformat(),
    }
    await db.mood_diary.insert_one(row.copy())
    if req.xp_earned:
        await db.child_profiles.update_one(
            {"id": req.child_id}, {"$inc": {"xp": int(req.xp_earned)}}
        )
    return {"ok": True, "mood": row}


@api_router.post("/safety/alert")
async def create_safety_alert(req: SafetyAlertReq):
    row = {
        "id": str(uuid.uuid4()),
        **req.model_dump(),
        "resolved": False,
        "created_at": now_utc().isoformat(),
    }
    await db.safety_alerts.insert_one(row.copy())
    return {"ok": True, "alert": row}


@api_router.post("/mission/verify")
async def verify_mission(req: MissionVerifyReq):
    v = await db.mission_verifications.find_one({"id": req.verification_id}, {"_id": 0})
    if not v:
        raise HTTPException(404, "Verification not found")
    if v.get("verified"):
        return {"ok": True, "already_verified": True}
    await db.mission_verifications.update_one(
        {"id": req.verification_id},
        {"$set": {"verified": True, "verified_at": now_utc().isoformat()}},
    )
    if req.verified and v.get("xp_reward"):
        await db.child_profiles.update_one(
            {"id": v["child_id"]}, {"$inc": {"xp": int(v["xp_reward"])}}
        )
    return {"ok": True, "verification": {**v, "verified": True}}


# ---------- Routes: payments (stub) ----------
@api_router.post("/payment/create")
async def payment_create(req: PaymentCreateReq):
    amounts = {"portal_70": 7000, "all_399": 39900, "sixmonth_1999": 199900}  # paise
    amount = amounts.get(req.plan, 39900)
    order_id = f"order_stub_{uuid.uuid4().hex[:12]}"
    return {
        "ok": True,
        "stub": not bool(os.environ.get("RAZORPAY_KEY_ID")),
        "order_id": order_id,
        "amount": amount,
        "currency": "INR",
        "plan": req.plan,
    }


@api_router.post("/payment/verify")
async def payment_verify(req: PaymentVerifyReq):
    # Real: verify HMAC signature with Razorpay secret. Stub trusts frontend in dev.
    child = await db.child_profiles.find_one({"id": req.child_id}, {"_id": 0})
    if not child:
        raise HTTPException(404, "Child not found")

    unlocked = set(child.get("unlocked_portals", []))
    if req.plan == "portal_70" and req.portal_id:
        unlocked.add(req.portal_id)
    else:
        unlocked.update(p["id"] for p in PORTALS)

    expiry = now_utc() + (timedelta(days=180) if req.plan == "sixmonth_1999" else timedelta(days=30))
    await db.child_profiles.update_one(
        {"id": req.child_id},
        {
            "$set": {
                "unlocked_portals": sorted(unlocked),
                "subscription_type": req.plan,
                "subscription_expiry": expiry.isoformat(),
            }
        },
    )
    return {"ok": True, "unlocked_portals": sorted(unlocked)}


# ---------- Routes: dashboard ----------
@api_router.get("/dashboard/{child_id}")
async def dashboard(child_id: str):
    child = await db.child_profiles.find_one({"id": child_id}, {"_id": 0})
    if not child:
        raise HTTPException(404, "Child not found")

    sessions = await db.session_logs.find({"child_id": child_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    moods = await db.mood_diary.find({"child_id": child_id}, {"_id": 0}).sort("created_at", -1).to_list(14)
    alerts = await db.safety_alerts.find({"child_id": child_id, "resolved": False}, {"_id": 0}).sort("created_at", -1).to_list(20)
    verifications = await db.mission_verifications.find({"child_id": child_id, "verified": False}, {"_id": 0}).sort("created_at", -1).to_list(20)
    badges = await db.badges.find({"child_id": child_id}, {"_id": 0}).sort("earned_at", -1).to_list(50)

    child["level_info"] = level_from_xp(child.get("xp", 0))
    return {
        "ok": True,
        "child": child,
        "sessions": sessions,
        "moods": moods,
        "alerts": alerts,
        "verifications": verifications,
        "badges": badges,
    }


# ---------- Wire up ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

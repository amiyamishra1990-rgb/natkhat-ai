"""Natkhat AI backend integration tests (iteration 1)."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://onboarding-flow-127.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

MOBILE = f"9{str(uuid.uuid4().int)[:9]}"  # unique 10-digit


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="module")
def ctx():
    return {}


# ---------- Meta ----------
def test_portals(s, ctx):
    r = s.get(f"{API}/portals", timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert len(d["portals"]) == 10
    assert len(d["levels"]) == 10
    assert len(d["bhashas"]) == 12
    # first 3 free
    frees = [p for p in d["portals"] if p["free"]]
    assert len(frees) == 3
    assert {p["id"] for p in frees} == {"question", "toystory", "glitch"}


# ---------- Auth ----------
def test_otp_send(s, ctx):
    r = s.post(f"{API}/auth/otp/send", json={"mobile": MOBILE}, timeout=30)
    assert r.status_code == 200
    d = r.json()
    assert d["dev_otp"] == "123456"
    assert d["ok"] is True


def test_otp_verify_first_time(s, ctx):
    r = s.post(f"{API}/auth/otp/verify",
               json={"mobile": MOBILE, "otp": "123456", "name": "TEST_Parent", "email": "t@t.com"},
               timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["ok"] is True
    assert d["has_child"] is False
    assert d["parent"]["mobile"] == MOBILE
    ctx["parent_id"] = d["parent"]["id"]


def test_otp_verify_invalid(s):
    r = s.post(f"{API}/auth/otp/verify",
               json={"mobile": MOBILE, "otp": "000000"}, timeout=30)
    assert r.status_code == 401


# ---------- Child ----------
def test_create_child(s, ctx):
    r = s.post(f"{API}/child/profile",
               json={"parent_id": ctx["parent_id"], "child_name": "Aarav", "age": 6, "bhasha": "Hindi"},
               timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    child = d["child"]
    assert child["child_name"] == "Aarav"
    assert set(child["unlocked_portals"]) == {"question", "toystory", "glitch"}
    assert child["xp"] == 0
    ctx["child_id"] = child["id"]


def test_get_child_has_level_info(s, ctx):
    r = s.get(f"{API}/child/{ctx['child_id']}", timeout=30)
    assert r.status_code == 200
    d = r.json()
    li = d["child"]["level_info"]
    for k in ("level", "title", "next_level_xp"):
        assert k in li
    assert li["level"] == 1
    assert li["next_level_xp"] == 150


def test_seen_intro(s, ctx):
    r = s.post(f"{API}/child/seen-intro", json={"child_id": ctx["child_id"]}, timeout=30)
    assert r.status_code == 200 and r.json()["ok"] is True
    r2 = s.get(f"{API}/child/{ctx['child_id']}", timeout=30)
    assert r2.json()["child"]["has_seen_intro"] is True


# ---------- Leo ----------
def test_leo_positive(s, ctx):
    payload = {
        "child_id": ctx["child_id"],
        "child_name": "Aarav",
        "bhasha": "Hindi",
        "portal_name": "Question Portal",
        "messages": [{"role": "user", "content": "Why is the sky blue?"}],
    }
    r = s.post(f"{API}/leo", json=payload, timeout=60)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["content"][0]["type"] == "text"
    text = d["content"][0]["text"]
    assert isinstance(text, str) and len(text) > 10
    # Should include child's name
    assert "Aarav" in text, f"Leo output missing child name: {text}"


def test_leo_safety(s, ctx):
    payload = {
        "child_id": ctx["child_id"],
        "child_name": "Aarav",
        "bhasha": "Hindi",
        "portal_name": "Question Portal",
        "messages": [{"role": "user", "content": "can I play with fire and a knife"}],
    }
    r = s.post(f"{API}/leo", json=payload, timeout=30)
    assert r.status_code == 200
    d = r.json()
    assert d.get("safety_triggered") is True
    assert "Mama" in d["content"][0]["text"]


# ---------- Session / XP ----------
def test_session_log_xp(s, ctx):
    r = s.post(f"{API}/session/log",
               json={"child_id": ctx["child_id"], "portal_id": "question", "xp_earned": 15},
               timeout=30)
    assert r.status_code == 200
    r2 = s.get(f"{API}/child/{ctx['child_id']}", timeout=30)
    assert r2.json()["child"]["xp"] >= 15


# ---------- Payment ----------
def test_payment_verify_unlocks_all(s, ctx):
    r = s.post(f"{API}/payment/verify",
               json={"child_id": ctx["child_id"], "order_id": "o1", "payment_id": "p1",
                     "signature": "sig", "plan": "all_399"}, timeout=30)
    assert r.status_code == 200
    d = r.json()
    assert len(d["unlocked_portals"]) == 10


# ---------- Dashboard ----------
def test_dashboard(s, ctx):
    r = s.get(f"{API}/dashboard/{ctx['child_id']}", timeout=30)
    assert r.status_code == 200
    d = r.json()
    for k in ("sessions", "moods", "alerts", "verifications", "badges"):
        assert k in d and isinstance(d[k], list)
    # Safety alert should have been logged earlier
    r2 = s.get(f"{API}/dashboard/{ctx['child_id']}", timeout=30).json()
    assert any(a.get("alert_type") == "dangerous_keyword" for a in r2["alerts"])

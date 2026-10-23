"""
Integration tests for FastAPI health check and JWT authentication flow.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token, decode_access_token, verify_password, get_password_hash
from app.api.v1 import auth as auth_api
from app.schemas.auth import UserLogin, UserRegister
from app.core.exceptions import UISBaseException

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "UIS Backend"


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert data["docs"] == "/api/docs"


def test_password_hashing():
    raw_pass = "SecurePass123!"
    hashed = get_password_hash(raw_pass)
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_creation_and_decoding():
    token = create_access_token(subject="officer_1", role="government")
    payload = decode_access_token(token)
    assert payload["sub"] == "officer_1"
    assert payload["role"] == "government"


def test_login_accepts_seeded_government_email(monkeypatch):
    user = type("UserRecord", (), {
        "username": "gov_officer",
        "email": "officer@city.gov.in",
        "hashed_password": "stored-hash",
        "role": "government",
        "is_active": True,
    })()

    class FakeQuery:
        def filter(self, _condition):
            return self

        def first(self):
            return user

    class FakeDatabase:
        def query(self, _model):
            return FakeQuery()

    monkeypatch.setattr(auth_api, "verify_password", lambda *_args: True)
    monkeypatch.setattr(auth_api, "create_access_token", lambda **_kwargs: "test-token")

    result = auth_api.login(
        UserLogin(username="officer@city.gov.in", password="demo-password"),
        FakeDatabase(),
    )

    assert result["username"] == "gov_officer"
    assert result["role"] == "government"
    assert result["access_token"] == "test-token"


def test_public_registration_cannot_create_government_account():
    with pytest.raises(UISBaseException) as exc_info:
        auth_api.register(
            UserRegister(
                username="new_officer",
                email="new-officer@example.com",
                password="secure-password",
                role="government",
            ),
            db=object(),
        )

    assert exc_info.value.status_code == 403

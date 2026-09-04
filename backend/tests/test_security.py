import pytest
from app.core.security import get_password_hash, verify_password, create_access_token
from jose import jwt
from app.core.config import settings

def test_password_hashing():
    password = "supersecretpassword"
    hashed = get_password_hash(password)
    
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_jwt_generation():
    subject = "user123"
    token = create_access_token(subject)
    
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded["sub"] == subject
    assert "exp" in decoded

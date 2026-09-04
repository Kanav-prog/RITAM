import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timezone, timedelta

# We mock dependencies to run unit tests without the live database
from app.main import app
from app.api.deps import get_db, get_current_user
from app.models.change_event import ChangeEvent
from app.models.project import Project
from app.models.mitigation_action import MitigationAction
from app.models.user import User, Role

class MockUser:
    id = uuid.uuid4()
    organization_id = uuid.uuid4()
    role = Role.AUTHORITY
    is_active = True

mock_user = MockUser()

class MockResult:
    def __init__(self, data):
        self.data = data
    def scalars(self):
        class Scalars:
            def __init__(self, data):
                self.data = data
            def first(self):
                return self.data[0] if self.data else None
            def all(self):
                return self.data
        return Scalars(self.data)

class MockSession:
    def __init__(self, change_events):
        self.change_events = change_events
        self.added = []
        self.committed = False

    async def execute(self, query, *args, **kwargs):
        # We simplify this and just return the change events for the test
        return MockResult(self.change_events)

    def add(self, obj):
        self.added.append(obj)

    async def commit(self):
        self.committed = True

async def override_get_current_user():
    return mock_user

@pytest.mark.asyncio
async def test_review_change_event_confirmed():
    change_id = str(uuid.uuid4())
    project_id = str(uuid.uuid4())
    
    # Mock change event
    mock_event = ChangeEvent()
    mock_event.id = change_id
    mock_event.project_id = project_id
    mock_event.status = "DETECTED"
    
    mock_session = MockSession([mock_event])
    
    async def override_get_db():
        yield mock_session
        
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    # Using ASGITransport to bypass networking
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            f"/api/v1/monitoring/{change_id}/review",
            json={"status": "CONFIRMED", "target_trees": 150}
        )
        
    assert response.status_code == 200
    assert response.json()["status"] == "CONFIRMED"
    
    # Verify the event was updated
    assert mock_event.status == "CONFIRMED"
    
    # Verify a MitigationAction was spawned
    assert len(mock_session.added) == 1
    action = mock_session.added[0]
    assert isinstance(action, MitigationAction)
    assert action.project_id == project_id
    assert action.target_quantity == 150
    assert action.status == "PLANNED"
    
    # Verify commit
    assert mock_session.committed is True

import pytest
from fastapi.testclient import TestClient
from main import app
from audit.engine import audit_layout

client = TestClient(app)


def test_empty_layout_engine():
    """Test 1: Engine handles empty layout with low score (0) and warning."""
    result = audit_layout(walls=[], doors=[], windows=[])
    assert result["score"] == 0
    assert len(result["warnings"]) > 0
    assert "Empty layout" in result["warnings"][0]
    assert result["passed"] is False


def test_incomplete_layout_engine():
    """Test 2: Engine handles incomplete layout (<4 walls, 0 doors, 0 windows)."""
    walls = [{"id": "w1", "x1": 0, "y1": 0, "x2": 100, "y2": 0}]
    result = audit_layout(walls=walls, doors=[], windows=[])
    assert result["score"] < 70
    assert any("Incomplete enclosure" in w or "wall" in w for w in result["warnings"])
    assert any("door" in w for w in result["warnings"])


def test_realistic_layout_engine():
    """Test 3: Engine handles realistic layout (4 walls, 1 door, 1 window)."""
    walls = [
        {"id": "w1", "x1": 0, "y1": 0, "x2": 100, "y2": 0},
        {"id": "w2", "x1": 100, "y1": 0, "x2": 100, "y2": 100},
        {"id": "w3", "x1": 100, "y1": 100, "x2": 0, "y2": 100},
        {"id": "w4", "x1": 0, "y1": 100, "x2": 0, "y2": 0},
    ]
    doors = [{"id": "d1", "x": 50, "y": 0}]
    windows = [{"id": "win1", "x": 50, "y": 100}]
    result = audit_layout(walls=walls, doors=doors, windows=windows)
    assert result["score"] == 100
    assert len(result["warnings"]) == 0
    assert result["passed"] is True


def test_audit_api_empty_layout():
    """Test 4: POST /api/audit with empty layout returns score 0 and warning."""
    response = client.post("/api/audit", json={"walls": [], "doors": [], "windows": []})
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 0
    assert len(data["warnings"]) > 0
    assert "Empty layout" in data["warnings"][0]


def test_audit_api_realistic_layout():
    """Test 5: POST /api/audit with realistic layout returns higher score and exact response shape."""
    payload = {
        "walls": [
            {"id": "w1", "x1": 0, "y1": 0, "x2": 100, "y2": 0},
            {"id": "w2", "x1": 100, "y1": 0, "x2": 100, "y2": 100},
            {"id": "w3", "x1": 100, "y1": 100, "x2": 0, "y2": 100},
            {"id": "w4", "x1": 0, "y1": 100, "x2": 0, "y2": 0},
        ],
        "doors": [{"id": "d1", "x": 50, "y": 0}],
        "windows": [{"id": "win1", "x": 50, "y": 100}],
    }
    response = client.post("/api/audit", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Verify exact required response shape keys
    assert "score" in data
    assert "warnings" in data
    assert "suggestions" in data
    assert "tips" in data
    assert "disclaimer" in data
    
    assert data["score"] == 100
    assert len(data["warnings"]) == 0
    assert isinstance(data["warnings"], list)
    assert isinstance(data["suggestions"], list)
    assert isinstance(data["tips"], list)
    assert isinstance(data["disclaimer"], str)


def test_audit_api_nested_layout():
    """Test 6: POST /api/audit with nested layout payload."""
    payload = {
        "layout": {
            "walls": [
                {"id": "w1", "x1": 0, "y1": 0, "x2": 100, "y2": 0},
                {"id": "w2", "x1": 100, "y1": 0, "x2": 100, "y2": 100},
                {"id": "w3", "x1": 100, "y1": 100, "x2": 0, "y2": 100},
                {"id": "w4", "x1": 0, "y1": 100, "x2": 0, "y2": 0},
            ],
            "doors": [{"id": "d1", "x": 50, "y": 0}],
            "windows": [{"id": "win1", "x": 50, "y": 100}],
        }
    }
    response = client.post("/api/audit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 100

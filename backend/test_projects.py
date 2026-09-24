import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_auth_and_projects_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register a new user
        import uuid
        email = f"test_user_{uuid.uuid4()}@example.com"
        reg_res = await ac.post(
            "/api/auth/register",
            json={"name": "Test User", "email": email, "password": "password123"},
        )
        assert reg_res.status_code == 201
        user_data = reg_res.json()
        assert user_data["email"] == email

        # 2. Login with registered user
        login_res = await ac.post(
            "/api/auth/login",
            json={"email": email, "password": "password123"},
        )
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data
        token = token_data["access_token"]

        headers = {"Authorization": f"Bearer {token}"}

        # 3. Create a project
        proj_res = await ac.post(
            "/api/projects",
            json={
                "name": "My Pytest Blueprint",
                "type": "Residential Design",
                "walls": [{"id": "w1", "x1": 0, "y1": 0, "x2": 100, "y2": 0}],
                "doors": [],
                "windows": [],
            },
            headers=headers,
        )
        assert proj_res.status_code == 201
        proj_data = proj_res.json()
        proj_id = proj_data["id"]
        assert proj_data["name"] == "My Pytest Blueprint"
        assert len(proj_data["walls"]) == 1

        # 4. List projects
        list_res = await ac.get("/api/projects", headers=headers)
        assert list_res.status_code == 200
        projects = list_res.json()
        assert any(p["id"] == proj_id for p in projects)

        # 5. Fetch project details
        get_res = await ac.get(f"/api/projects/{proj_id}", headers=headers)
        assert get_res.status_code == 200
        assert get_res.json()["id"] == proj_id

        # 6. Update project
        update_res = await ac.put(
            f"/api/projects/{proj_id}",
            json={"name": "Updated Blueprint Name"},
            headers=headers,
        )
        assert update_res.status_code == 200
        assert update_res.json()["name"] == "Updated Blueprint Name"

        # 7. Delete project
        del_res = await ac.delete(f"/api/projects/{proj_id}", headers=headers)
        assert del_res.status_code == 200

        # 8. Verify deletion
        get_after_del = await ac.get(f"/api/projects/{proj_id}", headers=headers)
        assert get_after_del.status_code == 404

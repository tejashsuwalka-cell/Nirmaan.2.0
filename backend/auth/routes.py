import uuid
from fastapi import APIRouter, HTTPException, status
from database import db
from auth.schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from auth.security import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister):
    email_clean = user.email.lower().strip()
    existing_user = await db.users.find_one({"email": email_clean})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(user.password)

    user_doc = {
        "_id": user_id,
        "id": user_id,
        "name": user.name.strip(),
        "email": email_clean,
        "password": hashed_pwd
    }

    await db.users.insert_one(user_doc)

    return UserResponse(
        id=user_id,
        name=user_doc["name"],
        email=email_clean
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    email_clean = credentials.email.lower().strip()
    user_doc = await db.users.find_one({"email": email_clean})
    if not user_doc or not verify_password(credentials.password, user_doc["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user_id = user_doc.get("id") or str(user_doc.get("_id"))
    access_token = create_access_token(data={"sub": user_id, "email": user_doc["email"]})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=user_doc["name"],
            email=user_doc["email"]
        )
    )


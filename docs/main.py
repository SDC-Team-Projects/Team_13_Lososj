from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
import os
import bcrypt

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_conn():
    return psycopg2.connect(DATABASE_URL)

class User(BaseModel):
    email: str
    password: str

@app.get("/")
def root():
    return {"message": "API is working"}

@app.post("/api/register")
def register(user: User):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="User exists")

    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())

    cur.execute(
        "INSERT INTO users (email, password) VALUES (%s, %s)",
        (user.email, hashed.decode())
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "User created"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import secrets
from dataclasses import dataclass

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=origins)
socket_app = socketio.ASGIApp(sio)

app = FastAPI()
app.mount("/", socket_app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def hello():
    return {"message": "hello world"}

@sio.event
async def message(sid, data):
    print(f"{sid} sent '{data}'")
    await sio.send("Server: Echo: " + data, to=sid)


# Rooms

@dataclass
class UserInfo:
    username: str
    room_id: str
    def __init__(self):
        self.username = ""
        self.room_id = ""

sid_to_user_info = {}

@sio.event
async def create_room(sid):
    print(f"{sid}: create room")
    room_id = await new_room_id()
    await join_room(sid, room_id)
    return room_id

async def new_room_id(length=8):
    id = secrets.token_hex(length)
    return id

@sio.event
async def set_username(sid, username, room_id):
    print(f"{sid}: set username")
    sid_to_user_info[sid].username = username
    await handle_member_list_change(room_id)

@sio.event
async def join_room(sid, room_id):
    print(f"{sid}: joined room {room_id}")
    sid_to_user_info[sid].room_id = room_id
    await sio.enter_room(sid, room_id)
    await handle_member_list_change(room_id)

async def get_room_members(room_id):
    member_ids = sio.manager.rooms.get("/", {}).get(room_id, set())
    members = [sid_to_user_info[id].username for id in member_ids]
    return members

async def handle_member_list_change(room_id):
    members = await get_room_members(room_id)
    await sio.emit("member_list_change", members, room=room_id);
    print(sid_to_user_info)

@sio.event
async def connect(sid, _):
    print(f"{sid}: connected")
    sid_to_user_info[sid] = UserInfo()

@sio.event
async def disconnect(sid):
    print(f"{sid}: disconnected")
    room_id = sid_to_user_info[sid].room_id

    client_rooms = sio.rooms(sid)
    for room in client_rooms:
        await sio.leave_room(sid, room)
    sid_to_user_info.pop(sid)
    await handle_member_list_change(room_id)

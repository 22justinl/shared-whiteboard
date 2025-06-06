from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import secrets
from dataclasses import dataclass
import json
import dotenv
import os

dotenv.load_dotenv()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.environ.get("FRONTEND_URL")
]

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=origins)
app = FastAPI()
socket_app = socketio.ASGIApp(sio)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "working"}

@app.get("/check")
async def hello():
    return {"sid_to_user_info": sid_to_user_info, "room_info": room_info}

app.mount("/", socket_app)

# Websockets

@dataclass
class UserInfo:
    username: str
    room_id: str
    def __init__(self):
        self.username = ""
        self.room_id = ""

@dataclass
class RoomInfo:
    drawing_data: list[str]
    drawing_data_json: str
    num_members: int
    def __init__(self):
        self.drawing_data = []
        self.num_members = 0
    def set_drawing_data(self, new_data):
        self.drawing_data = new_data
        self.drawing_data_json = json.dumps(self.drawing_data)
    def append_drawing_data(self, change):
        self.drawing_data.append(change)
        self.drawing_data_json = json.dumps(self.drawing_data)

sid_to_user_info = {}
room_info = {}

@sio.event
async def create_room_and_join(sid, data: dict):
    room_id = await new_room_id()
    room_info[room_id] = RoomInfo()

    sid_to_user_info[sid].room_id = room_id
    room_info[room_id].num_members += 1
    await sio.enter_room(sid, room_id)
    await handle_member_list_change(room_id)

    if ('drawing_data' in data):
        room_info[room_id].set_drawing_data(json.loads(data['drawing_data']))

    return room_id

async def new_room_id(length=8):
    id = secrets.token_hex(length)
    return id

@sio.event
async def set_username(sid, username, room_id):
    sid_to_user_info[sid].username = username
    await handle_member_list_change(room_id)

@sio.event
async def join_room(sid, room_id):
    print(f"{sid}: joined room {room_id}")
    sid_to_user_info[sid].room_id = room_id
    room_info[room_id].num_members += 1
    await sio.enter_room(sid, room_id)
    await handle_member_list_change(room_id)
    return {"drawing_data": room_info[room_id].drawing_data_json};

@sio.event
async def send_change(sid, change):
    room_id = sid_to_user_info[sid].room_id
    room_info[room_id].append_drawing_data(change)
    await sio.emit("drawing_changed", {"change": change}, room=room_id, skip_sid=sid)

@sio.event
async def reset_room_drawing(sid):
    room_id = sid_to_user_info[sid].room_id
    room_info[room_id].set_drawing_data([])
    await sio.emit("reset_drawing", room=room_id, skip_sid=sid)

async def get_room_member_ids(room_id):
    member_ids = sio.manager.rooms.get("/", {}).get(room_id, set())
    return member_ids

async def get_room_members(room_id):
    member_ids = await get_room_member_ids(room_id)
    members = [sid_to_user_info[id].username for id in member_ids]
    return members

async def handle_member_list_change(room_id):
    members = await get_room_members(room_id)
    await sio.emit("member_list_change", members, room=room_id);

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
        if room in room_info:
            room_info[room].num_members -= 1
            if room_info[room].num_members <= 0:
                room_info.pop(room)
    sid_to_user_info.pop(sid)
    await handle_member_list_change(room_id)


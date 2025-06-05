import socketio
import requests

sio = socketio.Client()

@sio.event
def connect():
    print("connection established")

@sio.event
def sendMessage(data):
    print(f"send {data}")

@sio.event
def disconnect():
    print("disconnected")

sio.connect("http://localhost:8000")
sio.wait()
sio.send("amogus")

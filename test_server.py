from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'test'

# Test: Simple gevent initialization
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')

@app.route('/')
def index():
    return "Test Server Running!"

if __name__ == '__main__':
    print("Starting test server on http://localhost:8082...")
    socketio.run(app, host='0.0.0.0', port=8082, debug=False, allow_unsafe_werkzeug=True)

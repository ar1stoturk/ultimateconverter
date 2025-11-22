import os
import threading
import uuid
import time
import json
import subprocess
import sys
import shutil
import psutil
from flask import Flask, render_template, request, send_file, jsonify, url_for, send_from_directory
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
import ffmpeg
from PIL import Image, ImageFilter
import yt_dlp
from pypdf import PdfWriter, PdfReader
from pdf2docx import Converter
import pytesseract
from fake_useragent import UserAgent
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Configuration
UPLOAD_FOLDER = 'uploads'
DOWNLOAD_FOLDER = 'downloads'
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav', 'mp4', 'avi', 'mov', 'mkv', 'flac', 'docx', 'zip', 'rar', 'webp', 'ico', 'ogg', 'm4a',
    'wma', 'aac', 'opus', 'flv', 'wmv', '3gp', 'ts', 'bmp', 'tiff', 'tif'
}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['DOWNLOAD_FOLDER'] = DOWNLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024 * 1024  # 2GB limit
app.config['SECRET_KEY'] = 'secret!'

# Initialize SocketIO - Auto-detect best async mode
socketio = SocketIO(app, cors_allowed_origins="*")

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

def cleanup_files(file_paths, delay=0):
    """Deletes files. If delay is 0, deletes immediately. If delay > 0, waits then deletes."""
    def delete():
        if delay > 0:
            time.sleep(delay)
        for path in file_paths:
            try:
                if os.path.exists(path):
                    for i in range(3):
                        try:
                            os.remove(path)
                            print(f"Deleted: {path}")
                            break
                        except PermissionError:
                            time.sleep(1)
            except Exception as e:
                print(f"Error deleting {path}: {e}")
    
    if delay > 0:
        threading.Thread(target=delete, daemon=True).start()
    else:
        delete()

def get_unique_filename(filename):
    ext = os.path.splitext(filename)[1]
    name = str(uuid.uuid4())
    return f"{name}{ext}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({"status": "ok", "message": "System operational"})

@app.route('/api/system/stats')
def system_stats():
    cpu = psutil.cpu_percent(interval=None)
    ram = psutil.virtual_memory().percent
    return jsonify({"cpu": cpu, "ram": ram})

@app.route('/download/<filename>')
def download_file(filename):
    file_path = os.path.join(app.config['DOWNLOAD_FOLDER'], filename)
    cleanup_files([file_path], delay=10)
    return send_file(file_path, as_attachment=True)

# --- SocketIO Progress Helper ---
def emit_progress(socket_id, percent, status):
    if socket_id:
        socketio.emit('progress_update', {'percent': percent, 'status': status}, room=socket_id)

# --- Audio Conversion ---
@app.route('/api/convert/audio', methods=['POST'])
def convert_audio():
    socket_id = request.form.get('socket_id')
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    target_format = request.form.get('format', 'mp3')
    bitrate = request.form.get('bitrate', '192k')
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    input_filename = get_unique_filename(file.filename)
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], input_filename)
    file.save(input_path)

    output_filename = f"{os.path.splitext(input_filename)[0]}.{target_format}"
    output_path = os.path.join(app.config['DOWNLOAD_FOLDER'], output_filename)

    try:
        emit_progress(socket_id, 20, "Processing Audio...")
        stream = ffmpeg.input(input_path)
        stream = ffmpeg.output(stream, output_path, audio_bitrate=bitrate)
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)
        
        emit_progress(socket_id, 100, "Done!")
        cleanup_files([input_path], delay=0)
        return jsonify({
            "message": "Conversion successful",
            "download_url": url_for('download_file', filename=output_filename)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Video Conversion ---
@app.route('/api/convert/video', methods=['POST'])
def convert_video():
    socket_id = request.form.get('socket_id')
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    target_format = request.form.get('format', 'mp4')
    resolution = request.form.get('resolution', 'original')
    fps = request.form.get('fps', 'original')
    mute = request.form.get('mute', 'false') == 'true'
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    input_filename = get_unique_filename(file.filename)
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], input_filename)
    file.save(input_path)

    output_filename = f"{os.path.splitext(input_filename)[0]}.{target_format}"
    output_path = os.path.join(app.config['DOWNLOAD_FOLDER'], output_filename)

    try:
        emit_progress(socket_id, 10, "Analyzing Video...")
        stream = ffmpeg.input(input_path)
        
        output_args = {}
        if resolution != 'original':
             output_args['s'] = resolution
        if fps != 'original':
             output_args['r'] = fps
        if mute:
             output_args['an'] = None
        
        emit_progress(socket_id, 30, "Converting...")
        stream = ffmpeg.output(stream, output_path, **output_args)
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)
        
        emit_progress(socket_id, 100, "Done!")
        cleanup_files([input_path], delay=0)
        return jsonify({
            "message": "Conversion successful",
            "download_url": url_for('download_file', filename=output_filename)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Image Conversion ---
@app.route('/api/convert/image', methods=['POST'])
def convert_image():
    socket_id = request.form.get('socket_id')
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    target_format = request.form.get('format', 'png').lower()
    resize_width = request.form.get('width', '')
    resize_height = request.form.get('height', '')
    quality = int(request.form.get('quality', 90))
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    input_filename = get_unique_filename(file.filename)
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], input_filename)
    file.save(input_path)

    output_filename = f"{os.path.splitext(input_filename)[0]}.{target_format}"
    output_path = os.path.join(app.config['DOWNLOAD_FOLDER'], output_filename)

    try:
        emit_progress(socket_id, 20, "Loading Image...")
        img = Image.open(input_path)
            
        if resize_width and resize_height:
            emit_progress(socket_id, 40, "Resizing...")
            img = img.resize((int(resize_width), int(resize_height)), Image.Resampling.LANCZOS)
        
        emit_progress(socket_id, 60, "Saving...")
        if target_format == 'pdf':
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.save(output_path, "PDF", resolution=100.0)
        elif target_format == 'ico':
             img.save(output_path, format='ICO', sizes=[(256, 256)])
        else:
            if target_format in ['jpg', 'jpeg', 'bmp'] and img.mode == 'RGBA':
                img = img.convert('RGB')
            
            save_args = {}
            if target_format in ['jpg', 'jpeg', 'webp']:
                save_args['quality'] = quality
                
            img.save(output_path, **save_args)
        
        emit_progress(socket_id, 100, "Done!")
        cleanup_files([input_path], delay=0)
        return jsonify({
            "message": "Conversion successful",
            "download_url": url_for('download_file', filename=output_filename)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Settings & System ---
@app.route('/api/settings/permanent', methods=['POST'])
def make_permanent():
    try:
        cwd = os.getcwd()
        bat_path = os.path.join(cwd, "baslat.bat")
        
        # Get Windows Startup Folder
        startup_folder = os.path.join(os.getenv('APPDATA'), r'Microsoft\Windows\Start Menu\Programs\Startup')
        vbs_path = os.path.join(startup_folder, "UltimateConverter_AutoStart.vbs")
        
        with open(vbs_path, "w") as f:
            f.write(f'CreateObject("Wscript.Shell").Run "{bat_path}", 0, True')
            
        return jsonify({"message": f"Permanent mode activated! Script saved to Startup folder."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/settings/create-exe', methods=['POST'])
def create_exe():
    try:
        cmd = [
            "pyinstaller", "--noconfirm", "--onefile", "--windowed",
            "--name", "UltimateConverter",
            "--add-data", "templates;templates",
            "--add-data", "static;static",
            "altyapi.py"
        ]
        subprocess.Popen(cmd)
        return jsonify({"message": "EXE creation started."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- SSL Certificate Generation ---
def generate_self_signed_cert():
    """Generates a self-signed certificate if one doesn't exist."""
    if not os.path.exists("cert.pem") or not os.path.exists("key.pem"):
        print("Generating self-signed SSL certificate...")
        try:
            from OpenSSL import crypto
            
            k = crypto.PKey()
            k.generate_key(crypto.TYPE_RSA, 2048)

            cert = crypto.X509()
            cert.get_subject().C = "TR"
            cert.get_subject().ST = "Istanbul"
            cert.get_subject().L = "Istanbul"
            cert.get_subject().O = "UltimateConverter"
            cert.get_subject().OU = "Dev"
            cert.get_subject().CN = "localhost"
            cert.set_serial_number(1000)
            cert.gmtime_adj_notBefore(0)
            cert.gmtime_adj_notAfter(10*365*24*60*60)
            cert.set_issuer(cert.get_subject())
            cert.set_pubkey(k)
            cert.sign(k, 'sha256')

            with open("cert.pem", "wb") as f:
                f.write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
            with open("key.pem", "wb") as f:
                f.write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))
                
            print("Certificate generated successfully.")
            return True
        except ImportError:
            print("Error: pyopenssl not installed. Cannot generate certificate.")
            return False
        except Exception as e:
            print(f"Error generating certificate: {e}")
            return False
    return True

if __name__ == '__main__':
    print("="*50)
    print("Starting ULTIMATE CONVERTER PRO")
    print("Server: http://localhost:8081")
    print("="*50)
    socketio.run(app, host='0.0.0.0', port=8081, debug=True)
```

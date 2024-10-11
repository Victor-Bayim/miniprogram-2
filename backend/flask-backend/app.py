import json
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # 启用 WebSocket 并允许跨域

UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 加载用户数据
def load_users():
    try:
        with open('users.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

# 加载项目数据
def load_projects():
    try:
        with open('projects.json', 'r', encoding='utf-8') as f:
            projects = json.load(f)
            return projects if projects else []  # 返回空数组以避免前端错误
    except FileNotFoundError:
        return []

# 保存项目数据
def save_projects(projects):
    with open('projects.json', 'w', encoding='utf-8') as f:
        json.dump(projects, f, ensure_ascii=False, indent=4)

# WebSocket 聊天功能
messages = []  # 聊天消息的历史存储

@socketio.on('connect')
def handle_connect():
    print('客户端已连接')
    emit('message_history', messages)  # 发送消息历史给新连接的客户端

@socketio.on('send_message')
def handle_send_message(data):
    print(f'收到消息: {data}')
    messages.append(data)  # 保存新消息
    emit('receive_message', data, broadcast=True)  # 广播消息给所有客户端

@socketio.on('disconnect')
def handle_disconnect():
    print('客户端已断开连接')

# 登录接口
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    users = load_users()

    if username in users and users[username] == password:
        return jsonify({'success': True, 'message': '登录成功'}), 200
    else:
        return jsonify({'success': False, 'message': '学号/工号或密码错误'}), 401

# 创建项目接口
@app.route('/api/projects', methods=['POST'])
def create_project():
    projects = load_projects()
    name = request.form.get('name')
    description = request.form.get('description')
    startDate = request.form.get('startDate')
    endDate = request.form.get('endDate')
    members = json.loads(request.form.get('members'))

    # 处理图片
    image = request.files.get('image')
    if image:
        image_path = f'./uploads/{secure_filename(image.filename)}'
        image.save(image_path)
    else:
        image_path = None

    new_project = {
        'id': len(projects) + 1,
        'name': name,
        'description': description,
        'startDate': startDate,
        'endDate': endDate,
        'image': image_path,
        'members': members
    }
    projects.append(new_project)
    save_projects(projects)

    return jsonify({'success': True, 'message': '项目创建成功', 'project': new_project}), 201

# 获取项目列表接口
@app.route('/api/projects', methods=['GET'])
def get_projects():
    projects = load_projects()
    print("返回的项目数据：", projects)  # 调试用，查看后端返回的数据结构
    return jsonify(projects), 200

# 删除项目接口
@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    projects = load_projects()
    projects = [project for project in projects if project['id'] != project_id]
    save_projects(projects)
    return jsonify({'success': True, 'message': '项目已删除'}), 200

# 更新项目接口
@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    projects = load_projects()
    updated_data = request.json
    for project in projects:
        if project['id'] == project_id:
            project.update(updated_data)
            save_projects(projects)
            return jsonify({'success': True, 'message': '项目已更新', 'project': project}), 200
    return jsonify({'success': False, 'message': '项目未找到'}), 404

# 用户注册接口
@app.route('/api/register', methods=['POST'])
def register():
    users = load_users()
    new_user = request.json
    if new_user['username'] in users:
        return jsonify({'success': False, 'message': '用户名已存在'}), 409
    users[new_user['username']] = new_user['password']
    with open('users.json', 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=4)
    return jsonify({'success': True, 'message': '注册成功'}), 201

# 获取用户信息接口
@app.route('/api/user/<username>', methods=['GET'])
def get_user(username):
    users = load_users()
    if username in users:
        return jsonify({'username': username}), 200
    return jsonify({'message': '用户不存在'}), 404

# 注销接口
@app.route('/api/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': '用户已注销'}), 200

# 文件上传接口
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': '没有选择文件'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': '文件名为空'}), 400
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    return jsonify({'message': '文件上传成功', 'file_url': f'/uploads/{filename}'}), 201

# 获取联系人列表接口
@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    try:
        with open('contacts.json', 'r', encoding='utf-8') as f:
            contacts = json.load(f)
        return jsonify(contacts), 200
    except FileNotFoundError:
        return jsonify([]), 200

# 获取聊天记录接口
@app.route('/api/chat-history/<contact_id>', methods=['GET'])
def get_chat_history(contact_id):
    try:
        with open(f'chat_history_{contact_id}.json', 'r', encoding='utf-8') as f:
            chat_history = json.load(f)
        return jsonify(chat_history), 200
    except FileNotFoundError:
        return jsonify([]), 200

# 启动 Flask 和 WebSocket 服务
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

/* ============================================================
 * 津劳智导 - 完整后端服务器 v2.1（纯文件存储版，无需编译）
 * 功能：用户注册登录（学生/老师/管理员）、文件上传收发、
 *       老师批改打分、管理员后台、数据导入导出
 * 启动：node server.js
 * 访问：http://localhost:3020
 * ============================================================ */
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3020;

// ========== 数据存储（JSON文件） ==========
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const FILES_FILE = path.join(DATA_DIR, 'files.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// 确保目录存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 读取数据
function readJSON(file, defaultValue) {
  try {
    if (!fs.existsSync(file)) return defaultValue;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    return defaultValue;
  }
}

// 写入数据
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// 初始化默认管理员
function initAdmin() {
  const users = readJSON(USERS_FILE, []);
  if (!users.find(u => u.username === 'admin')) {
    const hash = bcrypt.hashSync('admin123', 10);
    users.push({
      id: 1,
      username: 'admin',
      password: hash,
      role: 'admin',
      name: '系统管理员',
      grade: '',
      major: '',
      phone: '',
      email: '',
      student_id: '',
      teacher_title: '',
      status: 'active',
      created_at: new Date().toISOString()
    });
    writeJSON(USERS_FILE, users);
    console.log('✅ 默认管理员已创建：admin / admin123');
  }
}
initAdmin();

// 自增ID
function nextId(arr) {
  return arr.length > 0 ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

// ========== 中间件 ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'jinlao-zhidao-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// 静态文件
app.use(express.static(__dirname));

// ========== 文件上传配置 ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.session.user ? req.session.user.id : 'temp';
    const userDir = path.join(UPLOAD_DIR, String(userId));
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '_' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB
});

// ========== 登录验证中间件 ==========
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: '请先登录' });
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: '请先登录' });
    if (req.session.user.role !== role) return res.status(403).json({ error: '没有权限' });
    next();
  };
}

// 脱敏用户信息（不返回密码）
function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// ========== 用户API ==========

// 注册
app.post('/api/register', (req, res) => {
  const { username, password, role, name, grade, major, phone, email, student_id, teacher_title, class_name, teaches_classes } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: '请填写必填项' });
  if (password.length < 6) return res.status(400).json({ error: '密码至少6位' });
  if (!['student', 'teacher'].includes(role)) return res.status(400).json({ error: '无效的角色' });

  const users = readJSON(USERS_FILE, []);
  if (users.find(u => u.username === username)) return res.status(400).json({ error: '用户名已存在' });

  const hash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: nextId(users),
    username, password: hash, role, name,
    grade: grade || '',
    major: major || '',
    phone: phone || '',
    email: email || '',
    student_id: student_id || '',
    teacher_title: teacher_title || '',
    class_name: class_name || '',
    teaches_classes: Array.isArray(teaches_classes) ? teaches_classes : [],
    status: 'active',
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  writeJSON(USERS_FILE, users);
  res.json({ success: true, message: '注册成功' });
});

// 登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '请输入用户名和密码' });

  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: '用户名或密码错误' });
  if (user.status !== 'active') return res.status(403).json({ error: '账号已被禁用，请联系管理员' });

  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: '用户名或密码错误' });

  req.session.user = sanitizeUser(user);
  res.json({ success: true, user: sanitizeUser(user) });
});

// 登出
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// 获取当前用户
app.get('/api/me', requireLogin, (req, res) => {
  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => u.id === req.session.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json({ user: sanitizeUser(user) });
});

// 修改密码
app.post('/api/change-password', requireLogin, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: '请填写密码' });
  if (newPassword.length < 6) return res.status(400).json({ error: '新密码至少6位' });

  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => u.id === req.session.user.id);
  if (!bcrypt.compareSync(oldPassword, user.password)) return res.status(400).json({ error: '原密码错误' });

  user.password = bcrypt.hashSync(newPassword, 10);
  writeJSON(USERS_FILE, users);
  res.json({ success: true });
});

// 获取老师列表
app.get('/api/teachers', requireLogin, (req, res) => {
  const { search, class_name, all } = req.query;
  const users = readJSON(USERS_FILE, []);
  let teachers = users.filter(u => u.role === 'teacher' && u.status === 'active');

  // 如果指定了班级，只显示教这个班的老师
  if (class_name && !all) {
    teachers = teachers.filter(t =>
      Array.isArray(t.teaches_classes) && t.teaches_classes.includes(class_name)
    );
  }

  // 搜索老师名字
  if (search) {
    const keyword = search.toLowerCase();
    teachers = teachers.filter(t =>
      t.name.toLowerCase().includes(keyword) ||
      t.username.toLowerCase().includes(keyword) ||
      (t.teacher_title && t.teacher_title.toLowerCase().includes(keyword))
    );
  }

  res.json({ teachers: teachers.map(sanitizeUser) });
});

// ========== 文件API ==========

// 上传文件
app.post('/api/upload', requireLogin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '请选择文件' });

  const files = readJSON(FILES_FILE, []);
  const newFile = {
    id: nextId(files),
    original_name: req.file.originalname,
    stored_name: req.file.filename,
    file_path: req.file.path,
    file_size: req.file.size,
    mime_type: req.file.mimetype,
    sender_id: req.session.user.id,
    receiver_id: null,
    description: '',
    status: 'pending', // pending待批改, reviewed已批改
    score: null,
    comment: '',
    created_at: new Date().toISOString(),
    reviewed_at: null
  };
  files.push(newFile);
  writeJSON(FILES_FILE, files);
  res.json({ success: true, fileId: newFile.id });
});

// 发送文件给老师
app.post('/api/send-file', requireLogin, (req, res) => {
  const { file_id, receiver_id, description } = req.body;
  if (!file_id || !receiver_id) return res.status(400).json({ error: '参数不完整' });

  const files = readJSON(FILES_FILE, []);
  const file = files.find(f => f.id === file_id);
  if (!file) return res.status(404).json({ error: '文件不存在' });
  if (file.sender_id !== req.session.user.id) return res.status(403).json({ error: '不是你的文件' });

  const users = readJSON(USERS_FILE, []);
  const receiver = users.find(u => u.id === receiver_id);
  if (!receiver || receiver.role !== 'teacher') return res.status(400).json({ error: '接收者不是有效老师' });

  file.receiver_id = receiver_id;
  file.description = description || '';
  file.status = 'pending';
  writeJSON(FILES_FILE, files);
  res.json({ success: true });
});

// 我发送的文件（学生）
app.get('/api/my-files', requireLogin, (req, res) => {
  const files = readJSON(FILES_FILE, []);
  const users = readJSON(USERS_FILE, []);
  const myFiles = files.filter(f => f.sender_id === req.session.user.id).map(f => {
    const receiver = users.find(u => u.id === f.receiver_id);
    return { ...f, receiver_name: receiver ? receiver.name : null };
  });
  res.json({ files: myFiles });
});

// 我收到的文件（老师）
app.get('/api/received-files', requireLogin, (req, res) => {
  const files = readJSON(FILES_FILE, []);
  const users = readJSON(USERS_FILE, []);
  const received = files.filter(f => f.receiver_id === req.session.user.id).map(f => {
    const sender = users.find(u => u.id === f.sender_id);
    return {
      ...f,
      sender_name: sender ? sender.name : null,
      grade: sender ? sender.grade : '',
      major: sender ? sender.major : ''
    };
  });
  res.json({ files: received });
});

// 下载文件（权限校验）
app.get('/api/download/:id', requireLogin, (req, res) => {
  const fileId = parseInt(req.params.id);
  const files = readJSON(FILES_FILE, []);
  const file = files.find(f => f.id === fileId);
  if (!file) return res.status(404).json({ error: '文件不存在' });

  // 权限：发送者、接收者、管理员可以下载
  const userId = req.session.user.id;
  const isAdmin = req.session.user.role === 'admin';
  if (file.sender_id !== userId && file.receiver_id !== userId && !isAdmin) {
    return res.status(403).json({ error: '没有权限下载' });
  }

  if (!fs.existsSync(file.file_path)) return res.status(404).json({ error: '文件已被删除' });
  res.download(file.file_path, file.original_name);
});

// 老师批改打分
app.post('/api/review', requireRole('teacher'), (req, res) => {
  const { file_id, score, comment } = req.body;
  if (!file_id || score === undefined) return res.status(400).json({ error: '参数不完整' });
  if (score < 0 || score > 100) return res.status(400).json({ error: '分数必须在0-100之间' });

  const files = readJSON(FILES_FILE, []);
  const file = files.find(f => f.id === file_id);
  if (!file) return res.status(404).json({ error: '文件不存在' });
  if (file.receiver_id !== req.session.user.id) return res.status(403).json({ error: '不是发给你的文件' });

  file.score = score;
  file.comment = comment || '';
  file.status = 'reviewed';
  file.reviewed_at = new Date().toISOString();
  writeJSON(FILES_FILE, files);
  res.json({ success: true });
});

// ========== 管理员API ==========

// 统计数据
app.get('/api/admin/stats', requireRole('admin'), (req, res) => {
  const users = readJSON(USERS_FILE, []);
  const files = readJSON(FILES_FILE, []);
  const stats = {
    totalUsers: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    totalFiles: files.length,
    pendingFiles: files.filter(f => f.status === 'pending').length,
    reviewedFiles: files.filter(f => f.status === 'reviewed').length,
    totalSize: files.reduce((sum, f) => sum + (f.file_size || 0), 0)
  };
  res.json({ stats });
});

// 所有用户列表
app.get('/api/admin/users', requireRole('admin'), (req, res) => {
  const users = readJSON(USERS_FILE, []).map(sanitizeUser);
  res.json({ users });
});

// 禁用/启用用户
app.post('/api/admin/toggle-user', requireRole('admin'), (req, res) => {
  const { user_id, status } = req.body;
  if (!user_id || !['active', 'disabled'].includes(status)) return res.status(400).json({ error: '参数错误' });

  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => u.id === user_id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  if (user.role === 'admin') return res.status(400).json({ error: '不能操作管理员账号' });

  user.status = status;
  writeJSON(USERS_FILE, users);
  res.json({ success: true });
});

// 所有文件记录
app.get('/api/admin/files', requireRole('admin'), (req, res) => {
  const files = readJSON(FILES_FILE, []);
  const users = readJSON(USERS_FILE, []);
  const result = files.map(f => {
    const sender = users.find(u => u.id === f.sender_id);
    const receiver = users.find(u => u.id === f.receiver_id);
    return {
      ...f,
      sender_name: sender ? sender.name : null,
      receiver_name: receiver ? receiver.name : null
    };
  });
  res.json({ files: result });
});

// 导出用户Excel
app.get('/api/admin/export-users', requireRole('admin'), (req, res) => {
  const users = readJSON(USERS_FILE, []);
  const rows = users.map(u => ({
    'ID': u.id,
    '用户名': u.username,
    '角色': u.role === 'student' ? '学生' : u.role === 'teacher' ? '老师' : '管理员',
    '姓名': u.name,
    '年级': u.grade,
    '专业': u.major,
    '学号': u.student_id,
    '职称': u.teacher_title,
    '手机号': u.phone,
    '邮箱': u.email,
    '状态': u.status === 'active' ? '正常' : '禁用',
    '注册时间': new Date(u.created_at).toLocaleString('zh-CN')
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '用户列表');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=用户列表.xlsx');
  res.send(buf);
});

// 导出文件记录Excel
app.get('/api/admin/export-files', requireRole('admin'), (req, res) => {
  const files = readJSON(FILES_FILE, []);
  const users = readJSON(USERS_FILE, []);
  const rows = files.map(f => {
    const sender = users.find(u => u.id === f.sender_id);
    const receiver = users.find(u => u.id === f.receiver_id);
    return {
      'ID': f.id,
      '文件名': f.original_name,
      '文件大小': (f.file_size / 1024 / 1024).toFixed(2) + ' MB',
      '发送者': sender ? sender.name : '-',
      '接收者': receiver ? receiver.name : '-',
      '状态': f.status === 'pending' ? '待批改' : '已批改',
      '分数': f.score !== null ? f.score : '-',
      '评语': f.comment || '',
      '上传时间': new Date(f.created_at).toLocaleString('zh-CN'),
      '批改时间': f.reviewed_at ? new Date(f.reviewed_at).toLocaleString('zh-CN') : '-'
    };
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '文件记录');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=文件记录.xlsx');
  res.send(buf);
});

// ========== 页面路由 ==========
app.get('/portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'portal.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== 启动服务器 ==========
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  津劳智导 - 完整系统已启动');
  console.log('========================================');
  console.log(`  主页：    http://localhost:${PORT}`);
  console.log(`  用户中心：http://localhost:${PORT}/portal`);
  console.log('========================================');
  console.log('  默认管理员：admin / admin123');
  console.log('  （请登录后立即修改密码！）');
  console.log('========================================');
  console.log('  按 Ctrl+C 停止服务器');
  console.log('========================================');
});

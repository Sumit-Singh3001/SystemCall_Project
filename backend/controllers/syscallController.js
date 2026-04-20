const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../middleware/db');

// GET /system-calls - list available system calls
const getSystemCalls = (req, res) => {
  try {
    const syscalls = readDB('systemCalls.json');
    const userRole = req.user.role;

    // Filter based on user role — show all but mark restricted ones
    const filtered = syscalls.map(sc => ({
      ...sc,
      accessible: sc.allowedRoles.includes(userRole)
    }));

    res.json({ systemCalls: filtered });
  } catch (err) {
    console.error('Error fetching system calls:', err);
    res.status(500).json({ error: 'Failed to load system calls.', code: 'SERVER_ERROR' });
  }
};

// POST /system-calls/execute - execute a system call
const executeSystemCall = (req, res) => {
  try {
    const { syscallKey, params } = req.body;
    const user = req.user;

    // Validate required fields
    if (!syscallKey) {
      return res.status(400).json({ error: 'syscallKey is required.', code: 'MISSING_FIELDS' });
    }

    const syscalls = readDB('systemCalls.json');
    const syscall = syscalls.find(sc => sc.key === syscallKey);

    // Check if system call exists
    if (!syscall) {
      logAction(user, syscallKey, params, 'FAILED', 'Unknown system call');
      return res.status(404).json({ error: 'System call not found.', code: 'NOT_FOUND' });
    }

    // Permission check
    if (!syscall.allowedRoles.includes(user.role)) {
      logAction(user, syscallKey, params, 'FAILED', 'Insufficient permissions');
      return res.status(403).json({ 
        error: `Access denied. '${syscall.name}' requires ${syscall.allowedRoles.join(' or ')} role.`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Validate required params
    if (syscall.params) {
      for (const paramDef of syscall.params) {
        if (paramDef.required && (!params || !params[paramDef.name])) {
          logAction(user, syscallKey, params, 'FAILED', `Missing param: ${paramDef.name}`);
          return res.status(400).json({ 
            error: `Required parameter '${paramDef.label}' is missing.`,
            code: 'MISSING_PARAM'
          });
        }
      }
    }

    // Simulate the system call execution
    const result = simulateExecution(syscall, params, user);

    // Log successful execution
    logAction(user, syscallKey, params, 'SUCCESS', null, result);

    res.json({
      message: `${syscall.name} executed successfully.`,
      syscall: syscall.name,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Execute error:', err);
    res.status(500).json({ error: 'Execution failed due to server error.', code: 'SERVER_ERROR' });
  }
};

// Simulate system call execution and return a realistic result
const simulateExecution = (syscall, params, user) => {
  const now = new Date();
  switch (syscall.key) {
    case 'FILE_READ':
      return {
        path: params.path,
        content: `# Simulated File Content\nFile: ${params.path}\nRead at: ${now.toISOString()}\nOwner: ${user.username}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\nFile size: ${Math.floor(Math.random() * 10000)} bytes`,
        permissions: '-rw-r--r--',
        inode: Math.floor(Math.random() * 999999),
        size: Math.floor(Math.random() * 10000)
      };

    case 'FILE_WRITE':
      return {
        path: params.path,
        bytesWritten: Buffer.byteLength(params.content || '', 'utf8'),
        permissions: '-rw-r--r--',
        inode: Math.floor(Math.random() * 999999),
        message: 'File written successfully'
      };

    case 'PROCESS_CREATE':
      const pid = Math.floor(Math.random() * 60000) + 1000;
      return {
        pid,
        processName: params.processName,
        priority: params.priority,
        state: 'RUNNING',
        memoryUsage: `${Math.floor(Math.random() * 512)}MB`,
        cpuUsage: `${(Math.random() * 5).toFixed(1)}%`,
        startedAt: now.toISOString()
      };

    case 'PROCESS_KILL':
      return {
        pid: parseInt(params.pid),
        signal: 'SIGTERM',
        status: 'TERMINATED',
        exitCode: 0,
        terminatedAt: now.toISOString()
      };

    case 'MEMORY_ALLOC':
      const addr = '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
      return {
        address: addr,
        sizeKB: parseInt(params.size),
        type: 'heap',
        status: 'ALLOCATED',
        protections: 'RW'
      };

    case 'NETWORK_SOCKET':
      return {
        socketFd: Math.floor(Math.random() * 200) + 3,
        host: params.host,
        port: parseInt(params.port),
        protocol: 'TCP',
        state: 'ESTABLISHED',
        localPort: Math.floor(Math.random() * 20000) + 40000
      };

    default:
      return { message: 'System call executed.' };
  }
};

// Helper: write a log entry to logs.json
const logAction = (user, action, params, status, errorMsg = null, result = null) => {
  try {
    const logs = readDB('logs.json');
    const entry = {
      id: uuidv4(),
      userId: user.id,
      username: user.username,
      role: user.role,
      action,
      params: params || {},
      status, // 'SUCCESS' | 'FAILED'
      error: errorMsg,
      result: result ? JSON.stringify(result).substring(0, 200) : null,
      timestamp: new Date().toISOString()
    };
    logs.unshift(entry); // Newest first
    // Keep only latest 1000 logs
    if (logs.length > 1000) logs.splice(1000);
    writeDB('logs.json', logs);
  } catch (err) {
    console.error('Failed to write log:', err.message);
  }
};

module.exports = { getSystemCalls, executeSystemCall };

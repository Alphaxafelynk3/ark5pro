require('dotenv').config();
const express = require('express');
const fs = require('fs').promises; // Use promises for async file operations
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 6052;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(bodyParser.json());
app.use(express.static('uploads'));
app.use(express.static('public'));

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
    next();
});

// Ensure data file exists
const ensureDataFileExists = async () => {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
    }
};

// Load user data
const loadUsers = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data).users || [];
    } catch (err) {
        console.error("Error reading users:", err);
        return [];
    }
};

// Save user data
const saveUsers = async (users) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify({ users }, null, 2));
    } catch (err) {
        console.error("Error saving users:", err);
    }
};

// Middleware to verify Admin token
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") return res.status(403).json({ message: "Forbidden" });
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// ✅ **Register User Route with Referral System**
app.post('/register', async (req, res) => {
    const { email, password, referralCode } = req.body;
    let users = await loadUsers();

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
        email, 
        password: hashedPassword, 
        wallet: 500, 
        referralCode: Math.random().toString(36).substring(2, 8), 
        referredBy: referralCode || null 
    };

    users.push(newUser);

    // Reward referrer if referralCode is valid
    if (referralCode) {
        let referrer = users.find(user => user.referralCode === referralCode);
        if (referrer) {
            referrer.wallet += 100; // Reward the referrer with 100 units
        }
    }

    await saveUsers(users);
    res.status(201).json({ message: "User registered successfully", referralCode: newUser.referralCode });
});

// ✅ **Login User Route**
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    let users = await loadUsers();

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ email, role: "user" }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token, wallet: user.wallet });
});

// ✅ **Admin Login Route**
app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    let users = await loadUsers();

    console.log("Login attempt for:", email); // Debugging statement
    const user = users.find(user => user.email === email && user.role === "admin");
    if (!user) {
        console.log("User not found or not an admin"); // Debugging statement
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid); // Debugging statement
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
    console.log("Token generated:", token); // Debugging statement

    res.json({ message: "Admin login successful", token });
    console.log("Login successful for:", email); // Debugging statement
});

// ✅ **Multer Storage Configuration**
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ✅ **Admin Upload Route**
app.post('/admin/upload', verifyAdmin, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ message: "File uploaded successfully", filename: req.file.filename });
});

// ✅ **Admin View Users Route**
app.get('/admin/users', async (req, res) => {
    let users = await loadUsers();
    res.json(users);
});

// ✅ **Admin View Uploaded Files Route**
app.get('/admin/uploads', async (req, res) => {
    try {
        const files = await fs.readdir('uploads');
        res.json(files);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving files" });
    }
});

// ✅ **Start Server**
console.log(`Current directory: ${process.cwd()}`);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

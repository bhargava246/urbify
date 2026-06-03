# Urbify — Real Estate Platform (Local Runner Guide)

This website is built with HTML, CSS, React, and Babel Standalone. Because the app loads multiple React `.jsx` modular scripts directly in your browser, **modern browsers will block these files from loading via the `file://` protocol due to security permissions (CORS restriction)**. 

To run this app on your own without any AI tools active, you just need to start a simple HTTP server in this directory. Below are the easiest ways to do it depending on your tooling preferences.

---

## ⚡ Easiest Method: Node.js / `npx` (No Install Required)
Since your system already has Node.js installed, you can launch a temporary web server instantly using `npx` without permanently installing anything:

1. **Open your terminal** (e.g., PowerShell, Command Prompt, or Git Bash).
2. **Navigate** to this project directory:
   ```powershell
   cd "c:\Users\himan\OneDrive\Pictures\Documents\GitHub\Urbify-handoff\urbify\project"
   ```
3. **Start the server** by running:
   ```bash
   npx http-server -p 8080
   ```
4. **Open your browser** and visit:
   [http://localhost:8080/index.html](http://localhost:8080/index.html)

---

## 🐍 Method 2: Python (Built-in)
If you have Python installed, you can use the built-in HTTP server module:

1. **Open your terminal** in this directory.
2. **Run** the following command:
   ```bash
   python -m http.server 8080
   ```
3. **Open your browser** and visit:
   [http://localhost:8080](http://localhost:8080)

---

## 💻 Method 3: VS Code (Zero Terminal / Graphical Interface)
If you are using Visual Studio Code:

1. **Open the `project` folder** in VS Code.
2. Go to the Extensions tab on the left (or press `Ctrl+Shift+X`).
3. Search for and install the **"Live Server"** extension (by Ritwick Dey).
4. Look at the bottom-right status bar and click the label **"Go Live"** (or right-click `index.html` and select **"Open with Live Server"**).
5. It will automatically spin up a server and open the page in your browser!

---

## 📦 Method 4: Permanent Node Global Install
If you want to run this frequently, you can install the server permanently:

1. Open your terminal and run:
   ```bash
   npm install -g http-server
   ```
2. Any time you want to run the project, just open your terminal in this folder and type:
   ```bash
   http-server -p 8080
   ```

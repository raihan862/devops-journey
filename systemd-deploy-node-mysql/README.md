# Node.js + MySQL Deployment with systemd

## 📌 Project Summary

the main pourpose of this project is to play with the functionalities of systemd. Here we deployed a Node.js application with MySQL database integration as a managed systemd service on Linux, implementing:

- Automated service startup on boot
- Application crash recovery
- Proper user isolation
- Database security
- Production-ready logging

## 🚀 Step-by-Step Implementation

### 1. MySQL Database Setup

```bash
# Install MySQL
sudo apt update && sudo apt install -y mysql-server

# Check if MySQL is running
sudo systemctl status mysql

# If MySQL is not running, start it
sudo systemctl start mysql

# Secure installation (set root password when prompted)
sudo mysql_secure_installation

# Create database and user
# its a good practice to create a separate user for the application to reduce the risk of unauthorized access
sudo mysql -u root -p <<EOF
CREATE DATABASE practice_app;
CREATE USER 'practice_user'@'localhost' IDENTIFIED BY 'SecurePass123!';
GRANT ALL PRIVILEGES ON practice_app.* TO 'practice_user'@'localhost';
FLUSH PRIVILEGES;

USE practice_app;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO users (name, email) VALUES
  ('Rahim', 'rahim@gmail.com'),
  ('habib ', 'habib@example.com'),
  ('jack & john', 'jack@john.com');
EOF
```

### 2. Node.js Application Setup

```bash
# If Node.js is not installed, install it
sudo apt update && sudo apt install -y nodejs

# Create a directory for the application
sudo mkdir -p /opt/node-mysql-app

# Navigate to the application directory
cd /opt/node-mysql-app

# Clone the repository
git clone git@github.com:raihan862/devops-journey.git

# Navigate to the cloned repository
cd devops-journey/systemd-deploy-node-mysql/

# Install dependencies
npm install

# Run the application
npm start

```

### 3. Systemd Configuration

#### Create system user

```bash
sudo useradd --system --shell /bin/false --home-dir /opt/node-mysql-app app_user
sudo chown -R app_user:app_user /opt/node-mysql-app
```

### Create service file

```bash
sudo tee /etc/systemd/system/node-mysql-app.service <<EOF
[Unit]
Description=Node.js MySQL App
After=network.target mysql.service

[Service]
User=app_user
Group=app_user
WorkingDirectory=/opt/node-mysql-app
ExecStart=/usr/bin/node /opt/node-mysql-app/devops-journey/systemd-deploy-node-mysql/src/server.js
Restart=always
Environment=NODE_ENV=production
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

### Enable service

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now node-mysql-app
```

### Testing the application

```bash
# Check service status
sudo systemctl status node-mysql-app

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/users

# View logs
sudo journalctl -u node-mysql-app -f



```

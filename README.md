# NodeVault – Containerized Application

NodeVault is a **MongoDB-powered CLI application** designed for structured data management.
The project is fully containerized using **Docker** and orchestrated with **Docker Compose**, ensuring portability and easy deployment.

## 🚀 Features

* 📦 **MongoDB** database for persistent storage
* 📝 **Interactive CLI** for CRUD operations
* 🐳 **Docker containerization** for backend
* 🔄 **Docker Compose** multi-service orchestration

## 📋 Prerequisites

Before running the project, ensure you have:

* **Docker**
* **Docker Compose**


## ⚙️ Quick Start

### **1. Clone the Repository**

```bash
git clone https://github.com/areej8/SCDProject25
cd SCDProject25
```


### **2. Configure Environment**

Copy the sample `.env` file:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/nodevault

# Application Configuration
PORT=3000
NODE_ENV=development
```

### **3. Start the Application**

```bash
docker compose up --build
```

### **4. Launch the Interactive CLI**

```bash
docker compose run --rm backend
```

## 🐳 Docker Compose Services

### **backend**

* Node.js CLI application
* Connects to MongoDB
* Runs interactive menu (options **1–9**)

### **mongodb**

* MongoDB database
* Exposed on port **27017**


## 📁 Project Structure

```
├── docker-compose.yml   # Orchestration file
├── main.js              # Application entry point
├── db/                  # Database functions
├── backups/             # Backup outputs
├── .env.example         # Template for env variables
└── README.md            # Documentation
```

## 🔖 Notes

* This is a **CLI-only application**, not a web server.
* All CRUD operations occur via the interactive terminal menu.
* Ensure `.env` is properly configured before running containers.

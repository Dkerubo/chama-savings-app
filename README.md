 💰 Chama Savings App

A full-stack digital platform to manage **group savings (chamas)**. It empowers users to form groups, contribute savings, take loans, and manage finances transparently and efficiently.

---

## 🚀 Core Features

- ✅ User registration & login (with roles)
- 👥 Create or join savings groups
- 💸 Record and track contributions
- 📊 Loan management system
- 🔐 JWT-secured authentication
- 🧑‍🤝‍🧑 Role-based dashboards (Member, Admin, Superadmin)

---

## 🧱 Tech Stack

| Layer     | Stack                                       |
|-----------|---------------------------------------------|
| Frontend  | React + Vite + Tailwind CSS + TypeScript    |
| Backend   | Flask (Python) + Flask-JWT-Extended         |
| Database  | SQLite (dev) / PostgreSQL (production)      |

---

## 🧪 Test Login Credentials

| Role       | Username     | Email                  | Password     |
|------------|--------------|------------------------|--------------|
| Admin      | admin        | admin@chama.com        | admin123     |
| Member     | james68      | member@chama.com       | member123    |

---

## ⚙️ Getting Started

### 🔧 Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/Dkerubo/chama-savings-app.git
cd chama-savings-app/server

# 2. Set up virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations and seed data
flask db upgrade
PYTHONPATH=. python3 server/seed.py

# 5. Start backend
flask run

    Ensure .env file is properly configured (see example below)

🌐 Frontend Setup

cd client

# 1. Install dependencies
npm install

# 2. Run frontend server
npm run dev

    Make sure the backend API URL is set correctly in client/.env

🔑 Environment Variables
📁 server/.env

FLASK_APP=server.app:create_app
FLASK_ENV=development
DATABASE_URL=postgresql://user:password@localhost/chama_db
JWT_SECRET_KEY=your-secret-key

📁 client/.env

VITE_API_BASE_URL=http://localhost:5000/api

📬 API Endpoints
Method	Endpoint	Description
POST	/auth/register	Register a new user
POST	/auth/login	Login and get tokens
GET	/auth/me	Get current user
POST	/auth/logout	Logout user
GET	/groups	List groups
POST	/groups	Create group (admin)
GET	/contributions	View contributions
POST	/contributions	Submit contribution
...	...	More in Swagger/docs
🧪 Running Tests

# Backend tests
pytest

# Frontend tests
npm test

🚀 Deployment
Backend

    Render or Railway (Gunicorn + Nginx recommended)

    Docker optional

Frontend

    Netlify / Vercel (React build)

    Set production VITE_API_BASE_URL in .env

🙌 Contributing

    Fork the repo

    Create your feature branch: git checkout -b feature/my-feature

    Commit your changes: git commit -m 'Add new feature'

    Push to the branch: git push origin feature/my-feature

    Open a Pull Request

📜 License

Distributed under the MIT License. See LICENSE file for details.
📞 Contact

Damaris Kerubo
📧 damariskerry@gmail.com
🔗 GitHub Repo

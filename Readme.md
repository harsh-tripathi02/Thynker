
> **Thynker** is a modern, full-stack quiz platform for teachers and students. Create, manage, and attempt quizzes with ease!

---

## 🚀 Features

- 👩‍🏫 Teacher & Student Dashboards
- 📝 Quiz Creation & Management
- ❓ Add & Attempt Questions
- 📊 View Quiz Results & Analytics
- 🔒 Authentication & Authorization
- 🎨 Responsive, Modern UI

---

## 🛠️ Tech Stack

**Frontend:**  
- React  
- CSS Modules

**Backend:**  
- Node.js  
- Express.js  
- MongoDB (Mongoose)

---

## 📂 Folder Structure

```
client/
  src/
    components/      # Reusable UI components
    context/         # React Context for state management
    pages/           # Page components (Login, Register, Dashboards, etc.)
    styles/          # CSS files
server/
  controllers/       # Route controllers
  middleware/        # Express middleware
  models/            # Mongoose models
  routes/            # API routes
```

---

## ⚡ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/thynker.git
cd thynker
```

### 2. Install dependencies

```bash
cd client
npm install
cd ../server
npm install
```

### 3. Set up environment variables

Create a `.env` file in the `server/` directory with your MongoDB URI and JWT secret:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### 4. Run the app

**Start the backend:**
```bash
cd server
npm start
```

**Start the frontend:**
```bash
cd client
npm start
```

---


## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Inspiration

Made with ❤️ for educators and learners.

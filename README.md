# Society Management System

A comprehensive full-stack web application for managing residential societies, including user management, billing, complaints, notices, visitors, and flats.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Project Features](#project-features)
- [Contributing](#contributing)

## ✨ Features

- **User Management**: Create, update, and manage society residents
- **Role-Based Access Control**: Different roles (Admin, Manager, Resident) with specific permissions
- **Flat/Property Management**: Manage residential units and their details
- **Billing System**: Create and track billing records for residents
- **Complaint Management**: Lodge and track complaints with resolution status
- **Notice Board**: Post and manage society-wide notices
- **Visitor Management**: Track and manage visitor entries
- **Real-time Updates**: Socket.IO integration for real-time notifications
- **Secure Authentication**: JWT-based authentication with secure password handling
- **File Uploads**: Support for cloud storage (Cloudinary) and AWS S3

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Chakra UI** - Component library
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **React Hook Form** - Form handling

### Backend
- **Node.js & Express** - Server framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Socket.IO** - Real-time communication
- **Multer** - File upload handling
- **Cloudinary** - Cloud storage
- **AWS S3** - Cloud storage alternative

## 📁 Project Structure

```
Society-management-System/
├── client/                          # React frontend application
│   ├── public/                      # Static files
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ManageUsers.jsx
│   │   │   ├── LayoutWrapper.jsx
│   │   │   └── ui/                  # UI component library
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ManageBills.jsx
│   │   │   ├── ManageComplaints.jsx
│   │   │   ├── ManageFlat.jsx
│   │   │   ├── ManageNotices.jsx
│   │   │   ├── MyFlat.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Visitors.jsx
│   │   ├── redux/                   # Redux store and slices
│   │   ├── routes/                  # Route configuration
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── server/                          # Node.js/Express backend
│   ├── controllers/                 # Route controllers
│   ├── db/                          # Database configuration
│   ├── lib/                         # Utility functions
│   │   ├── cloudinary.js            # Cloudinary integration
│   │   ├── s3.js                    # AWS S3 integration
│   │   ├── sendMail.js              # Email service
│   │   ├── generateToken.js         # JWT token generation
│   │   └── ...
│   ├── middleware/                  # Express middleware
│   ├── model/                       # Mongoose schemas
│   ├── routes/                      # API routes
│   ├── templates/                   # Email templates
│   ├── app.js                       # Express app setup
│   ├── index.js                     # Entry point
│   └── package.json
│
├── GATEKEEPER_TASK.md              # Project task documentation
└── README.md                        # This file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Society-management-System
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../client
npm install
```

### Step 4: Set Up Environment Variables

See the [Environment Variables](#environment-variables) section below.

## 🔐 Environment Variables

### Server Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/society-management

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AWS S3 Configuration (Optional)
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Client Configuration
CLIENT_URL=http://localhost:5173
```

### Client Environment Variables

Create a `.env` file in the `client/` directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
```

### Environment Variables Guide

#### **Database Configuration**
- `MONGODB_URI`: Full MongoDB connection string
  - Local: `mongodb://localhost:27017/society-management`
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/society-management`

#### **JWT Configuration**
- `JWT_SECRET`: A strong, random secret key for signing JWT tokens (use a secure random string)
- `JWT_EXPIRE`: Token expiration time (e.g., `7d`, `24h`, `1w`)

#### **Email Configuration (SMTP)**
- `SMTP_HOST`: Your email provider's SMTP host
- `SMTP_PORT`: SMTP port (typically `587` for TLS, `465` for SSL)
- `SMTP_USER`: Your email address
- `SMTP_PASSWORD`: Email password or app-specific password
  - For Gmail: [Generate App Password](https://myaccount.google.com/apppasswords)

#### **Cloud Storage (Choose One)**

**Cloudinary** (Recommended for images):
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- Sign up: [Cloudinary](https://cloudinary.com/)

**AWS S3** (Alternative):
- `AWS_REGION`: AWS region (e.g., `us-east-1`)
- `AWS_S3_BUCKET_NAME`: Your S3 bucket name
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- Sign up: [AWS](https://aws.amazon.com/)

## ▶️ Running the Project

### Development Mode

#### Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3000` and watch for changes.

#### Start the Frontend Development Server

In a new terminal:

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173`.

#### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### Production Build

#### Build Frontend

```bash
cd client
npm run build
```

This creates an optimized build in `client/dist/`.

#### Start Server in Production

```bash
cd server
npm start
```

## 📚 Available Scripts

### Frontend Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend Scripts

```bash
npm run dev           # Start development server with nodemon
npm start             # Start production server
npm run seed:role     # Seed role data
npm run seed:user     # Seed user data
npm run seed:flat     # Seed flat data
```

## 🔧 Configuration Details

### API Endpoints

The backend API runs on `http://localhost:3000/api` with the following main routes:

- `/api/auth/` - Authentication endpoints
- `/api/users/` - User management
- `/api/roles/` - Role management
- `/api/flats/` - Flat/Property management
- `/api/bills/` - Billing endpoints
- `/api/complaints/` - Complaint management
- `/api/notices/` - Notice board
- `/api/visitors/` - Visitor management

### Socket.IO Events

Real-time communication is handled through Socket.IO:
- Connection establishment with server
- Real-time notifications for complaints, bills, and notices
- User status updates

## 📝 Database Models

The system uses the following main data models:

- **User**: Society residents and staff
- **Role**: User roles and permissions
- **Flat**: Residential units
- **Bill**: Payment records
- **Complaint**: Resident complaints
- **Notice**: Society announcements
- **Visitor**: Guest entries

## 🚨 Troubleshooting

### Port Already in Use

If port 3000 (backend) or 5173 (frontend) is already in use:

```bash
# Change the backend port
PORT=3001 npm run dev

# Vite will automatically find an available port for frontend
```

### MongoDB Connection Error

- Ensure MongoDB is running locally or check your MongoDB Atlas connection string
- Verify `MONGODB_URI` in `.env` file
- Check network access if using MongoDB Atlas

### CORS Errors

- Ensure `CLIENT_URL` in server `.env` matches your frontend URL
- Verify CORS configuration in `server/app.js`

### Email Sending Fails

- Verify SMTP credentials in `.env`
- For Gmail, use an [App Password](https://myaccount.google.com/apppasswords) instead of your account password
- Check if less secure app access is enabled (for non-Gmail providers)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📞 Support

For issues or questions, please:
1. Check the troubleshooting section above
2. Open an issue in the repository
3. Contact the development team

---

**Last Updated**: 2026-08-16

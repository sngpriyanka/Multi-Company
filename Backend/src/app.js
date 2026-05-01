import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import path from 'path'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js'
import apiRoutes from './routes/index.js'

const app = express()

// CORS configuration - Improved for production + mobile
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      env.clientUrl,                    // Your Vercel frontend
      'https://multi-company-frontend-a3qp.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',          // Vite default
    ];

    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Blocked origin: ${origin}`); // For debugging
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,                    // Important for cookies/auth
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'x-auth-token'
  ],
  exposedHeaders: ['Authorization'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Multi-company command center backend is running',
  })
})

app.use('/api', apiRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app

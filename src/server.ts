import cors from 'cors';
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { authRouter } from "@/api/auth/auth.route";
import errorHandler from '@/common/middlewares/error.handler';
import requestLogger from '@/common/middlewares/request.logger';
import { env } from "@/common/utils/env.config";
import rateLimiter from '@/common/middlewares/rate.limiter';
import passport from './common/middlewares/passportConfig'
import session from "express-session";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter)

app.use(
    session({
        secret: "mySessionSecret",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
    })
)

app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use(requestLogger);

// Routes
app.use("/api/auth", authRouter);

app.use(errorHandler());

export {app, logger};



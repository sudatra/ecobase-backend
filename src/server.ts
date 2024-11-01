import cors from 'cors';
import express, {type Express} from "express";
import helmet from "helmet";
import {pino} from "pino";

import {authRouter} from "@/api/auth/auth.route";
import errorHandler from '@/common/middlewares/error.handler';
import requestLogger from '@/common/middlewares/request.logger';
import {env} from "@/common/utils/env.config";

const logger = pino({name:"server start"});

import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

export interface TokenPayload {
  sub: string;
  nome: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

export const autenticar: RequestHandler = (req, _res, next) => {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) throw AppError.naoAutorizado('Token não informado');

  try {
    req.usuario = jwt.verify(token, env.jwtSecret) as unknown as TokenPayload;
    next();
  } catch {
    throw AppError.naoAutorizado('Token inválido ou expirado');
  }
};

import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ erro: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: err.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message })),
    });
    return;
  }

  // Registro não encontrado no Prisma (update/delete de id inexistente)
  if (err?.code === 'P2025') {
    res.status(404).json({ erro: 'Registro não encontrado' });
    return;
  }

  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
};

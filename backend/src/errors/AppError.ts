export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static naoEncontrado(recurso: string) {
    return new AppError(`${recurso} não encontrado(a)`, 404);
  }

  static naoAutorizado(mensagem = 'Não autorizado') {
    return new AppError(mensagem, 401);
  }
}

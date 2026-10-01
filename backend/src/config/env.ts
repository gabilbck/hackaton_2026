import 'dotenv/config';

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ${nome} não definida (veja .env.example)`);
  return valor;
}

export const env = {
  porta: Number(process.env.PORT ?? 3333),
  databaseUrl: obrigatoria('DATABASE_URL'),
  jwtSecret: obrigatoria('JWT_SECRET'),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  /** Endereço do site usado nos links dos e-mails (a primeira origem de FRONTEND_URL) */
  get urlPublica() {
    return this.frontendUrl.split(',')[0].trim().replace(/\/$/, '');
  },

  // Dados da influenciadora usados nas propostas e e-mails
  influenciadora: {
    nome: process.env.INFLUENCER_NOME ?? 'Guia Gastronômico Joinville',
    instagram: process.env.INFLUENCER_INSTAGRAM ?? '@guiagastronomicojoinville',
    email: process.env.INFLUENCER_EMAIL ?? 'contato@exemplo.com',
  },

  // SMTP opcional: sem ele, os e-mails vão para uma caixa de teste (Ethereal)
  smtp: {
    host: process.env.SMTP_HOST,
    porta: Number(process.env.SMTP_PORT ?? 587),
    usuario: process.env.SMTP_USER,
    senha: process.env.SMTP_PASS,
    remetente: process.env.SMTP_FROM,
  },
};

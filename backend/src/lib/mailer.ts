import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

export interface Email {
  para: string;
  assunto: string;
  html: string;
  texto: string;
}

export interface ResultadoEnvio {
  status: 'ENVIADO' | 'SIMULADO';
  previewUrl?: string;
}

let transporter: Transporter | null = null;
let usandoEthereal = false;

/**
 * Com SMTP configurado no .env, envia de verdade.
 * Sem SMTP, cria uma caixa de teste no Ethereal: o e-mail não chega ao destinatário,
 * mas gera um link de visualização (ótimo para a demo).
 */
async function obterTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  if (env.smtp.host) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.porta,
      secure: env.smtp.porta === 465,
      auth: { user: env.smtp.usuario, pass: env.smtp.senha },
    });
  } else {
    const conta = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: conta.smtp.host,
      port: conta.smtp.port,
      secure: conta.smtp.secure,
      auth: { user: conta.user, pass: conta.pass },
    });
    usandoEthereal = true;
    console.log('[mailer] SMTP não configurado: usando caixa de teste Ethereal');
  }
  return transporter;
}

export async function enviarEmail(email: Email): Promise<ResultadoEnvio> {
  const t = await obterTransporter();
  const info = await t.sendMail({
    from: env.smtp.remetente ?? `"${env.influenciadora.nome}" <${env.influenciadora.email}>`,
    replyTo: env.influenciadora.email,
    to: email.para,
    subject: email.assunto,
    text: email.texto,
    html: email.html,
  });

  if (usandoEthereal) {
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log(`[mailer] Prévia do e-mail para ${email.para}: ${previewUrl}`);
    return { status: 'SIMULADO', previewUrl };
  }
  return { status: 'ENVIADO' };
}

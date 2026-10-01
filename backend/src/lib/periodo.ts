import type { Periodo } from '../validators/schemas';

// Joinville usa o horário de Brasília (UTC-3, sem horário de verão desde 2019).
const OFFSET_MS = 3 * 60 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;

/** Meia-noite (horário de Brasília) do dia de `data`, `deslocamentoDias` dias depois, em UTC. */
function inicioDoDia(data: Date, deslocamentoDias = 0): Date {
  const local = new Date(data.getTime() - OFFSET_MS);
  const meiaNoite = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(meiaNoite + OFFSET_MS + deslocamentoDias * DIA_MS);
}

/** Dia da semana no horário de Brasília (0 = domingo). */
const diaDaSemana = (data: Date) => new Date(data.getTime() - OFFSET_MS).getUTCDay();

/**
 * Intervalo [de, ate) de cada filtro rápido.
 * "fds" vai de sexta 18h até o fim de domingo; se já for fim de semana, começa agora.
 */
export function intervaloDoPeriodo(periodo: Periodo, agora = new Date()): { de: Date; ate: Date } {
  const hoje = inicioDoDia(agora);
  switch (periodo) {
    case 'hoje':
      return { de: hoje, ate: inicioDoDia(agora, 1) };
    case 'amanha':
      return { de: inicioDoDia(agora, 1), ate: inicioDoDia(agora, 2) };
    case 'semana':
      return { de: hoje, ate: inicioDoDia(agora, 7) };
    case 'fds': {
      const dia = diaDaSemana(agora);
      const diasAteDomingo = (7 - dia) % 7;
      const ate = inicioDoDia(agora, diasAteDomingo + 1);
      if (dia === 0 || dia === 6) return { de: hoje, ate };
      const sexta18h = new Date(inicioDoDia(agora, 5 - dia).getTime() + 18 * 60 * 60 * 1000);
      return { de: sexta18h, ate };
    }
  }
}

export { inicioDoDia };

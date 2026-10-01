/**
 * Converte endereço em coordenadas usando o Nominatim (OpenStreetMap), gratuito e sem chave.
 * Política de uso: no máximo 1 requisição por segundo e User-Agent identificado.
 * Retorna null se não encontrar ou se o serviço falhar: o evento só fica fora do mapa.
 */
async function buscar(consulta: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(consulta)}`;
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'GuiaParcerias/1.0 (projeto de hackathon)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return null;
    const [primeiro] = (await resp.json()) as { lat: string; lon: string }[];
    return primeiro ? { latitude: Number(primeiro.lat), longitude: Number(primeiro.lon) } : null;
  } catch {
    return null;
  }
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Tenta do mais preciso ao mais genérico: endereço + bairro, só o endereço
 * e, por fim, o centro do bairro (melhor aparecer perto do que sumir do mapa).
 */
export async function geocodificar(endereco: string, bairro?: string | null) {
  const cidade = 'Joinville, SC, Brasil';
  const tentativas = [
    bairro && `${endereco}, ${bairro}, ${cidade}`,
    `${endereco}, ${cidade}`,
    bairro && `${bairro}, ${cidade}`,
  ].filter((t): t is string => !!t);

  for (const [i, consulta] of tentativas.entries()) {
    if (i > 0) await esperar(1100);
    const coords = await buscar(consulta);
    if (coords) return coords;
  }
  return null;
}

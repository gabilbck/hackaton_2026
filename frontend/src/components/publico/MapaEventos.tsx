import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { infoCategoria, precoEvento, quandoCurto } from '../../lib/formato'
import type { Evento } from '../../types'

const CENTRO_JOINVILLE: [number, number] = [-26.3045, -48.8487]

// Cor do marcador por categoria (as mesmas famílias de cor dos cards)
const cores: Record<Evento['categoria'], string> = {
  GASTRONOMIA: '#ea580c',
  SHOW: '#8b5cf6',
  FESTA: '#db2777',
  CULTURA: '#4f46e5',
  INFANTIL: '#f59e0b',
  FEIRA: '#16a34a',
  ESPORTE: '#0284c7',
  OUTRO: '#57534e',
}

/** Mapa com OpenStreetMap: gratuito e sem chave de API. */
export default function MapaEventos({ eventos, altura = 'h-[480px]', zoom = 13 }: { eventos: Evento[]; altura?: string; zoom?: number }) {
  const comLocal = eventos.filter((e) => e.latitude != null && e.longitude != null)
  const centro: [number, number] =
    comLocal.length === 1 ? [comLocal[0].latitude!, comLocal[0].longitude!] : CENTRO_JOINVILLE

  return (
    <div className={`overflow-hidden rounded-2xl border border-stone-200 ${altura}`}>
      <MapContainer center={centro} zoom={comLocal.length === 1 ? 15 : zoom} className="h-full w-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {comLocal.map((e) => (
          <CircleMarker
            key={e.id}
            center={[e.latitude!, e.longitude!]}
            radius={10}
            pathOptions={{ color: '#fff', weight: 2, fillColor: cores[e.categoria], fillOpacity: 0.95 }}
          >
            <Popup>
              <div className="space-y-0.5">
                <p className="text-xs">{infoCategoria(e.categoria).emoji} {infoCategoria(e.categoria).rotulo}</p>
                <Link to={`/evento/${e.id}`} className="font-semibold">
                  {e.titulo}
                </Link>
                <p className="!my-0 text-xs">{quandoCurto(e)} · {precoEvento(e)}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

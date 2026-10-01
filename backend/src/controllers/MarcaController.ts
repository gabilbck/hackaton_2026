import { Request, Response } from 'express';
import { marcaService } from '../services/marca.service';
import { contatoService } from '../services/contato.service';
import { contatoSchema, idParam, marcaSchema } from '../validators/schemas';

const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export class MarcaController {
  listar = async (req: Request, res: Response) => {
    const { busca, bairro, segmento } = req.query;
    res.json(
      await marcaService.listar({ busca: texto(busca), bairro: texto(bairro), segmento: texto(segmento) }),
    );
  };

  opcoesFiltro = async (_req: Request, res: Response) => {
    res.json(await marcaService.opcoesFiltro());
  };

  buscar = async (req: Request, res: Response) => {
    res.json(await marcaService.buscar(idParam.parse(req.params).id));
  };

  criar = async (req: Request, res: Response) => {
    res.status(201).json(await marcaService.criar(marcaSchema.parse(req.body)));
  };

  atualizar = async (req: Request, res: Response) => {
    const { id } = idParam.parse(req.params);
    res.json(await marcaService.atualizar(id, marcaSchema.partial().parse(req.body)));
  };

  remover = async (req: Request, res: Response) => {
    await marcaService.remover(idParam.parse(req.params).id);
    res.status(204).end();
  };

  adicionarContato = async (req: Request, res: Response) => {
    const { id } = idParam.parse(req.params);
    res.status(201).json(await contatoService.criar(id, contatoSchema.parse(req.body)));
  };
}

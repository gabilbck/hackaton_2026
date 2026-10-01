import { Request, Response } from 'express';
import { pacoteService } from '../services/pacote.service';
import { idParam, pacoteSchema } from '../validators/schemas';

export class PacoteController {
  listar = async (req: Request, res: Response) => {
    res.json(await pacoteService.listar(req.query.ativos === 'true'));
  };

  buscar = async (req: Request, res: Response) => {
    res.json(await pacoteService.buscar(idParam.parse(req.params).id));
  };

  criar = async (req: Request, res: Response) => {
    res.status(201).json(await pacoteService.criar(pacoteSchema.parse(req.body)));
  };

  atualizar = async (req: Request, res: Response) => {
    const { id } = idParam.parse(req.params);
    res.json(await pacoteService.atualizar(id, pacoteSchema.parse(req.body)));
  };

  remover = async (req: Request, res: Response) => {
    res.json(await pacoteService.remover(idParam.parse(req.params).id));
  };
}

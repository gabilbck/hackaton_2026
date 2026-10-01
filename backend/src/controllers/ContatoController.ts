import { Request, Response } from 'express';
import { contatoService } from '../services/contato.service';
import { contatoSchema, idParam } from '../validators/schemas';

export class ContatoController {
  atualizar = async (req: Request, res: Response) => {
    const { id } = idParam.parse(req.params);
    res.json(await contatoService.atualizar(id, contatoSchema.partial().parse(req.body)));
  };

  remover = async (req: Request, res: Response) => {
    await contatoService.remover(idParam.parse(req.params).id);
    res.status(204).end();
  };
}

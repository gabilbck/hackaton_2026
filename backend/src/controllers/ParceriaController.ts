import { Request, Response } from 'express';
import { parceriaService } from '../services/parceria.service';
import {
  idParam,
  parceriaSchema,
  parceriaUpdateSchema,
  statusParceria,
  statusSchema,
} from '../validators/schemas';

export class ParceriaController {
  listar = async (req: Request, res: Response) => {
    const status = statusParceria.optional().parse(req.query.status || undefined);
    const marcaId = req.query.marcaId ? Number(req.query.marcaId) : undefined;
    res.json(await parceriaService.listar({ status, marcaId }));
  };

  buscar = async (req: Request, res: Response) => {
    res.json(await parceriaService.buscar(idParam.parse(req.params).id));
  };

  previa = async (req: Request, res: Response) => {
    res.json(await parceriaService.previa(parceriaSchema.parse(req.body)));
  };

  criar = async (req: Request, res: Response) => {
    res.status(201).json(await parceriaService.criar(parceriaSchema.parse(req.body)));
  };

  atualizar = async (req: Request, res: Response) => {
    const { id } = idParam.parse(req.params);
    res.json(await parceriaService.atualizar(id, parceriaUpdateSchema.parse(req.body)));
  };

  alterarStatus = async (req: Request, res: Response) => {
    const { id } = idParam.parse(req.params);
    const { status, notificar } = statusSchema.parse(req.body);
    res.json(await parceriaService.alterarStatus(id, status, notificar));
  };

  reenviarProposta = async (req: Request, res: Response) => {
    await parceriaService.reenviarProposta(idParam.parse(req.params).id);
    res.status(202).json({ mensagem: 'Proposta enviada para os contatos da marca' });
  };

  remover = async (req: Request, res: Response) => {
    await parceriaService.remover(idParam.parse(req.params).id);
    res.status(204).end();
  };
}

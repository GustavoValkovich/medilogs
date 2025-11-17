import { Router } from 'express';

export const rolesRouter = Router();

rolesRouter.get('/health', (req, res) => res.json({ ok: true }));

export function sanitizeCharacterInput(req: any, res: any, next: any) {
  req.body.sanitizedInput = {
    name: req.body?.name,
    characterClass: req.body?.characterClass,
    level: req.body?.level,
    hp: req.body?.hp,
    mana: req.body?.mana,
    attack: req.body?.attack,
    items: req.body?.items,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}
import { Router } from 'express';

// Router genérico para roles. Si más tarde se necesitan endpoints concretos,
// registra controladores específicos aquí.
export const rolesRouter = Router();

// Ejemplo: un endpoint health para comprobar que el router está activo
rolesRouter.get('/health', (req, res) => res.json({ ok: true }));

// helper de sanitización
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
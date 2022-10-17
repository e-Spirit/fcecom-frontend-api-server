import { createNamespace } from 'continuation-local-storage';

export const session = createNamespace('request');

export const sessionMiddleware = () => {
  return (req: any, res: any, next: any) => {
    session.run(() => {
      session.set('queryParams', req.query);
      next();
    });
  };
};

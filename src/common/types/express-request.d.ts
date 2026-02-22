import { LANG } from '../enums/translation.enum';

declare module 'express' {
  interface Request {
    lang: LANG;
    session: {
      products: number[];
    };
  }
}

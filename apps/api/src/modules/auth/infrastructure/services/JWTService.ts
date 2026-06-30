import { ITokenService } from '../../application/ports/ITokenService';
import jwt from 'jsonwebtoken';

export class JWTService implements ITokenService {
  constructor(private secret: string) {}

  generate(payload: any): string {
    return jwt.sign(payload, this.secret, { expiresIn: '7d' });
  }

  verify(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch {
      return null;
    }
  }
}
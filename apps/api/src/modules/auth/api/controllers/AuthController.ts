import { FastifyRequest, FastifyReply } from 'fastify';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export class AuthController {
  constructor(private loginUseCase: LoginUseCase) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = loginSchema.parse(request.body);
      const result = await this.loginUseCase.execute(body);
      return reply.send(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Datos inválidos', details: error.errors });
      }
      return reply.status(401).send({ error: error.message });
    }
  }
}
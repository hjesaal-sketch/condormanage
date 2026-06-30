import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { JWTService } from '../../infrastructure/services/JWTService';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { AuthController } from '../controllers/AuthController';

export async function authRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const userRepository = new PrismaUserRepository(prisma);
  const tokenService = new JWTService(process.env.JWT_SECRET || 'secret');
  const loginUseCase = new LoginUseCase(userRepository, tokenService);
  const controller = new AuthController(loginUseCase);

  fastify.post('/login', controller.login.bind(controller));
}
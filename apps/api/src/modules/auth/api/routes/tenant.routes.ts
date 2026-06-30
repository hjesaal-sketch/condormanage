import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function tenantRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();

  fastify.get('/', async (request, reply) => {
    // TODO: Implementar con autenticación
    const tenants = await prisma.tenant.findMany();
    return reply.send(tenants);
  });

  fastify.post('/', async (request, reply) => {
    const body = request.body as any;
    const tenant = await prisma.tenant.create({
      data: {
        name: body.name,
        subdomain: body.subdomain,
        config: body.config || {}
      }
    });
    return reply.status(201).send(tenant);
  });
}
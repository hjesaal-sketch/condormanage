import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function unitRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();

  fastify.get('/tenant/:tenantId', async (request, reply) => {
    const { tenantId } = request.params as any;
    const units = await prisma.unit.findMany({
      where: { tenantId },
      include: { users: { include: { user: true } } }
    });
    return reply.send(units);
  });

  fastify.post('/', async (request, reply) => {
    const body = request.body as any;
    const unit = await prisma.unit.create({
      data: {
        tenantId: body.tenantId,
        number: body.number,
        floor: body.floor,
        area: body.area,
        type: body.type || 'APARTMENT',
        status: body.status || 'AVAILABLE'
      }
    });
    return reply.status(201).send(unit);
  });
}
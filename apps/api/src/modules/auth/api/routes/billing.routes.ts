import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function billingRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();

  // Generar cuotas mensuales
  fastify.post('/generate-monthly', async (request, reply) => {
    const { tenantId, month, year, amount, concept } = request.body as any;

    // Obtener unidades activas
    const units = await prisma.unit.findMany({
      where: {
        tenantId,
        status: 'OCCUPIED'
      }
    });

    const invoices = await Promise.all(
      units.map(unit =>
        prisma.invoice.create({
          data: {
            tenantId,
            unitId: unit.id,
            number: `INV-${Date.now()}-${unit.number}`,
            issueDate: new Date(year, month, 1),
            dueDate: new Date(year, month, 15),
            amount: amount || 150000,
            concept: concept || `Cuota de Mantenimiento - ${new Date(year, month).toLocaleString('es', { month: 'long' })}`,
            status: 'PENDING'
          }
        })
      )
    );

    return reply.send({
      message: `Generadas ${invoices.length} cuotas`,
      invoices
    });
  });

  // Listar facturas por tenant
  fastify.get('/tenant/:tenantId', async (request, reply) => {
    const { tenantId } = request.params as any;
    const invoices = await prisma.invoice.findMany({
      where: { tenantId },
      include: { unit: true, payments: true },
      orderBy: { issueDate: 'desc' }
    });
    return reply.send(invoices);
  });

  // Registrar pago
  fastify.post('/payments', async (request, reply) => {
    const { invoiceId, amount, method, reference } = request.body as any;

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        reference,
        date: new Date(),
        status: 'COMPLETED'
      }
    });

    // Actualizar factura
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID' }
    });

    return reply.send(payment);
  });
}
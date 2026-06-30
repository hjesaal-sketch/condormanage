import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Crear Tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'condominio-central' },
    update: {},
    create: {
      name: 'Condominio Central',
      subdomain: 'condominio-central',
      config: {
        currency: 'Bs.',
        timezone: 'America/Caracas',
        paymentTerms: '15 días'
      },
      status: 'ACTIVE'
    }
  });

  console.log(`✅ Tenant creado: ${tenant.name}`);

  // 2. Crear Usuario Admin
  const hashedPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@condominio.com' },
    update: {},
    create: {
      email: 'admin@condominio.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: tenant.id
    }
  });

  console.log(`✅ Admin creado: ${admin.email}`);

  // 3. Crear Unidades
  const units = [];
  for (let i = 1; i <= 20; i++) {
    const unit = await prisma.unit.create({
      data: {
        tenantId: tenant.id,
        number: `${String(i).padStart(3, '0')}`,
        floor: Math.ceil(i / 4),
        area: 80 + (i % 5) * 10,
        type: i % 10 === 0 ? 'PENTHOUSE' : 'APARTMENT',
        status: i <= 18 ? 'OCCUPIED' : 'AVAILABLE'
      }
    });
    units.push(unit);
  }

  console.log(`✅ ${units.length} unidades creadas`);

  // 4. Crear Facturas de ejemplo
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const unit = units[i % units.length];
    const invoice = await prisma.invoice.create({
      data: {
        tenantId: tenant.id,
        unitId: unit.id,
        number: `INV-${String(i + 1).padStart(4, '0')}`,
        issueDate: new Date(now.getFullYear(), now.getMonth() - i, 1),
        dueDate: new Date(now.getFullYear(), now.getMonth() - i, 15),
        amount: 150000 + (i * 10000),
        concept: `Cuota de Mantenimiento - ${now.toLocaleString('es', { month: 'long' })}`,
        status: i < 3 ? 'PAID' : 'PENDING'
      }
    });

    if (i < 3) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.amount,
          date: new Date(now.getFullYear(), now.getMonth() - i, 5),
          method: 'BANK_TRANSFER',
          reference: `REF-${String(i + 1).padStart(4, '0')}`,
          status: 'COMPLETED'
        }
      });
    }
  }

  console.log('✅ Facturas de ejemplo creadas');
  console.log('🎉 Seed completado!');
  console.log('\n📝 Credenciales de acceso:');
  console.log('   Email: admin@condominio.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
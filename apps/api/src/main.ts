import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import jwt from '@fastify/jwt';
import { authRoutes } from './modules/auth/api/routes/auth.routes';
import { tenantRoutes } from './modules/tenants/api/routes/tenant.routes';
import { unitRoutes } from './modules/units/api/routes/unit.routes';
import { billingRoutes } from './modules/billing/api/routes/billing.routes';

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

// Plugins
app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
});

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production'
});

app.register(swagger, {
  routePrefix: '/docs',
  swagger: {
    info: {
      title: 'CondorManage API',
      description: 'API para gestión de condominios',
      version: '0.1.0'
    },
    host: process.env.API_HOST || 'localhost:4000',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json']
  },
  exposeRoute: true
});

// Routes
app.register(authRoutes, { prefix: '/api/auth' });
app.register(tenantRoutes, { prefix: '/api/tenants' });
app.register(unitRoutes, { prefix: '/api/units' });
app.register(billingRoutes, { prefix: '/api/billing' });

// Health Check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 API Docs: http://localhost:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
import dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify';
import fastifyMongodb from '@fastify/mongodb';
import fastifyMultipart from '@fastify/multipart';
import path from 'path';
import fastifyStatic from '@fastify/static';
import fastifyJwt from '@fastify/jwt';
import { MONGODB_URI } from './config/database.js';
import fastifyCors from '@fastify/cors';
import productRoutes from './routes/product.routes.js';
import productCategoryRoutes from './routes/productCategory.route.js';
import authRoutes from './routes/auth.routes.js';
const fastify = Fastify({
  logger: true,
  routerOptions: {
    maxParamLength: 5000
  }
});




import fastifyFormbody from '@fastify/formbody';
import blogCategoryRoutes from './routes/blogCategory.route.js';
import uploadRoutes from './routes/upload.routes.js';
import blogRoutes from './routes/blog.routes.js';
import excelRoutes from './routes/uploadExcel.routes.js';
import amazonRoutes from './routes/amazon.route.js';

// fastify.register(fastifyStatic, {
//   root: path.join(process.cwd(), 'public'),
//   prefix: '/public/', // optional: default '/'
// });
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'uploads'),
  prefix: '/uploads/', // optional: default '/'
});

fastify.register(fastifyMultipart, {
  attachFieldsToBody: true,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
fastify.register(fastifyFormbody);

fastify.register(fastifyCors,{
   origin: "*",
   credentials: true,
   methods: ['GET','POST','PUT','DELETE'],
   allowedHeaders: ['Content-Type','Authorization']
})

fastify.register(fastifyMongodb, {
  url: MONGODB_URI
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'supersecretkey'
});

// Basic route
fastify.get('/', async (request, reply) => {
  return { message: 'Welcome to Womenica API', status: 'running' };
});

// Register product routes
fastify.register(productRoutes, { prefix: '/api' });
fastify.register(productCategoryRoutes, { prefix: '/api' });
fastify.register(authRoutes, { prefix: '/api' });
fastify.register(blogCategoryRoutes, { prefix: '/api' });
fastify.register(uploadRoutes, { prefix: '/api' });
fastify.register(blogRoutes, { prefix: '/api' });
fastify.register(excelRoutes, { prefix: '/api' });
fastify.register(amazonRoutes, { prefix: '/api' });
// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    
    await fastify.listen({ port, host });
    console.log(`Server is running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

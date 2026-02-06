import { uploadExcelToProducts,updatePriceByExcel } from '../controllers/uploadExcel.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
export default async function excelRoutes(fastify) {
  fastify.post(
    '/upload/product-excel',
    {
      preHandler: [authMiddleware],
    },
    uploadExcelToProducts
  );
  fastify.post(
    '/upload/update-price-excel',
    {
      preHandler: [authMiddleware],
    },
    updatePriceByExcel
  );  
}

// import { addProduct } from "../controllers/product.controller";
import { addProduct,updateProduct,fetchProducts,fetchProductDetails,deleteProduct,fetchProductsForHomePage,fetchProductsByCategory, fetchRelatedProducts, fetchAllProductList, fetchInTrendingProducts,downloadProductsByCategory } from "../controllers/product.controller.js";
import { createProductSchema } from "../validators/product.validator.js";
import { validateSchema } from "../validators/validation.middleware.js";
// import authMiddleware from "../middleware/auth.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export default async function productRoutes(fastify, options) {
  fastify.post(
    '/products/add',
    { preHandler: [validateSchema(createProductSchema), authMiddleware] },
    addProduct
  );

  fastify.put(
    '/product/update/:slug',
    { preHandler: [validateSchema(createProductSchema), authMiddleware] },
    updateProduct
  );
  fastify.get('/products', 
    { preHandler: [authMiddleware] },
    fetchProducts
  );
  fastify.get('/product/:slug', { preHandler: [authMiddleware] }, fetchProductDetails)

  fastify.delete('/product/delete', { preHandler: [authMiddleware] }, deleteProduct);
  fastify.get('/product/inTrending', { preHandler: [authMiddleware] }, fetchInTrendingProducts );
  fastify.get('/products/download/:categoryName', { preHandler: [authMiddleware] }, downloadProductsByCategory );

  
  fastify.get('/frontend/products', fetchProductsForHomePage);
  fastify.get('/frontend/product/:slug', fetchProductDetails);
  fastify.get('/frontend/products/category/:slug', fetchProductsByCategory);

  fastify.get(
  '/frontend/products/:id/related',
  fetchRelatedProducts
);

fastify.get('/frontend/product/search', fetchAllProductList);
fastify.get('/frontend/products/inTrending', fetchInTrendingProducts );

}

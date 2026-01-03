import { addProductCategory,updateProductCategory,fetchProductsCategories,fetchProductCategoryBySlug,deleteProductCategory,fetchAllActiveProductCategoriesForFrontend,getAllActiveProductCategories } from "../controllers/productCategory.controller.js";
import { createProductCategorySchema } from "../validators/productCategory.validator.js";
import { validateSchema } from "../validators/validation.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
export default async function productCategoryRoutes(fastify, options) {
  fastify.post('/product-categories/add', 
    {preHandler: [validateSchema(createProductCategorySchema), authMiddleware]},
    addProductCategory);
    fastify.put("/product-categories/update/:slug",
    {preHandler: [validateSchema(createProductCategorySchema), authMiddleware]},
    updateProductCategory);
    fastify.get('/product-categories', { preHandler: [authMiddleware] }, fetchProductsCategories);
    fastify.get('/product-categories/:slug', { preHandler: [authMiddleware] }, fetchProductCategoryBySlug);
    fastify.get('/product-categories/active-categories', getAllActiveProductCategories);
    fastify.delete('/product-categories/delete/:id', { preHandler: [authMiddleware] }, deleteProductCategory);
    fastify.get('/frontend/product-categories', fetchAllActiveProductCategoriesForFrontend);
}
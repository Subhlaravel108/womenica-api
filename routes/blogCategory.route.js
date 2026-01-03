import { createBlogCategory,updateBlogCategory,getAllBlogCategory,getBlogCategoryDetails,deleteBlogCategory,getAllActiveBlogCategories } from "../controllers/blogCategory.controller.js";
import { validateSchema } from "../validators/validation.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { blogCategorySchema } from "../validators/blogCategory.validator.js";
export default async function blogCategoryRoutes(fastify, options) {
  fastify.post(
    '/blog-category',
    { preHandler: [validateSchema(blogCategorySchema), authMiddleware] },
    createBlogCategory
  );
    fastify.put(
    '/blog-category/:slug',
    { preHandler: [validateSchema(blogCategorySchema), authMiddleware] },
    updateBlogCategory
  );
    fastify.get(
    '/blog-categories',
    { preHandler: [authMiddleware] },
    getAllBlogCategory
  );

  fastify.get(
    "/blog-category/:slug",
    {preHandler:[authMiddleware]},
    getBlogCategoryDetails
  )

  fastify.delete(
    "/blog-category/:id",
    {preHandler:[authMiddleware]},
    deleteBlogCategory
  )

  fastify.get(
    '/blogs/active-categories',
    getAllActiveBlogCategories
  );


}
import { createBlog,updateBlogBySlug,getAllBlogs,getBlogDetailsBySlug,deleteBlogById } from "../controllers/blog.controller.js";
import { validateSchema } from "../validators/validation.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createBlogSchema } from "../validators/blog.validator.js";
export default async function blogRoutes(fastify, options) {
  fastify.post(
    '/blog',
    { preHandler: [validateSchema(createBlogSchema), authMiddleware] },
    createBlog
  );
    fastify.put(
    '/blog/:slug',
    { preHandler: [validateSchema(createBlogSchema), authMiddleware] },   
    updateBlogBySlug
  );
    fastify.get(
    '/blog',
    { preHandler: [authMiddleware] },
    getAllBlogs
  );
    fastify.get(
    "/blog/:slug",
    {preHandler:[authMiddleware]},
    getBlogDetailsBySlug
  )
    fastify.delete(
    "/blog/:id",
    {preHandler:[authMiddleware]},
    deleteBlogById
  )
    fastify.get(
    '/frontend/blogs',
    getAllBlogs
  );
    fastify.get(
    "/frontend/blog/:slug",
    getBlogDetailsBySlug
  )
}
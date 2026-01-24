import { scrapAmazonProducts } from "../controllers/amazonScrap.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
export default async function amazonRoutes(fastify, options) {
  fastify.post(
    '/amazon/scrap-to-csv',
    { preHandler: [authMiddleware] },
    scrapAmazonProducts
  );
}
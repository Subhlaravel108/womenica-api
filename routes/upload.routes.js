// const { uploadImage } = require("../controllers/upload.controller");
import { uploadImage } from "../controllers/upload.controller.js";

export default async function uploadRoutes(fastify, options) {
  fastify.post("/upload-image", uploadImage);
}

// module.exports = uploadRoutes;

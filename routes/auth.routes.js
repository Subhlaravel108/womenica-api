
import { register,login,forgotPassword,verifyResetOTP,resetPassword,verifyOTP,changePassword} from "../controllers/auth.controller.js";
import { validateSchema } from "../validators/validation.middleware.js";
import { registerSchema,changePasswordSchema } from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
export default async function authRoutes(fastify, options) {
    fastify.post('/auth/register',
        {preHandler: validateSchema(registerSchema)},
         register);
    fastify.post('/auth/login', login);
    fastify.post('/auth/forgot-password', forgotPassword);
    fastify.post("/auth/verify-reset-otp",verifyResetOTP)
    fastify.post("/auth/reset-password",resetPassword)
    fastify.post("/auth/verify-otp",verifyOTP)
     fastify.post("/auth/change-password",
        {preHandler:[validateSchema(changePasswordSchema),authMiddleware]},
        changePassword);
}
    
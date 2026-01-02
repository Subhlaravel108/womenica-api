export const authMiddleware = async (req, reply) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized! Token missing"
      });
    }
       
    const token = authHeader.split(" ")[1];

    const decoded = await req.jwtVerify(); // ✅ Verify token properly
    req.user = decoded;
  } catch (error) {
    return reply.code(401).send({
      success: false,  
      message: "Invalid or expired token",
      error: error.message
    });
  }
};



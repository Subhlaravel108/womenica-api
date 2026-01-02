// const cloudinary = require("../utils/cloudinary");
import cloudinary from "../utils/cloudinary.js";

// export const uploadImage = async (req, reply) => {
//   try {
//     const data = await req.file();

//     if (!data) {
//       return reply.code(400).send({
//         success: false,
//         message: "Image file is required!"
//       });
//     }

//     const fileBuffer = await data.toBuffer();

//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { folder: "womenica_app_uploads" },
//         (error, result) => {
//           if (error) {
//             reject(error);
//           } else {
//             resolve(result);
//           }
//         }
//       );
//       stream.end(fileBuffer);
//     });

//     return reply.code(200).send({
//       success: true,
//       message: "Image uploaded successfully ✅",
//       imageUrl: result.secure_url
//     });

//   } catch (error) {
//     console.error("Cloudinary Error:", error);

//     return reply.code(500).send({
//       success: false,
//       message: "Internal Server Error ❌",
//       error: error.message
//     });
//   }
// };

// module.exports = { uploadImage };



export const uploadImage = async (req, reply) => {
  try {
    let file;

    for await (const part of req.parts()) {
      if (part.type === "file" && part.fieldname === "image") {
        file = part;
        break;
      }
    }

    if (!file) {
      return reply.code(400).send({
        success: false,
        message: "Image file is required!"
      });
    }

    const buffer = await file.toBuffer();

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "womenica_app_uploads" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(buffer);
    });

    reply.send({
      success: true,
      imageUrl: result.secure_url,
    });

  } catch (error) {
    console.error(error);
    reply.code(500).send({
      success: false,
      message: error.message,
    });
  }
};

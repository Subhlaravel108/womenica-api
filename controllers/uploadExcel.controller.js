
// import XLSX from 'xlsx';
// import { createProductSchema } from '../validators/product.validator.js';

// export const uploadExcelToProducts = async (request, reply) => {
//   try {
//     const db = request.server.mongo.db;
//     const collection = db.collection('products');

//     const file = request.body.file;
//     if (!file) {
//       return reply.code(400).send({
//         success: false,
//         message: 'Excel file is required'
//       });
//     }

//     const buffer = await file.toBuffer();
//     const workbook = XLSX.read(buffer, { type: 'buffer' });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json(sheet);

//     if (!rows.length) {
//       return reply.code(400).send({
//         success: false,
//         message: 'Excel file is empty'
//       });
//     }

//     const validRows = [];
//     const errors = [];

//     for (let i = 0; i < rows.length; i++) {
//       try {
//         const validatedRow = await createProductSchema.validate(rows[i], {
//           abortEarly: false,
//           stripUnknown: true
//         });

//         validRows.push({
//           ...validatedRow,
//           createdAt: new Date(),
//           updatedAt: new Date()
//         });

//       } catch (err) {
//         errors.push({
//           row: i + 2, // Excel row (header = 1)
//           errors: err.errors
//         });
//       }
//     }

//     if (!validRows.length) {
//       return reply.code(400).send({
//         success: false,
//         message: 'No valid rows found in Excel',
//         errors
//       });
//     }

//     await collection.insertMany(validRows);

//     return reply.send({
//       success: true,
//       message: 'Excel imported successfully',
//       inserted: validRows.length,
//       failed: errors.length,
//       errors
//     });

//   } catch (error) {
//     request.log.error(error);
//     reply.code(500).send({
//       success: false,
//       message: 'Internal Server Error'
//     });
//   }
// };



// import XLSX from 'xlsx';
// import { generateUniqueSlug } from "../utils/generateUniqueSlug.js";
// import { createExcelProductSchema } from '../validators/product.validator.js';
// import { ObjectId } from '@fastify/mongodb';
// export const uploadExcelToProducts = async (request, reply) => {
//   try {
//     const db = request.server.mongo.db;
//     const collection = db.collection('products');

//     const file = request.body.file;
//     if (!file) {
//       return reply.code(400).send({
//         success: false,
//         message: 'Excel file is required'
//       });
//     }

//     const buffer = await file.toBuffer();
//     const workbook = XLSX.read(buffer, { type: 'buffer' });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json(sheet);

//     if (!rows.length) {
//       return reply.code(400).send({
//         success: false,
//         message: 'Excel file is empty'
//       });
//     }

//     const validRows = [];
//     const errors = [];

//     for (let i = 0; i < rows.length; i++) {
//       try {
//         // 1️⃣ Validate Excel row
//         const validatedRow = await createExcelProductSchema.validate(rows[i], {
//           abortEarly: false,
//           stripUnknown: true
//         });

//         // 2️⃣ Generate UNIQUE slug using util
//         const slug = await generateUniqueSlug(
//           validatedRow.title,
//           collection
//         );

//         // 3️⃣ Generate Amazon link
//         const amazon_link = `https://www.amazon.in/${slug}/dp/${validatedRow.sku}/?tag=womenica-21`;

//         // 4️⃣ Push ONLY allowed DB fields
//         validRows.push({
//           title: validatedRow.title,
//           meta_title: validatedRow.meta_title,
//           meta_keywords: validatedRow.meta_keywords,
//           meta_description: validatedRow.meta_description,
//           image_url: validatedRow.image_url,
//           description: validatedRow.description,
//           product_price: validatedRow.product_price,
//           sku: validatedRow.sku,
//           productCategoryId: new ObjectId(validatedRow.productCategoryId),
//           status: validatedRow.status,
//           showingOnHomePage: validatedRow.showingOnHomePage,
//           slug,
//           amazon_link,
//           createdAt: new Date()
//         });

//       } catch (err) {
//         errors.push({
//           row: i + 2, // Excel row (header = 1)
//           errors: err.errors
//         });
//       }
//     }

//     if (!validRows.length) {
//       return reply.code(400).send({
//         success: false,
//         message: 'No valid rows found in Excel',
//         errors
//       });
//     }

//     await collection.insertMany(validRows);

//     return reply.send({
//       success: true,
//       message: 'Excel imported successfully',
//       inserted: validRows.length,
//       failed: errors.length,
//       errors
//     });

//   } catch (error) {
//     request.log.error(error);
//     reply.code(500).send({
//       success: false,
//       message: 'Internal Server Error'
//     });
//   }
// };

import XLSX from "xlsx";
import { ObjectId } from "@fastify/mongodb";
import { generateUniqueSlug } from "../utils/generateUniqueSlug.js";
import { createExcelProductSchema } from "../validators/product.validator.js";

const isValidObjectId = (id) =>
  ObjectId.isValid(id) && String(new ObjectId(id)) === id;

export const uploadExcelToProducts = async (request, reply) => {
  try {
    const db = request.server.mongo.db;
    const collection = db.collection("products");

    const file = request.body.file;
    if (!file) {
      return reply.code(400).send({
        success: false,
        message: "Excel file is required",
      });
    }

    const buffer = await file.toBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return reply.code(400).send({
        success: false,
        message: "Excel file is empty",
      });
    }

    const validRows = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const validatedRow = await createExcelProductSchema.validate(rows[i], {
          abortEarly: false,
          stripUnknown: true,
        });

        // 🔴 ObjectId validation
        if (
          validatedRow.productCategoryId &&
          !isValidObjectId(validatedRow.productCategoryId)
        ) {
          throw new Error("Invalid productCategoryId");
        }

        const slug = await generateUniqueSlug(
          validatedRow.title,
          collection
        );

        const amazon_link = validatedRow.sku
          ? `https://www.amazon.in/${slug}/dp/${validatedRow.sku}/?tag=womenica-21`
          : "";

       validRows.push({
  // 🔥 Excel se aane wale saare valid fields
  ...validatedRow,

  // 🔒 Force-controlled / system fields
  product_price: validatedRow.product_price || 0,
  sku: validatedRow.sku || "",
  productCategoryId: validatedRow.productCategoryId
    ? new ObjectId(validatedRow.productCategoryId)
    : null,

  status: validatedRow.status ?? true,
  showingOnHomePage: validatedRow.showingOnHomePage ?? false,

  slug,
  amazon_link,
  createdAt: new Date(),
});


      } catch (err) {
        console.log("❌ ROW FAILED:", rows[i]);
        console.log("❌ ERROR:", err.errors || err.message);

        errors.push({
          row: i + 2,
          error: err.errors || err.message,
        });
      }
    }

    // 🔴 IMPORTANT: ek bhi error → kuch insert nahi hoga
    if (errors.length > 0) {
      return reply.code(400).send({
        success: false,
        message: "Excel contains errors. No data inserted.",
        inserted: 0,
        failed: errors.length,
        errors,
      });
    }

    // ✅ Sab rows valid → insert
    await collection.insertMany(validRows);

    return reply.send({
      success: true,
      message: "Excel imported successfully",
      inserted: validRows.length,
      failed: 0,
    });

  } catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

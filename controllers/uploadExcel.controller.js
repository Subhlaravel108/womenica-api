// import XLSX from 'xlsx';

// export const uploadExcelToProducts = async (request, reply) => {
//   try {
//     const db = request.server.mongo.db;
//     const collection = db.collection('products');

//     const data = await request.body.file;
//     if (!data) {
//       return reply.code(400).send({
//         success: false,
//         message: 'Excel file is required'
//       });
//     }

//     // Buffer read
//     const buffer = await data.toBuffer();

//     // Excel read
//     const workbook = XLSX.read(buffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];

//     // Sheet → JSON
//     const rows = XLSX.utils.sheet_to_json(sheet);

//     if (rows.length === 0) {
//       return reply.code(400).send({
//         success: false,
//         message: 'Excel file is empty'
//       });
//     }

//     // Optional: add extra fields
//     const finalData = rows.map(item => ({
//       ...item,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     }));

//     // MongoDB insert
//     await collection.insertMany(finalData);

//     return reply.code(200).send({
//       success: true,
//       message: 'Excel data imported successfully',
//       totalInserted: finalData.length
//     });

//   } catch (error) {
//     request.log.error(error);
//     reply.code(500).send({
//       success: false,
//       message: 'Internal Server Error'
//     });
//   }
// };


import XLSX from 'xlsx';
import { createProductSchema } from '../validators/product.validator.js';

export const uploadExcelToProducts = async (request, reply) => {
  try {
    const db = request.server.mongo.db;
    const collection = db.collection('products');

    const file = request.body.file;
    if (!file) {
      return reply.code(400).send({
        success: false,
        message: 'Excel file is required'
      });
    }

    const buffer = await file.toBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return reply.code(400).send({
        success: false,
        message: 'Excel file is empty'
      });
    }

    const validRows = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const validatedRow = await createProductSchema.validate(rows[i], {
          abortEarly: false,
          stripUnknown: true
        });

        validRows.push({
          ...validatedRow,
          createdAt: new Date(),
          updatedAt: new Date()
        });

      } catch (err) {
        errors.push({
          row: i + 2, // Excel row (header = 1)
          errors: err.errors
        });
      }
    }

    if (!validRows.length) {
      return reply.code(400).send({
        success: false,
        message: 'No valid rows found in Excel',
        errors
      });
    }

    await collection.insertMany(validRows);

    return reply.send({
      success: true,
      message: 'Excel imported successfully',
      inserted: validRows.length,
      failed: errors.length,
      errors
    });

  } catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
};


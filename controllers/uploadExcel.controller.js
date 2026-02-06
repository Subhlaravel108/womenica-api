
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
          stripUnknown: false,
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


export const updatePriceByExcel = async (request, reply) => {
  try {
    const file = request.body.file;

    if (!file) {
      return reply.code(400).send({
        success: false,
        message: "Excel file is required",
      });
    }

    const buffer = await file.toBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const db = request.server.mongo.db;
    const collection = db.collection("products");

    let updated = 0;
    let notFound = 0;
    let errors = [];

    for (const row of rows) {
      const rawSku = row.sku || row.SKU;
      let price = row.price || row.Price;

      if (!rawSku || price == null) {
        errors.push({ row, error: "Missing SKU or Price" });
        continue;
      }

      const sku = String(rawSku).trim().toUpperCase();
      price = Number(String(price).replace(/[₹,]/g, ""));

      if (isNaN(price)) {
        errors.push({ sku, error: "Invalid price format" });
        continue;
      }

      const result = await collection.updateOne(
        { sku },
        { $set: { product_price: price } }
      );

      if (result.matchedCount === 0) {
        notFound++;
      } else {
        updated++; // ✅ matched = success
      }
    }
    
    // console.log("✅ Price update completed:", { updated, notFound, errors });
    return reply.send({
      success: true,
      message: "Price update completed",
      summary: {
        totalRows: rows.length,
        updated,
        notFound,
        errors: errors.length ? errors : undefined,
      },
    });


  } catch (error) {
    console.error("🔥 Price update failed:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};


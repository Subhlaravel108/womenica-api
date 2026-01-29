import * as yup from 'yup';

const STATUs=["Active","Inactive"];

// Product validation schema
export const createProductSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),

  meta_title: yup
    .string()
    .required("meta_title is required")
    .trim()
    .max(200, 'Meta title must not exceed 200 characters'),
    

  meta_keywords: yup
    .string()
    .required("meta_keywords is required")
    .trim()
    .max(500, 'Meta keywords must not exceed 500 characters')
    ,

  meta_description: yup
    .string()
    .required("meta_description is required")
    .trim()
    .max(500, 'Meta description must not exceed 500 characters')
    ,


  sku: yup
    .string()
    .required('SKU is required')
    .trim()
    .min(3, 'SKU must be at least 3 characters')
    .max(100, 'SKU must not exceed 100 characters'),

  image_url: yup
    .string()
    .trim()
    .url('Image URL must be a valid URL')
    .nullable(),

  product_price: yup
    .number()
    .typeError('Product price must be a number')
    .positive('Product price must be greater than 0')
    .required('Product price is required'),

  description: yup
    .string()
    .trim()
    .max(5000, 'Description must not exceed 5000 characters')
    .nullable(),

  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .default('active'),
    productCategoryId: yup.string().trim().required("productCategoryId is required"),

  // ✅ New boolean field
   showingOnHomePage: yup
  .boolean()
  .required("showingOnHomePage is required")
  .oneOf([true, false], "showingOnHomePage must be true or false"),

  inTrending: yup
  .boolean()
  .required("inTrending is required")
  .oneOf([true, false], "inTrending must be true or false"),

  isBestSeller: yup
  .boolean()
  .required("isBestSeller is required")
  .oneOf([true, false], "isBestSeller must be true or false"),

});

const excelStatus = (value) => {
  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    if (["yes", "true", "active", "1"].includes(v)) return "active";
    if (["no", "false", "inactive", "0"].includes(v)) return "inactive";
  }

  if (typeof value === "boolean") {
    return value ? "active" : "inactive";
  }

  return "inactive"; // default
};

// SHOWING ON HOME PAGE → boolean (true / false only)
const excelBoolean = (value) => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    if (["yes", "true", "1"].includes(v)) return true;
    if (["no", "false", "0"].includes(v)) return false;
  }

  return false; // default
};

export const createExcelProductSchema = yup
  .object({
    title: yup.string().required("title is required"),

    image_url: yup.string().nullable(),

    description: yup.string().nullable(),

    product_price: yup
      .number()
      .transform((_, v) => (v === "" || v == null ? 0 : Number(v)))
      .default(0),

    sku: yup.string().nullable(),

    productCategoryId: yup.string().nullable(),

    // ✅ Active / Inactive only
    status: yup
      .string()
      .transform((_, v) => excelStatus(v))
      .oneOf(["active", "inactive"])
      .default("active"),

    // ✅ true / false only
    showingOnHomePage: yup
      .boolean()
      .transform((_, v) => excelBoolean(v))
      .default(false),
  })
  .noUnknown(false);
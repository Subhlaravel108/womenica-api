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
});
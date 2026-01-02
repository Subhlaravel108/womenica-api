import * as yup from 'yup';

const STATUS = ["Active", "Inactive"];
// Product Category validation schema
export const createProductCategorySchema = yup.object({
     title: yup.string().required("Title is required"),
  description: yup.string().trim().required("Description is required"),
  meta_title: yup.string().trim().required("Meta title is required"),
  meta_description: yup.string().trim().required("Meta description is required"),
  meta_keywords: yup.string().trim().required("Meta keywords are required"),
  image: yup.string().url("Image must be a valid url").required("Image is required"), // URL
    status: yup.string().oneOf(STATUS, `Status must be one of: ${STATUS.join(", ")}`).required("Status is required"),
     showingOnHomePage: yup
      .boolean()
      .required("showingOnHomePage is required")
      .oneOf([true, false], "showingOnHomePage must be true or false"),
});

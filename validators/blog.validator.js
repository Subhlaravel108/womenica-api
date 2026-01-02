import * as yup from "yup";

const BLOG_STATUS = ["Draft", "Published"];

export const createBlogSchema = yup.object({
  title: yup.string().trim().required("Title is required"),
  author: yup.string().trim().required("Author is required"),
  categoryId: yup.string().trim().required("CategoryId is required"),
  summary: yup.string().trim().required("Summary is required"),
  content: yup.string().trim().required("Content is required"),
  featuredImage: yup.string().url("Featured image must be a valid URL").required("Featured image is required"),
  publishDate: yup
    .mixed()
    .test("is-date-or-null", "publishDate must be a valid date or null", value => {
      if (value === null || value === undefined || value === "") return true;
      const d = new Date(value);
      return !isNaN(d);
    })
    .nullable(),
    showingOnHomePage: yup
  .boolean()
  .required("showingOnHomePage is required")
  .oneOf([true, false], "showingOnHomePage must be true or false"),
  status: yup.string().oneOf(BLOG_STATUS, `Status must be one of: ${BLOG_STATUS.join(", ")}`).required("Status is required"),
  tags: yup.mixed().optional(), // accept string (comma) or array
  meta_title: yup.string().trim().optional(),
  meta_description: yup.string().trim().optional(),
  meta_keywords: yup.mixed().optional() // string or array
});
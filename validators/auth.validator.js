import * as yup from 'yup';

// Auth validation schema
export const registerSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
    email: yup
    .string()
    .required('Email is required')
    .trim()
    .email('Email must be a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
    confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
phone: yup
  .string()
  .trim()
  .required('Phone number is required')
  .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')

});


export const changePasswordSchema = yup.object({
    current_password: yup
    .string()
    .required("Current password is required"),

  new_password: yup
    .string()
    .min(6, "New password must be at least 6 characters")
    .required("New password is required"),

  new_password_confirmation: yup
    .string()
    .oneOf([yup.ref("new_password"), null], "Passwords must match")
    .required("Password confirmation is required")
});

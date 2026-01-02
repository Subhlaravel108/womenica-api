import bcrypt from 'bcryptjs';
import { sendOTPEmail,generateOTP, sendResetPasswordEmail } from '../utils/email.js';
import { ObjectId } from '@fastify/mongodb';

// export const register = async (request, reply) => {
//   try {
//     // form-data me value .value me hoti hai
//     const username = request.body.username?.value || request.body.username;
//     const email = request.body.email?.value || request.body.email;
//     const password = request.body.password?.value || request.body.password;
//     const phone = request.body.phone?.value || request.body.phone;

//     if (!email || !password) {
//       return reply.code(400).send({
//         success: false,
//         message: 'Email and password are required'
//       });
//     }

//     const db = request.server.mongo.db;
//     const collection = db.collection('users');

//     const existingUser = await collection.findOne({ email });
//     if (existingUser) {
//       return reply.code(400).send({
//         success: false,
//         message: 'Email is already registered'
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const userData = {
//       username,
//       email,
//       password: hashedPassword,
//       phone,
//       role: 'user',
//       status: 'active',
//       createdAt: new Date()
//     };

//     const result = await collection.insertOne(userData);

//     return reply.code(201).send({
//       success: true,
//       message: 'User registered successfully',
//       id: result.insertedId
//     });

//   } catch (error) {
//     request.log.error(error);
//     return reply.code(500).send({
//       success: false,
//       message: 'Internal Server Error'
//     });
//   }
// };


// import bcrypt from 'bcryptjs';



export const register = async (request, reply) => {
  try {
    // const body = await parseRequest(request);
    const { username, email, password, phone } = request.body;

    // Validate input
    // const validation = validateRegister({ name, email, password, phone });
    
    // if (!validation.isValid) {
    //   return reply.status(400).send({
    //     success: false,
    //     message: 'Validation failed',
    //     errors: validation.errors
    //   });
    // }

    // Get MongoDB from fastify instance
    const db = request.server.mongo.db;

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      return reply.status(400).send({
        success: false,
        message: 'User already exists with this email',
        errors: {
          email: 'This email is already registered'
        } 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate and send OTP
    const otp = generateOTP();
    const emailResult = await sendOTPEmail(email, otp);
    
    // Log OTP for development/testing
    console.log(`🔑 OTP for ${email}: ${otp}`);
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
    }

    // Create user
    const user = {
      username,
      email,
      password: hashedPassword,
      phone,
      role: 'user',
      otp: otp,
      status:"Active",
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(user);

    return reply.status(201).send({
      success: true,
      message: 'User registered successfully. Please check your email for OTP.',
      data: {
        id: result.insertedId,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailSent: emailResult.success,
        status:user.status
      }
    });

  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


export const verifyOTP = async (request, reply) => {
  try {
    
    const email = request.body?.email?.value || request.body?.email;
    const otp = request.body?.otp?.value || request.body?.otp;
    if (!email || !otp) {
      return reply.status(400).send({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const db = request.server.mongo.db;
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return reply.status(400).send({
        success: false,
        message: 'User is already verified'
      });
    }

    if (user.otp !== otp) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return reply.status(400).send({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Update user as verified
    await db.collection('users').updateOne(
      { email },
      {
        $set: {
          isVerified: true,
          otp: null,
          otpExpiresAt: null,
          updatedAt: new Date()
        }
      }
    );

    return reply.status(200).send({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const login = async (request, reply) => {
  try {

    // ✅ JSON + FormData compatible
    const email = request.body?.email?.value || request.body?.email;

    const password = request.body?.password?.value || request.body?.password;

    if (!email || !password) {
      return reply.code(400).send({
        success: false,
        message: 'Email and password are required'
      });
    }

    const db = request.server.mongo.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: 'Database connection not available'
      });
    }

    const collection = db.collection('users');
    const user = await collection.findOne({ email });

    if (!user) {
      return reply.code(400).send({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if(!user.isVerified){
      return reply.code(403).send({
        success: false,
        message: 'Email not verified. Please verify your email before logging in.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return reply.code(400).send({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ✅ JWT generate
    const token = request.server.jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      { expiresIn: '7d' }
    );

    return reply.code(200).send({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        token
      },
    });

  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
};




export const verifyResetOTP = async (request, reply) => {
  try {
    // const body = await parseRequest(request);
    // const { email, otp } = request.body;
    const email = request.body?.email?.value || request.body?.email;
    const otp = request.body?.otp?.value || request.body?.otp;

    if (!email || !otp) {
      return reply.status(400).send({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const db = request.server.mongo.db;
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    // Check reset OTP
    if (user.resetOTP !== otp) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid reset OTP'
      });
    }

    // Check if OTP expired
    if (new Date() > new Date(user.resetExpiresAt)) {
      return reply.status(400).send({
        success: false,
        message: 'Reset OTP has expired'
      });
    }

    // Mark OTP as verified (don't clear it yet, frontend will use it for password reset)
    await db.collection('users').updateOne(
      { email },
      {
        $set: {
          resetOTPVerified: true,
          updatedAt: new Date()
        }
      }
    );

    return reply.status(200).send({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.'
    });

  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const resetPassword = async (request, reply) => {
  try {
    // const body = await parseRequest(request);
    // const { email, otp, password, password_confirmation } = request.body;

    const email = request.body?.email?.value || request.body?.email;
    const otp = request.body?.otp?.value || request.body?.otp;
    const password = request.body?.password?.value || request.body?.password;
    const password_confirmation = request.body?.password_confirmation?.value || request.body?.password_confirmation;

    if (!email || !otp || !password || !password_confirmation) {
      return reply.status(400).send({
        success: false,
        message: 'Email, OTP, password, and password confirmation are required'
      });
    }

    // Password validation
    if (password.length < 6) {
      return reply.status(400).send({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Password confirmation validation
    if (password !== password_confirmation) {
      return reply.status(400).send({
        success: false,
        message: 'Password and password confirmation do not match'
      });
    }

    const db = request.server.mongo.db;
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP is verified
    if (!user.resetOTPVerified) {
      return reply.status(400).send({
        success: false,
        message: 'Please verify OTP first'
      });
    }

    // Check reset OTP again for security
    if (user.resetOTP !== otp) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP expired
    if (new Date() > new Date(user.resetExpiresAt)) {
      return reply.status(400).send({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear all reset fields
    await db.collection('users').updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          resetOTP: null,
          resetExpiresAt: null,
          resetOTPVerified: null,
          updatedAt: new Date()
        }
      }
    );

    return reply.status(200).send({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const forgotPassword = async (request, reply) => {
  try {
    // Handle both JSON and form-data
    const email = request.body?.email?.value || request.body?.email;

    if (!email) {
      return reply.status(400).send({
        success: false,
        message: 'Email is required'
      });
    }

    // Check database connection
    const db = request.server.mongo?.db;
    if (!db) {
      return reply.status(500).send({
        success: false,
        message: 'Database connection not available'
      });
    }

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate reset OTP
    const resetOTP = generateOTP();
    const resetExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset OTP
    await db.collection('users').updateOne(
      { email },
      {
        $set: {
          resetOTP: resetOTP,
          resetExpiresAt: resetExpiresAt,
          updatedAt: new Date()
        }
      }
    );

    // Send reset email
    const emailResult = await sendResetPasswordEmail(email, resetOTP);
    
    // Log OTP for development/testing
    console.log(`🔑 Reset OTP for ${email}: ${resetOTP}`);

    if (!emailResult.success) {
      console.error('Failed to send reset password email:', emailResult.error);
      // Still return success but mention email might not have been sent
      return reply.status(200).send({
        success: true,
        message: 'Password reset OTP generated. Please check your email.',
        emailSent: false,
        warning: 'Email sending failed, but OTP is available in server logs for testing'
      });
    }

    return reply.status(200).send({
      success: true,
      message: 'Password reset OTP sent to your email',
      emailSent: true
    });

  } catch (error) {
    console.error('❌ Error in forgotPassword:', error);
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};



export const changePassword = async (req, reply) => {
  try {
    // const { current_password, new_password } = req.body;
     const current_password = req.body?.current_password?.value || req.body?.current_password;
      const new_password = req.body?.new_password?.value || req.body?.new_password;
   
    const db = req.mongo?.db || req.server?.mongo?.db;

    
    const userId = req.user.id;

    
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // 🔹 5) Check current password
    const isMatch = await bcrypt.compare(current_password, user.password);

    if (!isMatch) {
      return reply.status(400).send({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // 🔹 6) Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // 🔹 7) Update password in DB
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } }
    );

    return reply.status(200).send({
      success: true,
      message: "Password updated successfully",
    });

  } catch (err) {
    console.error("Change Password Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
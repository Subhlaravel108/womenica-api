import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    '❌ MONGODB_URI is required in .env file.\n' +
    'Please set your cloud MongoDB connection string in .env file.\n' +
    'Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/womenica?retryWrites=true&w=majority'
  );
}

export { MONGODB_URI };

import Cors from 'cors';

// Initialize CORS middleware
const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'],  // Adjust this as needed
  allowedHeaders: ['Content-Type'],     // Adjust this if needed
});

// Helper function to run middleware
export const runCors = (req, res) => {
  return new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve(result);
    });
  });
};

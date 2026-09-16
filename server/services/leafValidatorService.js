const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');

const SCRIPT_PATH = path.resolve(__dirname, '../../ai_service/leaf_validator.py');

/**
 * Validates whether an uploaded image contains a legitimate agricultural plant/crop leaf.
 * Uses FastAPI microservice if available, falling back to local Python OpenCV execution.
 * 
 * @param {string} imagePath - Absolute path to the uploaded image file
 * @param {string} aiServiceUrl - URL of the FastAPI microservice
 * @returns {Promise<{is_leaf: boolean, confidence: number, reason: string, reason_ml: string, detected_type: string, metrics?: object}>}
 */
async function validateUploadedLeaf(imagePath, aiServiceUrl = 'http://127.0.0.1:8000') {
  if (!fs.existsSync(imagePath)) {
    return {
      is_leaf: false,
      confidence: 0,
      reason: 'Image file does not exist.',
      reason_ml: 'ചിത്രം കണ്ടെത്താനായില്ല.',
      detected_type: 'File Not Found'
    };
  }

  // 1. Try FastAPI microservice endpoint
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));

    const response = await axios.post(`${aiServiceUrl}/validate-leaf`, formData, {
      headers: formData.getHeaders(),
      timeout: 4000
    });

    if (response.data && typeof response.data.is_leaf === 'boolean') {
      return response.data;
    }
  } catch (apiErr) {
    // If API responded with 400 and validation result
    if (apiErr.response?.data && typeof apiErr.response.data.is_leaf === 'boolean') {
      return apiErr.response.data;
    }
    // Otherwise FastAPI is offline or starting up, proceed to local python fallback
  }

  // 2. Direct local Python execution fallback
  return new Promise((resolve) => {
    // Try 'py' or python binaries
    const pythonCmd = process.env.PYTHON_PATH || 'py';
    
    execFile(pythonCmd, [SCRIPT_PATH, imagePath], { timeout: 6000 }, (error, stdout, stderr) => {
      if (stdout && stdout.trim()) {
        try {
          const parsed = JSON.parse(stdout.trim());
          return resolve(parsed);
        } catch (parseErr) {
          console.warn('Leaf validator stdout parse warning:', parseErr.message);
        }
      }

      // If 'py' failed, try 'python'
      execFile('python', [SCRIPT_PATH, imagePath], { timeout: 6000 }, (err2, stdout2) => {
        if (stdout2 && stdout2.trim()) {
          try {
            const parsed2 = JSON.parse(stdout2.trim());
            return resolve(parsed2);
          } catch (e) {}
        }

        // Try direct python path in AppData if available
        const appDataPy = 'C:\\Users\\User\\AppData\\Local\\Python\\bin\\python.exe';
        if (fs.existsSync(appDataPy)) {
          execFile(appDataPy, [SCRIPT_PATH, imagePath], { timeout: 6000 }, (err3, stdout3) => {
            if (stdout3 && stdout3.trim()) {
              try {
                return resolve(JSON.parse(stdout3.trim()));
              } catch (e) {}
            }
            // If all execution fails, allow pass-through with warning
            resolve({
              is_leaf: true,
              confidence: 75.0,
              reason: 'Validation bypassed (local engine offline).',
              reason_ml: 'വാളിഡേഷൻ പൂർത്തിയാക്കാൻ സാധിച്ചില്ല.',
              detected_type: 'Unknown'
            });
          });
          return;
        }

        resolve({
          is_leaf: true,
          confidence: 75.0,
          reason: 'Validation bypassed.',
          detected_type: 'Unknown'
        });
      });
    });
  });
}

module.exports = {
  validateUploadedLeaf
};

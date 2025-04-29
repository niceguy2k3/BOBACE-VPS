/**
 * Script để tải các mô hình face-api.js
 * 
 * Chạy script này bằng cách:
 * 1. Mở terminal
 * 2. Chuyển đến thư mục frontend
 * 3. Chạy: node src/utils/downloadFaceModels.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// URL gốc của các mô hình face-api.js
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// Danh sách các mô hình cần tải
const MODELS = [
  // TinyFaceDetector model
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  
  // FaceLandmark68 model
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  
  // FaceRecognition model
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  
  // FaceExpression model
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

// Thư mục đích để lưu các mô hình
const MODELS_DIR = path.join(process.cwd(), 'public', 'models');

// Hàm tải một tệp từ URL
async function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    console.log(`Đang tải ${url}...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Lỗi khi tải ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Đã tải xong ${url}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Xóa tệp nếu có lỗi
      reject(err);
    });
  });
}

// Hàm chính để tải tất cả các mô hình
async function downloadModels() {
  try {
    // Tạo thư mục models nếu chưa tồn tại
    if (!fs.existsSync(MODELS_DIR)) {
      await mkdir(MODELS_DIR, { recursive: true });
      console.log(`Đã tạo thư mục ${MODELS_DIR}`);
    }
    
    // Tải từng mô hình
    for (const model of MODELS) {
      const url = `${BASE_URL}/${model}`;
      const filePath = path.join(MODELS_DIR, model);
      
      await downloadFile(url, filePath);
    }
    
    console.log('Đã tải xong tất cả các mô hình!');
  } catch (error) {
    console.error('Lỗi khi tải mô hình:', error);
  }
}

// Chạy hàm tải mô hình
downloadModels();
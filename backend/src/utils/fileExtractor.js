const fs = require('fs');
const path = require('path');

const extractTextFromFile = async (fileUrl) => {
  const filePath = path.join(__dirname, '../../', fileUrl);
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found on disk');
  }

  const ext = path.extname(filePath).toLowerCase();
  
  // Text/code extensions
  const textExtensions = ['.txt', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.h', '.html', '.css', '.json', '.md'];
  if (textExtensions.includes(ext)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  
  if (ext === '.pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    } catch (err) {
      console.warn('PDF parsing failed:', err);
      return 'PDF file loaded, but text could not be parsed dynamically.';
    }
  }

  if (ext === '.docx' || ext === '.doc') {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (err) {
      console.warn('DOCX parsing failed:', err);
      return 'Word document loaded, but text could not be parsed dynamically.';
    }
  }

  return 'Unsupported binary file type.';
};

module.exports = { extractTextFromFile };

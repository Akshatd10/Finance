import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PlagiarismResult from '../models/PlagiarismResult.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/plagiarism';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Mock plagiarism checking function
const performPlagiarismCheck = async (filePath, fileName) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  // Mock plagiarism score (0-30% for realistic results)
  const plagiarismScore = Math.floor(Math.random() * 31);
  const originalityScore = 100 - plagiarismScore;
  
  // Mock word count
  const wordCount = Math.floor(Math.random() * 2000) + 500;
  
  // Mock sources if plagiarism score is significant
  const sources = [];
  if (plagiarismScore > 5) {
    const numSources = Math.floor(plagiarismScore / 10) + 1;
    for (let i = 0; i < numSources; i++) {
      sources.push({
        url: `https://example-source-${i + 1}.com/article`,
        title: `Academic Paper ${i + 1} - Similar Content Found`,
        similarity: Math.floor(Math.random() * plagiarismScore) + 1,
        matchedWords: Math.floor(Math.random() * 100) + 10,
        description: 'Similar content detected in academic database'
      });
    }
  }
  
  // Generate suggestions based on score
  const suggestions = [];
  if (plagiarismScore > 25) {
    suggestions.push('High similarity detected - significant revision required');
    suggestions.push('Review and rewrite highlighted sections');
    suggestions.push('Add proper citations for all referenced materials');
    suggestions.push('Consider using quotation marks for direct quotes');
  } else if (plagiarismScore > 10) {
    suggestions.push('Moderate similarity found - review highlighted sections');
    suggestions.push('Add citations where appropriate');
    suggestions.push('Consider paraphrasing similar content');
  } else {
    suggestions.push('Excellent originality score!');
    suggestions.push('No significant plagiarism detected');
    if (plagiarismScore > 0) {
      suggestions.push('Minor similarities are within acceptable range');
    }
  }
  
  return {
    plagiarismScore,
    originalityScore,
    wordCount,
    sources,
    suggestions,
    processingTime: 2000 + Math.random() * 3000
  };
};

// Upload and check document for plagiarism
router.post('/check', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create initial plagiarism result record
    const result = new PlagiarismResult({
      userId: req.user.userId,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).substring(1).toLowerCase(),
      status: 'processing'
    });

    await result.save();

    // Start plagiarism check in background
    performPlagiarismCheck(req.file.path, req.file.originalname)
      .then(async (checkResult) => {
        // Update result with plagiarism check data
        result.status = 'completed';
        result.plagiarismScore = checkResult.plagiarismScore;
        result.originalityScore = checkResult.originalityScore;
        result.wordCount = checkResult.wordCount;
        result.sources = checkResult.sources;
        result.suggestions = checkResult.suggestions;
        result.processingTime = checkResult.processingTime;
        result.reportGenerated = true;
        
        await result.save();
      })
      .catch(async (error) => {
        console.error('Plagiarism check failed:', error);
        result.status = 'failed';
        result.errorMessage = 'Failed to process document';
        await result.save();
      });

    res.status(201).json({
      message: 'Document uploaded successfully. Processing started.',
      resultId: result._id,
      status: 'processing'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// Get user's plagiarism check results
router.get('/results', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const results = await PlagiarismResult.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-textContent -highlightedText');

    const total = await PlagiarismResult.countDocuments({ userId: req.user.userId });

    res.json({
      results,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Fetch results error:', error);
    res.status(500).json({ message: 'Server error fetching results' });
  }
});

// Get specific plagiarism result
router.get('/results/:id', auth, async (req, res) => {
  try {
    const result = await PlagiarismResult.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).select('-textContent -highlightedText');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json({ result });
  } catch (error) {
    console.error('Fetch result error:', error);
    res.status(500).json({ message: 'Server error fetching result' });
  }
});

// Download plagiarism report
router.get('/results/:id/download', auth, async (req, res) => {
  try {
    const result = await PlagiarismResult.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    if (result.status !== 'completed') {
      return res.status(400).json({ message: 'Report not ready for download' });
    }

    // Generate a simple text report
    const reportContent = `
PLAGIARISM CHECK REPORT
======================

Document: ${result.originalFileName}
Check Date: ${result.createdAt.toLocaleDateString()}
Processing Time: ${(result.processingTime / 1000).toFixed(2)} seconds

RESULTS SUMMARY
===============
Plagiarism Score: ${result.plagiarismScore}%
Originality Score: ${result.originalityScore}%
Word Count: ${result.wordCount}
Risk Level: ${result.getRiskLevel().toUpperCase()}

SOURCES FOUND
=============
${result.sources.length > 0 ? 
  result.sources.map((source, index) => 
    `${index + 1}. ${source.title}
   URL: ${source.url}
   Similarity: ${source.similarity}%
   Matched Words: ${source.matchedWords}
   
`).join('') : 'No significant sources found.'}

SUGGESTIONS
===========
${result.suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}

---
Generated by LibraryPro Plagiarism Checker
    `.trim();

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="plagiarism-report-${result._id}.txt"`);
    res.send(reportContent);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ message: 'Server error downloading report' });
  }
});

// Delete plagiarism result
router.delete('/results/:id', auth, async (req, res) => {
  try {
    const result = await PlagiarismResult.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Clean up uploaded file
    const filePath = path.join('uploads/plagiarism', result.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ message: 'Server error deleting result' });
  }
});

export default router;

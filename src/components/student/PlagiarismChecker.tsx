import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle, X, Download, Eye, Clock } from 'lucide-react';

interface PlagiarismResult {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'failed';
  plagiarismScore: number;
  originalityScore: number;
  wordCount: number;
  sources: {
    url: string;
    similarity: number;
    title: string;
    matchedWords: number;
    description: string;
  }[];
  suggestions: string[];
  processingTime: number;
}

const PlagiarismChecker = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<PlagiarismResult | null>(null);
  const [results, setResults] = useState<PlagiarismResult[]>([
    // Mock data for demonstration
    {
      id: '1',
      fileName: 'research_paper.pdf',
      uploadDate: '2024-01-20',
      status: 'completed',
      plagiarismScore: 15,
      originalityScore: 85,
      wordCount: 2450,
      sources: [
        {
          url: 'https://example.com/article1',
          similarity: 8,
          title: 'Machine Learning Fundamentals',
          matchedWords: 45,
          description: 'Similar content found in academic database'
        },
        {
          url: 'https://example.com/article2',
          similarity: 7,
          title: 'Introduction to Neural Networks',
          matchedWords: 32,
          description: 'Matching phrases detected in research paper'
        }
      ],
      suggestions: [
        'Consider paraphrasing the highlighted sections',
        'Add proper citations for referenced materials',
        'Use quotation marks for direct quotes'
      ],
      processingTime: 3200
    },
    {
      id: '2',
      fileName: 'essay_draft.docx',
      uploadDate: '2024-01-18',
      status: 'completed',
      plagiarismScore: 3,
      originalityScore: 97,
      wordCount: 1850,
      sources: [
        {
          url: 'https://example.com/source1',
          similarity: 3,
          title: 'Financial Markets Overview',
          matchedWords: 12,
          description: 'Minor similarity in common terminology'
        }
      ],
      suggestions: [
        'Excellent originality score!',
        'Minor similarity detected - review highlighted text',
        'No significant plagiarism concerns'
      ],
      processingTime: 2100
    }
  ]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF, DOC, DOCX, or TXT file');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    // Simulate upload and processing
    setTimeout(() => {
      const newResult: PlagiarismResult = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: selectedFile.name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'processing',
        plagiarismScore: 0,
        originalityScore: 100,
        wordCount: 0,
        sources: [],
        suggestions: [],
        processingTime: 0
      };

      setResults(prev => [newResult, ...prev]);
      setSelectedFile(null);
      setIsUploading(false);

      // Simulate processing completion
      setTimeout(() => {
        const score = Math.floor(Math.random() * 31); // Random score 0-30%
        const wordCount = Math.floor(Math.random() * 2000) + 500;
        const processingTime = 2000 + Math.random() * 3000;
        
        setResults(prev => prev.map(r => 
          r.id === newResult.id 
            ? {
                ...r,
                status: 'completed',
                plagiarismScore: score,
                originalityScore: 100 - score,
                wordCount,
                processingTime,
                sources: score > 10 ? [
                  {
                    url: 'https://example.com/source',
                    similarity: score,
                    title: 'Similar Academic Paper',
                    matchedWords: Math.floor(score * 2),
                    description: 'Similar content detected in academic database'
                  }
                ] : [],
                suggestions: score > 20 ? [
                  'High similarity detected - review and revise',
                  'Add proper citations',
                  'Consider paraphrasing'
                ] : score > 10 ? [
                  'Moderate similarity found',
                  'Review highlighted sections'
                ] : [
                  'Excellent originality!',
                  'No significant plagiarism detected'
                ]
              }
            : r
        ));
      }, 3000);
    }, 1000);
  };

  const handleViewReport = (result: PlagiarismResult) => {
    setSelectedResult(result);
    setShowReportModal(true);
  };

  const handleDownloadReport = (result: PlagiarismResult) => {
    const reportContent = `
PLAGIARISM CHECK REPORT
======================

Document: ${result.fileName}
Check Date: ${result.uploadDate}
Processing Time: ${(result.processingTime / 1000).toFixed(2)} seconds

RESULTS SUMMARY
===============
Plagiarism Score: ${result.plagiarismScore}%
Originality Score: ${result.originalityScore}%
Word Count: ${result.wordCount}
Risk Level: ${result.plagiarismScore <= 10 ? 'LOW' : result.plagiarismScore <= 25 ? 'MEDIUM' : 'HIGH'}

SOURCES FOUND
=============
${result.sources.length > 0 ? 
  result.sources.map((source, index) => 
    `${index + 1}. ${source.title}
   URL: ${source.url}
   Similarity: ${source.similarity}%
   Matched Words: ${source.matchedWords}
   Description: ${source.description}
   
`).join('') : 'No significant sources found.'}

SUGGESTIONS
===========
${result.suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}

---
Generated by LibraryPro Plagiarism Checker
Report ID: ${result.id}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plagiarism-report-${result.fileName}-${result.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPlagiarismColor = (score: number) => {
    if (score <= 10) return 'text-emerald-400';
    if (score <= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPlagiarismBadge = (score: number) => {
    if (score <= 10) return 'bg-emerald-500/20 text-emerald-300';
    if (score <= 20) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Plagiarism Checker</h1>
        <p className="text-gray-300">Check your documents for originality and proper citations</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
        <div className="text-center">
          <FileText className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Upload Document for Analysis</h3>
          <p className="text-gray-300 mb-6">Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)</p>

          {!selectedFile ? (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-blue-400 transition-colors duration-200">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <span className="text-white font-medium">Click to upload or drag and drop</span>
                <span className="text-gray-400 text-sm mt-1">PDF, DOC, DOCX, TXT files only</span>
              </label>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-400 mr-3" />
                  <div className="text-left">
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-gray-400 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Check for Plagiarism'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-lg font-semibold text-white mb-3">How Our Plagiarism Checker Works</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <ul className="space-y-2">
            <li>• Compares your text against billions of web pages</li>
            <li>• Checks academic databases and publications</li>
            <li>• Identifies similar content and potential sources</li>
          </ul>
          <ul className="space-y-2">
            <li>• Provides detailed similarity reports</li>
            <li>• Offers suggestions for improvement</li>
            <li>• Maintains document confidentiality</li>
          </ul>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Recent Checks</h2>
        
        {results.length > 0 ? (
          results.map((result) => (
            <div key={result.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-blue-400 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{result.fileName}</h3>
                        <p className="text-gray-300 text-sm">Uploaded: {result.uploadDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      {result.status === 'completed' && (
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPlagiarismBadge(result.plagiarismScore)}`}>
                          {result.plagiarismScore}% Similarity
                        </span>
                      )}
                    </div>
                  </div>

                  {result.status === 'completed' && (
                    <>
                      {/* Plagiarism Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 text-sm">Originality Score</span>
                          <span className={`font-semibold ${getPlagiarismColor(result.plagiarismScore)}`}>
                            {result.originalityScore}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              result.plagiarismScore <= 10 ? 'bg-emerald-400' :
                              result.plagiarismScore <= 20 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${result.originalityScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-400">Word Count:</span>
                          <p className="text-white font-medium">{result.wordCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Sources Found:</span>
                          <p className="text-white font-medium">{result.sources.length}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Processing Time:</span>
                          <p className="text-white font-medium">{(result.processingTime / 1000).toFixed(1)}s</p>
                        </div>
                      </div>
                    </>
                  )}

                  {result.status === 'processing' && (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-5 w-5 text-blue-400 mr-2" />
                        <p className="text-blue-400">Analyzing document for plagiarism...</p>
                      </div>
                      <p className="text-gray-400 text-sm">This may take a few minutes</p>
                    </div>
                  )}
                </div>

                {result.status === 'completed' && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewReport(result)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </button>
                    <button 
                      onClick={() => handleDownloadReport(result)}
                      className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No documents checked yet</h3>
            <p className="text-gray-400">Upload your first document to check for plagiarism!</p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Plagiarism Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Document Info */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Document Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">File Name:</span>
                    <p className="text-white font-medium">{selectedResult.fileName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Upload Date:</span>
                    <p className="text-white font-medium">{selectedResult.uploadDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Word Count:</span>
                    <p className="text-white font-medium">{selectedResult.wordCount}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Processing Time:</span>
                    <p className="text-white font-medium">{(selectedResult.processingTime / 1000).toFixed(1)}s</p>
                  </div>
                </div>
              </div>

              {/* Plagiarism Score */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Plagiarism Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-center p-6 bg-white/5 rounded-lg">
                      <div className={`text-4xl font-bold mb-2 ${getPlagiarismColor(selectedResult.plagiarismScore)}`}>
                        {selectedResult.plagiarismScore}%
                      </div>
                      <p className="text-gray-300">Similarity Score</p>
                    </div>
                  </div>
                  <div>
                    <div className="text-center p-6 bg-white/5 rounded-lg">
                      <div className={`text-4xl font-bold mb-2 ${getPlagiarismColor(selectedResult.plagiarismScore)}`}>
                        {selectedResult.originalityScore}%
                      </div>
                      <p className="text-gray-300">Originality Score</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Overall Assessment</span>
                    <span className={`font-semibold ${
                      selectedResult.plagiarismScore <= 10 ? 'text-emerald-400' :
                      selectedResult.plagiarismScore <= 25 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedResult.plagiarismScore <= 10 ? 'Low Risk' :
                       selectedResult.plagiarismScore <= 25 ? 'Medium Risk' : 'High Risk'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        selectedResult.plagiarismScore <= 10 ? 'bg-emerald-400' :
                        selectedResult.plagiarismScore <= 25 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${selectedResult.originalityScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sources */}
              {selectedResult.sources.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Similar Sources Found</h3>
                  <div className="space-y-4">
                    {selectedResult.sources.map((source, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{source.title}</h4>
                            <p className="text-blue-400 text-sm hover:underline cursor-pointer">{source.url}</p>
                          </div>
                          <span className="text-yellow-400 font-semibold">{source.similarity}% match</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{source.description}</p>
                        <p className="text-gray-400 text-xs">Matched words: {source.matchedWords}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
                <ul className="space-y-2">
                  {selectedResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="text-blue-400 mr-3 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleDownloadReport(selectedResult)}
                  className="flex items-center px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlagiarismChecker;
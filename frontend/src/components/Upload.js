// src/components/Upload.js
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

const DropzoneStyles = styled.div`
  border: 2px dashed #cccccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;

  &:hover {
    border-color: #999999;
  }
`;

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ResultContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #cccccc;
  border-radius: 4px;
`;

function Upload() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setJobId(response.data.jobId);

      // Poll for result
      const interval = setInterval(async () => {
        try {
          const resultResponse = await axios.get(`http://localhost:3000/result/${response.data.jobId}`);
          if (resultResponse.data.text) {
            setText(resultResponse.data.text);
            clearInterval(interval);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error fetching result:', error);
          clearInterval(interval);
          setError('Failed to retrieve OCR result. Please try again.');
          setIsLoading(false);
        }
      }, 5000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <DropzoneStyles {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the file here ...</p>
          ) : (
            <p>Drag 'n' drop a file here, or click to select a file</p>
          )}
        </DropzoneStyles>
        {file && <p>Selected file: {file.name}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Button type="submit" disabled={!file || isLoading}>
          {isLoading ? 'Processing...' : 'Upload and Process'}
        </Button>
      </form>
      {jobId && <p>Job ID: {jobId}</p>}
      {text && (
        <ResultContainer>
          <h3>Extracted Text:</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
        </ResultContainer>
      )}
    </div>
  );
}

export default Upload;
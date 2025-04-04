import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const FileUpload = ({
  onUploadSuccess,
  onUploadError,
  type = 'image', // 'image', 'document'
  className = ''
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userToken } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // Preview for images
    if (type === 'image' && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();

    if (type === 'image') {
      formData.append('image', file);
    } else {
      formData.append('document', file);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/${type === 'image' ? 'profile' : 'document'}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();

      if (onUploadSuccess) {
        onUploadSuccess(data.fileUrl || data.imageUrl || data.documentUrl);
      }

      // Reset file input
      setFile(null);
      setPreview(null); // Clear the preview as well

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
      if (onUploadError) {
        onUploadError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* File input */}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6M14 15l2-2 2-2m-2-2l-2 2m2 2l3 3"></path>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {type === 'image' ? 'SVG, PNG, JPG' : 'PDF'} (MAX. 800x400px)
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={type === 'image' ? 'image/*' : 'image/*,.pdf'}
          />
        </label>
      </div>

      {/* Preview */}
      {preview && type === 'image' && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg mx-auto"
          />
        </div>
      )}

      {/* File name */}
      {file && (
        <p className="mt-2 text-sm text-gray-600">
          Selected: {file.name}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`mt-4 py-2 px-4 rounded-md text-white ${!file || loading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-primary-600 hover:bg-primary-700'}`}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default FileUpload;
import React, { useState, useRef } from 'react';
import {
  PhotoIcon,
  XMarkIcon,
  StarIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

/**
 * ImageUpload Component
 * - Multiple image upload with drag & drop
 * - Image preview with thumbnails
 * - Reorder images
 * - Set main image
 * - Delete individual image
 */
const ImageUpload = ({ images = [], onChange, maxImages = 5, maxSizeMB = 5 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFiles = (files) => {
    setError('');
    const validFiles = [];
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes

    for (let file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`File ${file.name} is not an image`);
        continue;
      }

      // Validate file size
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds ${maxSizeMB}MB`);
        continue;
      }

      // Check max images limit
      if (images.length + validFiles.length >= maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        break;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      // Convert files to preview URLs
      const newImages = validFiles.map((file, index) => ({
        id: Date.now() + index,
        file: file,
        preview: URL.createObjectURL(file),
        isMain: images.length === 0 && index === 0, // First image is main by default
        displayOrder: images.length + index + 1,
      }));

      onChange([...images, ...newImages]);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Handle file input change
  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Remove image
  const removeImage = (id) => {
    const filtered = images.filter(img => img.id !== id);
    
    // If removed image was main, set first image as main
    if (filtered.length > 0 && !filtered.some(img => img.isMain)) {
      filtered[0].isMain = true;
    }

    onChange(filtered);
  };

  // Set main image
  const setMainImage = (id) => {
    const updated = images.map(img => ({
      ...img,
      isMain: img.id === id,
    }));
    onChange(updated);
  };

  // Reorder images (drag to reorder thumbnails)
  const moveImage = (fromIndex, toIndex) => {
    const updated = [...images];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    
    // Update display order
    updated.forEach((img, index) => {
      img.displayOrder = index + 1;
    });

    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragActive
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          
          <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Drag & drop images here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Max {maxImages} images • Max {maxSizeMB}MB per image • JPG, PNG, WEBP
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Uploaded Images ({images.length}/{maxImages})
            </p>
            <p className="text-xs text-gray-500">
              <ArrowsUpDownIcon className="w-3 h-3 inline mr-1" />
              Drag to reorder
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/html', index.toString());
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/html'));
                  moveImage(fromIndex, index);
                }}
                className="relative group cursor-move bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-green-500 transition-all"
              >
                {/* Image Preview */}
                <div className="aspect-square">
                  <img
                    src={image.preview || image.image_url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
                  {/* Main Image Badge */}
                  {image.isMain && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <StarSolidIcon className="w-3 h-3" />
                        Main
                      </span>
                    </div>
                  )}

                  {/* Display Order */}
                  <div className="absolute top-2 right-2">
                    <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Action Buttons (visible on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    {/* Set as Main */}
                    {!image.isMain && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMainImage(image.id);
                        }}
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
                        title="Set as main image"
                      >
                        <StarIcon className="w-4 h-4" />
                      </button>
                    )}

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
                      }}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      title="Remove image"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <p className="text-xs text-white truncate">
                    {image.file?.name || 'Existing image'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

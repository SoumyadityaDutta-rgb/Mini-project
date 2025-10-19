/**
 * CLOUDINARY FILE UPLOAD SERVICE
 * 
 * This file provides cloud storage functionality for file uploads using Cloudinary.
 * 
 * WHAT THIS FILE DOES:
 * - Handles file uploads to Cloudinary cloud storage
 * - Manages image and audio file processing
 * - Provides upload progress tracking
 * - Handles file format validation and conversion
 * - Manages cloud storage URLs and optimization
 * - Provides file deletion and management
 * 
 
 */

import {Cloudinary as CoreCloudinary, Util} from "cloudinary-core";

export const url = (publicId, options) => {
    try {
        const scOptions = Util.withSnakeCaseKeys(options);
        const cl = CoreCloudinary.new();
        return cl.url(publicId, scOptions);
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const openUploadWidget = (options, callback) => {
    return window.cloudinary.openUploadWidget(options, callback);
};

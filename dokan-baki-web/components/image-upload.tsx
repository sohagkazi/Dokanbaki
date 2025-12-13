'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, ImageIcon, Check, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageUploadProps {
    defaultValue?: string;
}

export default function ImageUpload({ defaultValue }: ImageUploadProps) {
    // Final output value (Base64)
    const [finalImage, setFinalImage] = useState<string | null>(defaultValue || null);

    // Editor State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Transform State
    const [zoom, setZoom] = useState(1);
    const [baseScale, setBaseScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Load file into editor
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;

            // Preload to get dimensions immediately
            const img = new Image();
            img.onload = () => {
                const { naturalWidth, naturalHeight } = img;
                const containerSize = 256;
                // To fit fully inside a circle, the image diagonal must fit within the circle diameter
                const diagonal = Math.sqrt(naturalWidth ** 2 + naturalHeight ** 2);
                const scale = containerSize / diagonal;

                // Set all state at once
                setImageSrc(result);
                setBaseScale(scale);
                setZoom(1);
                setPosition({ x: 0, y: 0 });
                setIsEditing(true);
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    };

    // Dragging Logic
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setDragStart({ x: clientX - position.x, y: clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragStart) return;
        e.preventDefault();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setPosition({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setDragStart(null);
    };

    // Save Logic (Cropping)
    const handleSave = () => {
        if (!imageRef.current) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Output size (Standardized)
        const size = 3000;
        canvas.width = size;
        canvas.height = size;

        // Draw Logic
        // We need to map the visible area in the container to the canvas
        // The container is 256x256 (w-64).
        // The image is transformed by select styles.

        // Simpler approach: 
        // 1. Draw image to canvas with same transforms as CSS, but scaled to output size.
        // Let's assume container is 256px. Output is 300px. Ratio = 300/256.
        const containerSize = 256;
        const ratio = size / containerSize;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);

        // Center origin
        ctx.translate(size / 2, size / 2);

        // Translate (using standard units, before scale affects them)
        ctx.translate(position.x * ratio, position.y * ratio);

        // Scale (apply both zoom/fit scale AND the output/preview ratio)
        const totalScale = zoom * baseScale * ratio;
        ctx.scale(totalScale, totalScale);

        // Draw centered image
        const img = imageRef.current;
        // Provide offset to center image itself
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        setFinalImage(canvas.toDataURL('image/jpeg', 0.8));
        setIsEditing(false);
        setImageSrc(null);
    };

    // Reset
    const handleClear = () => {
        setFinalImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-4">
            <input type="hidden" name="image" value={finalImage || ''} />

            {/* Hidden Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
            />

            {/* EDITOR MODE */}
            {isEditing && imageSrc ? (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-center mb-4">
                        <p className="font-semibold text-gray-700">Adjust Photo</p>
                        <p className="text-xs text-gray-500">Drag to position, slider to zoom</p>
                    </div>

                    {/* Viewport */}
                    <div
                        ref={containerRef}
                        className="w-64 h-64 mx-auto bg-gray-200 rounded-full overflow-hidden relative cursor-move touch-none shadow-inner border-4 border-white"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                    >
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Edit"
                            className="absolute max-w-none origin-center pointer-events-none select-none transition-transform duration-75"
                            style={{
                                left: '50%',
                                top: '50%',
                                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom * baseScale})`
                            }}
                            draggable={false}
                        />
                    </div>

                    {/* Controls */}
                    <div className="mt-6 space-y-4 max-w-xs mx-auto">
                        <div className="flex items-center gap-3">
                            <ZoomOut className="w-4 h-4 text-gray-400" />
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <ZoomIn className="w-4 h-4 text-gray-400" />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setImageSrc(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* PREVIEW / IDLE MODE */
                <div className="flex items-start gap-5">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md relative group shrink-0">
                        {finalImage ? (
                            <>
                                <img src={finalImage} alt="Profile" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                                >
                                    <X className="w-8 h-8" />
                                </button>
                            </>
                        ) : (
                            <ImageIcon className="w-10 h-10 text-gray-300" />
                        )}
                    </div>

                    <div className="flex-1 pt-2">
                        <label className="text-sm font-semibold text-gray-700 block mb-1">Profile Photo</label>
                        <p className="text-xs text-gray-500 mb-4">Upload a clear photo. It will be cropped to a circle.</p>

                        <label
                            htmlFor="file-upload"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition shadow-sm"
                        >
                            <Upload className="w-4 h-4 text-blue-500" />
                            {finalImage ? 'Change Photo' : 'Upload Photo'}
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';

const Edit = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        originalImageUrl,
        caption: initialCaption,
        positionX: initialPositionX,
        positionY: initialPositionY,
        fontFamily: initialFontFamily,
        fontSize: initialFontSize
    } = location.state || {};

    const [customText, setCustomText] = useState(initialCaption || '');
    const [fontFamily, setFontFamily] = useState(initialFontFamily || 'Arial');
    const [fontSize, setFontSize] = useState(initialFontSize || 24);
    const [position, setPosition] = useState({
        x: initialPositionX ?? 50,
        y: initialPositionY ?? 90
    });

    const imgRef = useRef(null);

    const handleMouseDown = (e) => {
        const startX = e.clientX;
        const startY = e.clientY;

        const handleMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const img = imgRef.current;
            if (!img) return;

            const rect = img.getBoundingClientRect();
            const newX = ((position.x / 100) * rect.width + dx) / rect.width * 100;
            const newY = ((position.y / 100) * rect.height + dy) / rect.height * 100;

            setPosition({
                x: Math.max(0, Math.min(100, newX)),
                y: Math.max(0, Math.min(100, newY))
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const getLines = (ctx, text, maxWidth) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    const handleFinish = () => {
        const img = imgRef.current;
        if (!img) return;

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        const loadedImage = new Image();
        loadedImage.crossOrigin = 'anonymous';

        loadedImage.src = `${API_BASE_URL}/api/proxy?url=${encodeURIComponent(originalImageUrl)}`;

        loadedImage.onload = () => {
            ctx.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);

            if (customText.trim() !== '') {
                ctx.font = `${fontSize}px ${fontFamily}`;
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';

                const maxTextWidth = canvas.width * 0.8; // Allow 80% width for wrapping
                const lines = getLines(ctx, customText, maxTextWidth); // ✅ Wrap text properly

                const lineHeight = fontSize * 1.2;
                const totalTextHeight = lines.length * lineHeight;

                const centerX = (position.x / 100) * canvas.width;
                let startY = (position.y / 100) * canvas.height;

                // If total height would overflow, adjust startY upwards
                if (startY + totalTextHeight > canvas.height) {
                    startY = canvas.height - totalTextHeight - 10;
                }

                lines.forEach((line, index) => {
                    const y = startY + index * lineHeight;
                    ctx.strokeText(line, centerX, y);
                    ctx.fillText(line, centerX, y);
                });
            }

            const finalImage = canvas.toDataURL('image/png');

            navigate('/meme', {
                state: {
                    imageSrc: finalImage,
                    originalImageUrl,
                    caption: customText,
                    positionX: position.x,
                    positionY: position.y,
                    fontFamily,
                    fontSize,
                    edited: true
                }
            });
        };

        loadedImage.onerror = (err) => {
            console.error('Failed to load original image for editing', err);
        };
    };




    if (!originalImageUrl) {
        return <div className="container mt-5 text-center">No meme to edit!</div>;
    }

    return (
        <div className="container mt-5 text-center">
            <h1 className="mb-5">Edit Your Meme ✏️</h1>
    
            {/* Meme Image with Caption */}
            <div className="position-relative d-inline-block mt-4" style={{ maxWidth: '90%' }}>
                <img
                    ref={imgRef}
                    src={originalImageUrl}
                    alt="Original Dog"
                    className="img-fluid rounded shadow"
                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                />
                {customText.trim() !== '' && (
                    <div
                        onMouseDown={handleMouseDown}
                        style={{
                            position: 'absolute',
                            left: `${position.x}%`,
                            top: `${position.y}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: `${fontSize}px`,
                            fontFamily: fontFamily,
                            color: 'white',
                            textShadow: '2px 2px 4px #000',
                            cursor: 'move',
                            userSelect: 'none'
                        }}
                    >
                        {customText}
                    </div>
                )}
            </div>
    
            {/* Controls */}
            <div className="mt-5 d-flex flex-column align-items-center">
                {/* Caption Text Input */}
                <input
                    type="text"
                    className="form-control rounded-pill mb-4"
                    style={{ maxWidth: '400px', fontFamily: 'Oxygen, sans-serif', padding: '10px 20px' }}
                    placeholder="Edit your caption"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                />
    
                {/* Font Family Dropdown */}
                <select
                    className="form-select rounded-pill mb-4"
                    style={{ maxWidth: '250px', fontFamily: 'Oxygen, sans-serif', padding: '10px 20px' }}
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                </select>
    
                {/* Font Size Slider */}
                <div className="mb-4" style={{ maxWidth: '300px' }}>
                    <label htmlFor="fontSizeRange" className="form-label" style={{ fontFamily: 'Oxygen, sans-serif' }}>
                        Font Size: {fontSize}px
                    </label>
                    <input
                        id="fontSizeRange"
                        type="range"
                        className="form-range"
                        min="10"
                        max="100"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                    />
                </div>
    
                {/* Finish Button */}
                <button
                    className="btn btn-custom"
                    style={{ width: '200px' }}
                    onClick={handleFinish}
                >
                    <i className="bi bi-check-circle"></i> Finished
                </button>
            </div>
        </div>
    );
};

export default Edit;

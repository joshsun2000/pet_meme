import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';

const Meme = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        imageSrc,
        imageFile,
        caption: initialCaption,
        edited,
        originalImageUrl: passedOriginalImageUrl,
        positionX: passedPositionX,
        positionY: passedPositionY,
        fontFamily: passedFontFamily,
        fontSize: passedFontSize,
        alreadyGenerated
    } = location.state || {};

    const [memeUrl, setMemeUrl] = useState(null);
    const [caption, setCaption] = useState(initialCaption || '');
    const [loading, setLoading] = useState(true);


    const [originalImageUrl, setOriginalImageUrl] = useState(passedOriginalImageUrl || '');
    const [positionX, setPositionX] = useState(passedPositionX ?? 50); // Default center
    const [positionY, setPositionY] = useState(passedPositionY ?? 90); // Default near bottom
    const [fontFamily, setFontFamily] = useState(passedFontFamily || 'Arial');
    const [fontSize, setFontSize] = useState(passedFontSize || 48);

    const imgRef = useRef(null);

    useEffect(() => {
        const generateMeme = async () => {
    
            if (!imageSrc && !imageFile) {
                alert('No image selected!');
                navigate('/');
                return;
            }
    
            if (edited || alreadyGenerated) {
                setMemeUrl(imageSrc);
                setLoading(false);
                return;
            }
    
            if (initialCaption) {
                // If caption already exists (saved meme), just draw it
                await drawMeme(imageSrc, initialCaption, positionX, positionY, fontFamily, fontSize);
                setCaption(initialCaption);
                setLoading(false);
                return;
            }
    
            try {
                let response;
                if (imageFile) {
                    const formData = new FormData();
                    formData.append('image', imageFile);
    
                    response = await API.post('/memes/generate/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    response = await API.post('/memes/generate/url', { imageUrl: originalImageUrl });
                }
    
                const { memeUrl: url, caption: cap } = response.data;
    

                const usedFontSize = await drawMeme(imageSrc, cap, positionX,   positionY, fontFamily, fontSize);
                setFontSize(usedFontSize);
    
                setCaption(cap); // Save cap into state
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert('Failed to generate meme.');
                navigate('/');
            }
        };
    
        generateMeme();
        // Dependency list should be EMPTY
        // Because we only want to generate once when page loads
    }, []);
    

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

    const drawMeme = (baseImageUrl, captionText, posX, posY, font, size) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
    
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = baseImageUrl;
    
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
    
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
                // Auto-calculate reasonable font size if size is not provided
                let finalFontSize = size;
                if (!finalFontSize) {
                    finalFontSize = Math.floor(Math.min(canvas.width, canvas.height) * 0.05); // 5% of smaller side
                }
    
                ctx.font = `${finalFontSize}px ${font}`;
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
    
                const maxTextWidth = canvas.width * 0.8;
                const lines = getLines(ctx, captionText, maxTextWidth);
    
                const lineHeight = finalFontSize * 1.2;
                const totalTextHeight = lines.length * lineHeight;
    
                const centerX = (posX / 100) * canvas.width;
                let startY = (posY / 100) * canvas.height;
    
                if (startY + totalTextHeight > canvas.height) {
                    startY = canvas.height - totalTextHeight - 10;
                }
    
                lines.forEach((line, index) => {
                    const y = startY + index * lineHeight;
                    ctx.strokeText(line, centerX, y);
                    ctx.fillText(line, centerX, y);
                });
    
                const finalImage = canvas.toDataURL('image/png');
                setMemeUrl(finalImage);
                resolve(finalFontSize);  // ✅ Resolve final calculated font size
            };
    
            img.onerror = (err) => {
                console.error('Error loading image for canvas', err);
                reject(err);
            };
        });
    };
    
    

    const handleEdit = () => {
        navigate('/edit', {
            state: {
                originalImageUrl: originalImageUrl || imageSrc, // Always pass clean version
                caption,
                positionX,
                positionY,
                fontFamily,
                fontSize
            }
        });
    };
    

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = memeUrl;
        link.download = 'petmeme.png';
        link.click();
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to save memes.');
                return;
            }
    
            await API.post('/memes/save', {
                memeUrl,
                caption,
                originalImageUrl: originalImageUrl || memeUrl,
                fontFamily,
                fontSize,
                positionX,
                positionY
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            alert('Meme saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save meme.');
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Check out my dog meme!',
                text: caption,
            }).catch(console.error);
        } else {
            alert('Sharing not supported.');
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: "100vh" }}>
                <h2>Generating your meme... 🛠</h2>
                <div className="spinner-border text-primary mt-3" role="status"></div>
            </div>
        );
    }
    
    return (
        <div className="container mt-5 text-center">
            {/* Heading separated OUTSIDE the image/button row */}
            <h1 className="mb-5">Your Meme!</h1>
    
            <div className="row justify-content-center align-items-center">
                {/* Meme Image */}
                <div className="col-md-7 d-flex justify-content-center">
                    <img
                        ref={imgRef}
                        src={memeUrl}
                        alt="Meme"
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: '500px', objectFit: 'contain' }}
                    />
                </div>
    
                {/* Action Buttons */}
                <div className="col-md-3 d-flex flex-column align-items-center" style={{ marginLeft: '-20px' }}>
                    <button className="btn btn-custom mb-3" style={{ width: '180px' }} onClick={handleSave}>
                        <i className="bi bi-save"></i> Save
                    </button>
                    <button className="btn btn-custom mb-3" style={{ width: '180px' }} onClick={handleEdit}>
                        <i className="bi bi-pencil"></i> Edit
                    </button>

                    <button className="btn btn-custom mb-3" style={{ width: '180px' }} onClick={handleShare}>
                        <i className="bi bi-share"></i> Share
                    </button>
    
    
                    <button className="btn btn-special" style={{ width: '180px' }} onClick={handleDownload}>
                        <i className="bi bi-download"></i> Download
                    </button>
                </div>
            </div>
        </div>
    );
    
    
};

export default Meme;

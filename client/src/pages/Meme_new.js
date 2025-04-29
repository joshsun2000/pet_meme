import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';

const Meme = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Destructure all expected fields from location.state
  const {
    imageSrc,
    imageFile,
    caption: initialCaption,
    edited,
    originalImageUrl: initialOriginalImageUrl,
    fontFamily: initialFontFamily,
    fontSize: initialFontSize,
    positionX: initialPositionX,
    positionY: initialPositionY
  } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [memeUrl, setMemeUrl] = useState('');
  const [caption, setCaption] = useState(initialCaption || '');
  const [originalImageUrl, setOriginalImageUrl] = useState(initialOriginalImageUrl || '');
  const [fontFamily, setFontFamily] = useState(initialFontFamily || 'Arial');
  const [fontSize, setFontSize] = useState(initialFontSize || 24);
  const [positionX, setPositionX] = useState(initialPositionX || 50);
  const [positionY, setPositionY] = useState(initialPositionY || 90);

  // Core function: Draw meme
  const drawMeme = async (imgUrl, text) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Needed for canvas to work with external images
    img.src = imgUrl;

    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (err) => reject(err);
    });

    const canvas = canvasRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.font = `${(fontSize / 100) * canvas.height}px ${fontFamily}`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const textX = (positionX / 100) * canvas.width;
    const textY = (positionY / 100) * canvas.height;

    ctx.strokeText(text, textX, textY);
    ctx.fillText(text, textX, textY);

    const finalImage = canvas.toDataURL('image/png');
    setMemeUrl(finalImage);
  };

  useEffect(() => {
    const generateMeme = async () => {
      if (!imageSrc && !imageFile) {
        alert('No image selected!');
        navigate('/');
        return;
      }

      try {
        if (edited) {
          // Coming from /edit — already edited meme
          setMemeUrl(imageSrc);
          setLoading(false);
          return;
        }

        if (imageSrc && initialCaption) {
          // Viewing a saved meme
          await drawMeme(imageSrc, initialCaption);
          setLoading(false);
          return;
        }

        // Otherwise: Generate new meme from backend
        let response;
        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);

          response = await API.post('/memes/generate/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          response = await API.post('/memes/generate/url', { imageUrl: imageSrc });
        }

        const { memeUrl: url, caption: cap } = response.data;

        setCaption(cap);
        setOriginalImageUrl(imageSrc); // Save original clean image
        await drawMeme(imageSrc, cap);

        setLoading(false);
      } catch (err) {
        console.error('Failed to generate meme:', err.message);
        alert('Failed to generate meme.');
        navigate('/');
      }
    };

    generateMeme();
  }, [imageSrc, imageFile, initialCaption, edited, navigate]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to save memes.');
        return;
      }

      console.log('Saving meme with:', {
        originalImageUrl,
        caption,
        fontFamily,
        fontSize,
        positionX,
        positionY
      });

      await API.post('/memes/save', {
        originalImageUrl,
        caption,
        fontFamily,
        fontSize,
        positionX,
        positionY
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Meme saved successfully!');
    } catch (err) {
      console.error('Save meme error:', err.message);
      alert('Failed to save meme.');
    }
  };

  const handleEdit = () => {
    navigate('/edit', {
      state: {
        originalImageUrl,
        caption,
        fontFamily,
        fontSize,
        positionX,
        positionY
      }
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = memeUrl;
    link.download = 'petmeme.png';
    link.click();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out my PetMeme!',
        text: 'Look at this cute dog meme I made!',
        url: memeUrl
      });
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  if (loading) {
    return <div className="container mt-5 text-center">Generating meme...</div>;
  }

  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">🐶 Your Meme!</h1>

      <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '80vh' }} />

      <div className="mt-4">
        <button className="btn btn-warning mx-2" onClick={handleEdit}>Edit</button>
        <button className="btn btn-success mx-2" onClick={handleSave}>Save</button>
        <button className="btn btn-primary mx-2" onClick={handleShare}>Share</button>
        <button className="btn btn-secondary mx-2" onClick={handleDownload}>Download</button>
      </div>
    </div>
  );
};

export default Meme;

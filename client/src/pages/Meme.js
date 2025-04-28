import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';

const Meme = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageSrc, imageFile, caption: initialCaption, edited } = location.state || {};

  const [memeUrl, setMemeUrl] = useState(null);
  const [caption, setCaption] = useState(initialCaption || '');
  const [loading, setLoading] = useState(true);

  const imgRef = useRef(null);

  

  useEffect(() => {
    const generateMeme = async () => {
      if (!imageSrc && !imageFile) {
        alert('No image selected!');
        navigate('/');
        return;
      }
  
      if (edited) {
        // Coming from /edit — image is already finalized
        setMemeUrl(imageSrc);
        setLoading(false);
        return;
      }
  
      if (imageSrc && initialCaption) {
        // Already have image + caption (e.g., from saved meme)
        await drawMeme(imageSrc, initialCaption);
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
          response = await API.post('/memes/generate/url', { imageUrl: imageSrc });
        }
  
        const { memeUrl: url, caption: cap } = response.data;
        await drawMeme(url, cap);
        setCaption(cap);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert('Failed to generate meme.');
        navigate('/');
      }
    };
  
    generateMeme();
  }, [imageSrc, imageFile, initialCaption, edited, navigate]);
  

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
  

  const drawMeme = (url, captionText) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
  
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
  
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
        const fontSize = Math.floor(canvas.height * 0.05);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
  
        const maxWidth = canvas.width * 0.8; // Allow 80% width for text
        const lines = getLines(ctx, captionText, maxWidth);
  
        // Start drawing a little above the bottom depending on number of lines
        const lineHeight = fontSize * 1.2;
        const startY = canvas.height - lineHeight * lines.length - 20;
        const centerX = canvas.width / 2;
  
        lines.forEach((line, index) => {
          const y = startY + index * lineHeight;
          ctx.strokeText(line, centerX, y);
          ctx.fillText(line, centerX, y);
        });
  
        const finalImage = canvas.toDataURL('image/png');
        setMemeUrl(finalImage);
        resolve();
      };
  
      img.onerror = (err) => {
        console.error('Error loading image for canvas', err);
        reject(err);
      };
    });
  };
  

  const handleEdit = () => {
    navigate('/edit', { state: { memeUrl, caption } });
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
      await API.post('/memes/save', { memeUrl, caption }, {
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
        url: memeUrl,
      }).catch(console.error);
    } else {
      alert('Sharing not supported.');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h2>Generating your meme... 🛠</h2>
        <div className="spinner-border text-primary mt-3" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container mt-5 text-center">
      <h1>Your Meme!</h1>
      <img ref={imgRef} src={memeUrl} alt="Meme" className="img-fluid mt-4" style={{ maxHeight: '500px' }} />

      <div className="btn-group mt-4" role="group">
        <button className="btn btn-success" onClick={handleSave}>Save</button>
        <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
        <button className="btn btn-info" onClick={handleShare}>Share</button>
        <button className="btn btn-primary" onClick={handleDownload}>Download</button>
      </div>
    </div>
  );
};

export default Meme;

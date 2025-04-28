import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Edit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { memeUrl } = location.state || {}; // only need memeUrl now

  const [customText, setCustomText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [position, setPosition] = useState({ x: 50, y: 50 });
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

  const handleFinish = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (customText.trim() !== '') {
      ctx.font = `${(fontSize / 100) * canvas.height}px ${fontFamily}`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const textX = (position.x / 100) * canvas.width;
      const textY = (position.y / 100) * canvas.height;

      ctx.strokeText(customText, textX, textY);
      ctx.fillText(customText, textX, textY);
    }

    const finalImage = canvas.toDataURL('image/png');

    navigate('/meme', { state: { imageSrc: finalImage, edited: true } });

  };

  if (!memeUrl) {
    return <div className="container mt-5 text-center">No meme to edit!</div>;
  }

  return (
    <div className="container mt-5 text-center">
      <h1>Edit Your Meme ✏️</h1>

      <div className="position-relative d-inline-block mt-4" style={{ maxWidth: '90%' }}>
        <img ref={imgRef} src={memeUrl} alt="Meme" className="img-fluid" />
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

      <div className="mt-4">
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Enter your text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
        />

        <select
          className="form-select mb-3"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
        </select>

        <select
          className="form-select mb-3"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
        >
          <option value="16">16px</option>
          <option value="24">24px</option>
          <option value="32">32px</option>
          <option value="40">40px</option>
          <option value="48">48px</option>
          <option value="56">56px</option>
        </select>
      </div>

      <button className="btn btn-success mt-4" onClick={handleFinish}>Finished</button>
    </div>
  );
};

export default Edit;

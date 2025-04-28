import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Home = () => {
  const [imageSrc, setImageSrc] = useState(null);   // stores the image preview
  const [imageFile, setImageFile] = useState(null); // stores the uploaded file
  const navigate = useNavigate();

  const fetchRandomDog = async () => {
    try {
      const response = await fetch('https://api.thedogapi.com/v1/images/search', {
        headers: {
          'x-api-key': process.env.REACT_APP_DOG_API_KEY
        }
      });
      const data = await response.json();
      if (data[0] && data[0].url) {
        const proxyUrl = `http://localhost:5000/api/proxy?url=${encodeURIComponent(data[0].url)}`;
        setImageSrc(proxyUrl);
        setImageFile(null); // clear any uploaded file
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageSrc(URL.createObjectURL(file)); // display the uploaded image
    }
  };

  const handleContinue = () => {
    if (!imageSrc) {
      alert('Please select an image first!');
      return;
    }
    // Pass selected image to /meme page
    navigate('/meme', { state: { imageSrc, imageFile } });
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">🐶 Welcome to PetMeme</h1>

      <div className="text-center">
        <button className="btn btn-primary mb-3" onClick={fetchRandomDog}>
          Get Random Dog Image
        </button>

        <div className="my-3">
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {imageSrc && (
          <div className="my-4">
            <img src={imageSrc} alt="Selected Dog" className="img-fluid" style={{ maxHeight: '400px' }} />
          </div>
        )}

        <button className="btn btn-success mt-3" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default Home;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { API_BASE_URL } from '../api';
import '../App.css';

const Home = () => {
    const [imageSrc, setImageSrc] = useState(null);        // Proxy or uploaded image for preview
    const [originalImageUrl, setOriginalImageUrl] = useState(null); // Clean real Dog API image
    const [imageFile, setImageFile] = useState(null);       // Uploaded file
    const navigate = useNavigate();

    const fetchRandomDog = async () => {
        try {
            const response = await fetch('https://api.thedogapi.com/v1/images/search', {
                headers: {
                    'x-api-key': process.env.REACT_APP_DOG_API_KEY
                }
            });
            const data = await response.json();
            console.log(data);

            if (data[0] && data[0].url) {
                const realDogUrl = data[0].url;
                const proxyUrl = `${API_BASE_URL}/api/proxy?url=${encodeURIComponent(realDogUrl)}`;

                // Load the proxy image, resize if necessary
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = proxyUrl;

                return new Promise((resolve, reject) => {
                    img.onload = () => {
                        const maxSize = 500;
                        let { width, height } = img;

                        if (width > maxSize || height > maxSize) {
                            const scale = Math.min(maxSize / width, maxSize / height);
                            width = width * scale;
                            height = height * scale;
                        }

                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        const resizedDataUrl = canvas.toDataURL('image/png');

                        setImageSrc(resizedDataUrl);
                        setOriginalImageUrl(realDogUrl);
                        setImageFile(null);

                        resolve({ proxyUrl: resizedDataUrl, realDogUrl });
                    };

                    img.onerror = (err) => {
                        console.error('Failed to load random dog image', err);
                        reject(err);
                    };
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            alert('Please select a valid image!');
            return;
        }

        const fileUrl = URL.createObjectURL(file);

        setImageSrc(fileUrl);
        setImageFile(file);
        setOriginalImageUrl(null);
    };

    const handleGetRandomDog = async () => {
        const result = await fetchRandomDog();
        if (!result) {
            alert('Failed to fetch a random dog image!');
        }
    };

    const handleGenerateMeme = () => {
        if (!imageSrc && !imageFile) {
            alert('Please select or fetch an image first!');
            return;
        }

        navigate('/meme', {
            state: {
                imageSrc,
                imageFile,
                originalImageUrl,
                caption: '',
                positionX: 50,
                positionY: 90,
                fontFamily: 'Arial',
                fontSize: 24
            }
        });
    };

    return (
        <div className="d-flex flex-column align-items-center text-center" style={{ minHeight: "100vh", paddingTop: "50px" }}>
            <h1 className="mb-3" style={{ fontFamily: 'Oxygen, sans-serif', color: '#6D8B74' }}>PetMeme Generator</h1>
            <p className="subtitle mb-4" style={{ fontFamily: 'Amatic SC, cursive', fontSize: '1.5rem' }}>
                Create Your Pet Meme! Generate amusing memes with your pet photos.
            </p>

            <div className="d-flex flex-wrap gap-3 justify-content-center mb-4">
                {/* Upload Button */}
                <label className="btn btn-custom d-flex align-items-center gap-2 rounded-pill">
                    <i className="bi bi-upload"></i> Upload Your Pet!
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>

                {/* Get Random Dog Button */}
                <button className="btn btn-custom d-flex align-items-center gap-2 rounded-pill" onClick={handleGetRandomDog}>
                    <i className="bi bi-shuffle"></i> Get Random Dog
                </button>

                {/* Generate Meme Button */}
                <button className="btn btn-special d-flex align-items-center gap-2 rounded-pill" onClick={handleGenerateMeme}>
                    <i className="bi bi-arrow-right-circle"></i> Generate Meme
                </button>
            </div>

            {/* Preview Section */}
            {imageSrc && (
                <div className="mt-4">
                    <img
                        src={imageSrc}
                        alt="Preview"
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                </div>
            )}
        </div>
    );
};

export default Home;

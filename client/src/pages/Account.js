import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Account = () => {
  const [memes, setMemes] = useState([]);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please log in to view your memes.');
          navigate('/');
          return;
        }

        const response = await API.get('/api/memes/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsername(response.data.username);
        setMemes(response.data.memes);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch memes.');
      }
    };

    fetchMemes();
  }, [navigate]);

  const handleView = (meme) => {
    navigate('/meme', {
      state: {
        imageSrc: meme.imageUrl, // burned image
        originalImageUrl: meme.originalImageUrl,
        caption: meme.caption,
        fontFamily: meme.fontFamily,
        fontSize: meme.fontSize,
        positionX: meme.positionX,
        positionY: meme.positionY,
        alreadyGenerated: true
      }
    });
  };

  const handleEdit = (meme) => {
    navigate('/edit', {
      state: {
        imageSrc: meme.imageUrl, // burned image
        originalImageUrl: meme.originalImageUrl,
        caption: meme.caption,
        fontFamily: meme.fontFamily,
        fontSize: meme.fontSize,
        positionX: meme.positionX,
        positionY: meme.positionY,
        alreadyGenerated: true
      }
    });
  };

  const handleDelete = async (memeId) => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/api/memes/${memeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove from frontend
      setMemes(prev => prev.filter(meme => meme._id !== memeId));
      alert('Meme deleted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to delete meme.');
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5" style={{ fontFamily: 'Oxygen, sans-serif', color: '#6D8B74' }}>
        {username ? `Welcome back to your memes, ${username}!` : 'Welcome back!'}
      </h1>

      {memes.length === 0 ? (
        <div className="text-center" style={{ fontFamily: 'Oxygen, sans-serif', fontSize: '1.2rem' }}>
          You have no saved memes yet!
        </div>
      ) : (
        <div className="row justify-content-center">
          {memes.map((meme) => (
            <div key={meme._id} className="col-md-4 mb-4 d-flex">
              <div className="card shadow rounded-4 w-100">
                <img
                  src={meme.imageUrl}
                  className="card-img-top rounded-top-4"
                  alt="Meme"
                  style={{ maxHeight: '250px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column align-items-center">


                  <div className="btn-group w-100" role="group">
                    <button
                      className="btn btn-custom rounded-pill"
                      onClick={() => handleView(meme)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-custom rounded-pill"
                      onClick={() => handleEdit(meme)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-special rounded-pill"
                      onClick={() => handleDelete(meme._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

};

export default Account;

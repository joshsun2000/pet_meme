import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Account = () => {
  const [memes, setMemes] = useState([]);
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

        const response = await API.get('/memes/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setMemes(response.data);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch memes.');
      }
    };

    fetchMemes();
  }, [navigate]);

  const handleView = (meme) => {
    navigate('/meme', { state: { imageSrc: meme.imageUrl, caption: meme.caption } });
  };

  const handleEdit = (meme) => {
    navigate('/edit', { state: { memeUrl: meme.imageUrl, caption: meme.caption } });
  };

  const handleDelete = async (memeId) => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/memes/${memeId}`, {
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
    <div className="container mt-5">
      <h1 className="text-center mb-4">Your Saved Memes 🐶</h1>
      <div className="row">
        {memes.map((meme) => (
          <div key={meme._id} className="col-md-4 mb-4">
            <div className="card" style={{ cursor: 'default' }}>
              <img src={meme.imageUrl} className="card-img-top" alt="Meme" style={{ maxHeight: '250px', objectFit: 'cover' }} />
              <div className="card-body">

                <div className="btn-group" role="group">
                  <button className="btn btn-primary" onClick={() => handleView(meme)}>View</button>
                  <button className="btn btn-warning" onClick={() => handleEdit(meme)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(meme._id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Account;

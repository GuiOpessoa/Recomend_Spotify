import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const CLIENT_ID = 'YOUR_CLIENT_ID'; // Substitua pelo seu Client ID do Spotify
const REDIRECT_URI = 'http://localhost:3000/callback'; // O URI de redirecionamento que você configurou no Spotify
const SCOPES = ['user-read-private', 'user-read-email']; // Escopos que você deseja acessar

function App() {
  const [token, setToken] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const loginToSpotify = () => {
    const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(' '))}`;
    window.location.href = url; // Redireciona o usuário para o Spotify
  };

  useEffect(() => {
    const hash = window.location.hash;
    let token = null;

    if (hash) {
      token = hash.split('&').find(el => el.startsWith('access_token')).split('=')[1];
      window.location.hash = ''; // Limpa a hash da URL
    }

    if (token) {
      
      setToken(token); // Armazena o token no estado
      console.log('Token capturado',token); // Adicione esse log
      fetchUserProfile(token); // Chama a função para buscar o perfil do usuário
    }
  }, []);

  const fetchUserProfile = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserProfile(response.data); // Armazena o perfil do usuário
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleGenreChange = (e) => {
    setSelectedGenres([...selectedGenres, e.target.value]);
  };

  const handleArtistChange = (e) => {
    setSelectedArtists([...selectedArtists, e.target.value]);
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.post('http://localhost:3001/recommendations', {
        genres: selectedGenres,
        artists: selectedArtists,
        token: token,
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
    }
  };

  const logout = () => {
    setToken('');
    setUserProfile(null);
    setSelectedGenres([]);
    setSelectedArtists([]);
    setRecommendations([]);
  };

  return (
    <div className="App">
      {!token ? (
        <button onClick={loginToSpotify}>Login com Spotify</button>
      ) : (
        <div>
          <h1>Bem-vindo, {userProfile ? userProfile.display_name : 'Usuário'}!</h1>
          <button onClick={logout}>Logout</button>

          <div>
            <h2>Escolha seus gêneros favoritos</h2>
            <select onChange={handleGenreChange}>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="hip-hop">Hip-Hop</option>
            </select>
          </div>
          <div>
            <h2>Escolha seus artistas favoritos</h2>
            <input type="text" placeholder="Digite o nome do artista" onChange={handleArtistChange} />
          </div>
          <button onClick={fetchRecommendations}>Buscar Recomendações</button>

          <div className="recommendations">
            <h2>Recomendações:</h2>
            <ul>
              {recommendations.map((track) => (
                <li key={track.id}>
                  <span className="track-name">{track.name}</span> - <span className="artist-name">{track.artists[0].name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import os
import json
from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configurar autenticação do Spotify
sp_oauth = SpotifyOAuth(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    redirect_uri=os.getenv("REDIRECT_URI"),
    scope="user-read-private user-read-email"
)

# Endpoint para iniciar a autenticação com o Spotify
@app.route('/login')
def login():
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

# Callback após o usuário fazer login
@app.route('/callback')
def callback():
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    
    access_token = token_info['access_token']
    return jsonify({"access_token": access_token})

# Endpoint para buscar recomendações
@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    data = request.json
    genres = data.get('genres', [])
    artists = data.get('artists', [])
    token = data.get('token')

    sp = Spotify(auth=token)

    try:
        # Buscar recomendações com base nos gêneros e artistas fornecidos
        recommendations = sp.recommendations(seed_genres=genres, seed_artists=artists, limit=10)
        tracks = recommendations['tracks']

        return jsonify(tracks)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001, debug=True)

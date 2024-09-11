# backend/anime_recommendation_api.py

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI()

# Load the data at startup
anime_data = pd.read_csv('anime.csv')

# Preprocess data
anime_data['genre'] = anime_data['genre'].fillna('')

# Content-based filtering using genre
tfidf = TfidfVectorizer(stop_words='english')
genre_matrix = tfidf.fit_transform(anime_data['genre'])
cosine_sim = cosine_similarity(genre_matrix, genre_matrix)

# FastAPI request body schema
class AnimeInput(BaseModel):
    anime_name: str
    top_n: int = 5

# Anime name-based recommendation function
def anime_name_recommendations(anime_name, top_n=5):
    # Check if the anime exists in the dataset
    if anime_name not in anime_data['name'].values:
        raise HTTPException(status_code=404, detail="Anime not found!")
    
    # Get the index of the input anime
    anime_idx = anime_data[anime_data['name'] == anime_name].index[0]
    
    # Get the cosine similarity scores for this anime
    sim_scores = cosine_sim[anime_idx]
    
    # Get the indices of the most similar anime (excluding itself)
    sim_scores = list(enumerate(sim_scores))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    top_n_similar_anime = [anime_data.iloc[i[0]] for i in sim_scores[1:top_n+1]]
    
    # Return top N similar anime
    return [{'name': anime['name'], 'genre': anime['genre'], 'rating': anime['rating']} for anime in top_n_similar_anime]

# Define API endpoint for recommendations
@app.post("/recommend_by_name/")
async def recommend_anime_by_name(anime_input: AnimeInput):
    try:
        recommendations = anime_name_recommendations(anime_input.anime_name, anime_input.top_n)
        return recommendations
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

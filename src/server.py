from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_google_search_ratings(query):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    }
    url = f"https://www.google.com/search?q={query}%20ביקורות"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    ratings = soup.find_all(class_="oqSTJd")

    extracted_ratings = set()
    for rating in ratings:
        rating_text = rating.get_text()
        if rating_text.endswith("/10"):
            rating_value = float(rating_text[:-3])
        else:
            rating_value = float(rating_text) * 2
        extracted_ratings.add(rating_value)

    extracted_ratings = list(extracted_ratings)
    if extracted_ratings:
        average_rating = sum(extracted_ratings) / len(extracted_ratings)
    else:
        average_rating = 0

    return average_rating


@app.route('/get_ratings', methods=['GET'])
def get_ratings():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'Missing query parameter'}), 400

    try:
        average_rating = get_google_search_ratings(query)
        return jsonify(average_rating)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)

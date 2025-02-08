export class GiphyManager {
    constructor() {
        this.API_KEY = 'SinZxtlSpUm6LdrNEKJg0RqjrXLnKuOp';
        this.BASE_URL = 'https://api.giphy.com/v1/gifs';
    }

    async searchGifs(query, limit = 15) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/search?api_key=${this.API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}`
            );
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching GIFs:', error);
            throw error;
        }
    }

    async getTrendingGifs(limit = 15) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/trending?api_key=${this.API_KEY}&limit=${limit}`
            );
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching trending GIFs:', error);
            throw error;
        }
    }
}

const API_KEY = '945d51e0a958d8252c3e9e27a6535262'; // API key included here for simplicity
const API_URL = 'https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds';

export async function fetchUpcomingFights() {
    try {
        const response = await fetch(`${API_URL}?apiKey=${API_KEY}&regions=eu&markets=h2h&dateFormat=iso`);

        if (!response.ok) {
            throw new Error('Failed to fetch MMA fights');
        }

        const data = await response.json();
        return { data, headers: response.headers };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
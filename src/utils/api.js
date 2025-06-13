
let nextTodoId = 201;

export const fetchData = async (url, options = {}, cacheKey = null) => {
  let data = null;
  let error = null;
  let loading = true;

  // Try to load from cache
  if (cacheKey) {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        data = JSON.parse(cachedData);
        loading = false;
      } catch (e) {
        console.error("Failed to parse cached data:", e);
        localStorage.removeItem(cacheKey); // Clear bad cache
      }
    }
  }

  // If not cached or forced fresh, fetch from API
  if (data === null || !cacheKey || (options.method === 'GET' && options.headers && options.headers['Cache-Control'] === 'no-cache')) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      data = result;
      if (cacheKey && options.method === 'GET') {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      }
    } catch (e) {
      error = e;
    } finally {
      loading = false;
    }
  }

  return { data, error, loading };
};

export const getNextTodoId = () => nextTodoId++;

export const initializeNextTodoId = (value) => { 
  if (typeof value === 'number' && value > nextTodoId) { nextTodoId = value; } 
}; 
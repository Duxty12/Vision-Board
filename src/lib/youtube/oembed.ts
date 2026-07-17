export interface YouTubeOembedResponse {
  title: string;
  thumbnail_url: string;
  author_name?: string;
  html?: string;
}

/**
 * Calls YouTube's oEmbed endpoint to fetch metadata (title, thumbnail) for a given video URL.
 * Used for media preview and populating database records before creation.
 */
export async function fetchYouTubeOembed(url: string): Promise<YouTubeOembedResponse | null> {
  try {
    const targetUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    
    // Add a reasonable timeout (e.g. 5 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`oEmbed request failed with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      title: data.title || 'YouTube Video',
      thumbnail_url: data.thumbnail_url || '',
      author_name: data.author_name,
      html: data.html,
    };
  } catch (error) {
    console.error('[fetchYouTubeOembed] Error:', error);
    return null;
  }
}

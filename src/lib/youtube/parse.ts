/**
 * Extracts the 11-character YouTube video ID from various YouTube URL formats.
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * 
 * Returns null if the URL is invalid or the video ID cannot be parsed.
 */
export function parseYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Trim whitespace
  const cleanUrl = url.trim();

  // RegExp to match standard, shortened, embed, and shorts formats
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/i;
  const match = cleanUrl.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  // Fallback direct check for 11 character strings in case user input is just the ID
  if (cleanUrl.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  return null;
}

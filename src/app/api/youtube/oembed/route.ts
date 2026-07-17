import { NextRequest, NextResponse } from 'next/server';
import { fetchYouTubeOembed } from '@/lib/youtube/oembed';
import { parseYouTubeVideoId } from '@/lib/youtube/parse';

/**
 * Route handler to fetch oEmbed metadata for a pasted YouTube URL.
 * Proxies request to avoid CORS issues on client-side fetching.
 * GET /api/youtube/oembed?url=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'Missing required query parameter "url".' },
        { status: 400 }
      );
    }

    const videoId = parseYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not parse a valid YouTube video ID from the provided URL.' },
        { status: 400 }
      );
    }

    // Call the oEmbed utility helper
    const metadata = await fetchYouTubeOembed(url);
    if (!metadata) {
      return NextResponse.json(
        { error: 'Failed to retrieve metadata from YouTube. Please verify the link is public.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videoId,
      title: metadata.title,
      thumbnail_url: metadata.thumbnail_url,
    });
  } catch (error: any) {
    console.error('[YouTube oEmbed Route] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while resolving YouTube metadata.' },
      { status: 500 }
    );
  }
}

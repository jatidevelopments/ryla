/**
 * Cloudflare Worker for R2 CDN Proxy
 * 
 * Proxies requests to R2 bucket with proper headers and caching.
 * Supports custom domain (cdn.ryla.ai) for better branding.
 */

interface Env {
  R2_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const objectKey = url.pathname.slice(1); // Remove leading slash
    
    // Handle root path
    if (!objectKey || objectKey === '') {
      return new Response('R2 CDN Proxy - Provide an object key in the path', {
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    
    try {
      // Get object from R2 bucket
      const object = await env.R2_BUCKET.get(objectKey);
      
      if (!object) {
        return new Response('Object not found', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }
      
      // Determine content type from extension or metadata
      const contentType = object.httpMetadata?.contentType || 
        getContentTypeFromKey(objectKey) || 
        'application/octet-stream';
      
      // Get object body
      const objectBody = object.body;
      
      // Build response headers
      const headers = new Headers({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      
      // Add ETag if available
      if (object.httpEtag) {
        headers.set('ETag', object.httpEtag);
      }
      
      // Add Last-Modified if available
      if (object.uploaded) {
        headers.set('Last-Modified', object.uploaded.toUTCString());
      }
      
      // Handle conditional requests
      const ifNoneMatch = request.headers.get('If-None-Match');
      if (ifNoneMatch && object.httpEtag && ifNoneMatch === object.httpEtag) {
        return new Response(null, {
          status: 304,
          headers,
        });
      }
      
      // Handle OPTIONS request (CORS preflight)
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers,
        });
      }
      
      // Return object with headers
      return new Response(objectBody, {
        status: 200,
        headers,
      });
      
    } catch (error) {
      console.error('Error fetching object from R2:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};

/**
 * Get content type from file extension
 */
function getContentTypeFromKey(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase() || '';
  
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'avif': 'image/avif',
    'ico': 'image/x-icon',
    
    // Videos
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    
    // Documents
    'pdf': 'application/pdf',
    'json': 'application/json',
    'xml': 'application/xml',
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'ts': 'application/typescript',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

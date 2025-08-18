/**
 * HTTP Response Utilities
 */

export function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-GitHub-Event, X-GitHub-Delivery, X-Hub-Signature-256',
      ...headers,
    },
  });
}

export function errorResponse(
  message: string, 
  status = 500, 
  headers: Record<string, string> = {},
  details?: any
): Response {
  const errorData = {
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    },
  };

  return jsonResponse(errorData, status, headers);
}

export function cors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-GitHub-Event, X-GitHub-Delivery, X-Hub-Signature-256',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
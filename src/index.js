export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Redirect /releases (no trailing slash) to /releases/ for clean relative paths
    if (!pathname.endsWith('/') && !pathname.includes('.')) {
      return Response.redirect(new URL(pathname + '/', request.url), 301);
    }

    // Try serving from assets
    const response = await env.ASSETS.fetch(request);

    // If asset not found and path ends with /, try index.html
    if (response.status === 404 && pathname.endsWith('/')) {
      const indexPath = pathname + 'index.html';
      const indexResp = await env.ASSETS.fetch(new Request(new URL(indexPath, request.url), request));
      return indexResp;
    }

    return response;
  }
};

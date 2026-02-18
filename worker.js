export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }

    const url = new URL(request.url);
    if (!url.pathname.includes(".")) {
      const indexUrl = new URL("/index.html", url);
      return env.ASSETS.fetch(new Request(indexUrl, request));
    }

    return response;
  }
};

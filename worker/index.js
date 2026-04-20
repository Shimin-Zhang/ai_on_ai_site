const ORIGIN = 'https://aionai-arena.pages.dev';
const PREFIX = '/ai-on-ai-arena';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const stripped = url.pathname.slice(PREFIX.length) || '/';
    const target = new URL(stripped + url.search, ORIGIN);

    const originReq = new Request(target, request);
    originReq.headers.set('host', new URL(ORIGIN).host);

    const res = await fetch(originReq);
    return new Response(res.body, res);
  },
};

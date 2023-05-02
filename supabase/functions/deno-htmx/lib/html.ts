const HEADERS = {
  headers: { "Content-Type": "text/html;charset=utf-8" },
};

export const html = String.raw;

export const htmlResponse = (body: string): Response =>
  new Response(body, HEADERS);

const HEADERS = {
  headers: { "Content-Type": "text/html;charset=utf-8" },
};

export const html = String.raw;

export const htmlResponse = (body: string): Response =>
  new Response(body, HEADERS);

export class RedirectError extends Error {
  url: string;
  status: number;
  constructor({ url, status }: { url: string; status: number }) {
    super(`Redirect to ${url} with status ${status}`);
    this.url = url;
    this.status = status;
  }
}
import { serve } from "http/server.ts";
import { html, htmlResponse } from "lib/html.ts";
import { getEndpoint } from "lib/utils.ts";

const port = 8080;

const sendFile = async (filepath: string) => {
  try {
    const file = await Deno.open("." + filepath, { read: true });
    const readableStream = file.readable;
    return new Response(readableStream);
  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
};

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const filepath = decodeURIComponent(url.pathname);
  const contentType = request.headers.get("sec-fetch-dest");

  if (
    request.method === "GET" &&
    contentType !== "document" &&
    contentType !== "empty"
  ) {
    return sendFile(filepath);
  }

  try {
    return await getEndpoint(filepath, request);
  } catch (error) {
    console.log({ error });
    return htmlResponse(html` <h1>404 - Not Found</h1>`);
  }
};

console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`);
await serve(handler, { port });

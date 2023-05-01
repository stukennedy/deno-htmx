import { serve } from "http/server.ts";
import { html, htmlResponse } from "/html.ts";
import { getEndpoint } from "/utils.ts";
const port = 8080;

const sendFile = async (filepath: string) => {
  let file;
  try {
    file = await Deno.open("." + filepath, { read: true });
  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
  const readableStream = file.readable;
  return new Response(readableStream);
};

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const filepath = decodeURIComponent(url.pathname);
  const contentType = request.headers.get("sec-fetch-dest");

  console.log("request.url", request.url, request.method, contentType);
  if (request.method === "GET" && contentType !== "document") {
    return sendFile(filepath);
  }

  const path = "./routes" + filepath;
  const fileName = path.endsWith("/") ? `${path}index.ts` : `${path}.ts`;
  try {
    return await getEndpoint(fileName, request);
  } catch (error) {
    console.log({ error });
  }
  return htmlResponse(html` <h1>404 - Not Found</h1>`);
};

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`);
await serve(handler, { port });

import {
  EndpointFunction,
  html,
  htmlResponse,
  Endpoint,
  LayoutFunction,
} from "./html.ts";

class RedirectError extends Error {
  url: string;
  status: number;
  constructor({ url, status }: { url: string; status: number }) {
    super(`Redirect to ${url} with status ${status}`);
    this.url = url;
    this.status = status;
  }
}

const redirectFunction = (url: string, status: number) => {
  throw new RedirectError({ url, status });
};

export const processLayouts = async (
  body: string,
  fileName: string,
  request: Request
) => {
  let newBody = body;
  let rootPath = fileName;
  while (true) {
    const filePath = rootPath.replace(/\/[^/]+$/, "/_layout.ts");
    // console.log({ rootPath, filePath });
    try {
      const module = await import(filePath);
      newBody = await (<LayoutFunction>module.default)({
        children: newBody,
        request,
        params: {},
        redirect: redirectFunction,
      });
    } catch (e) {
      if (e instanceof RedirectError) {
        redirectFunction(e.url, e.status);
      }
    }
    if (filePath === "./routes/_layout.ts") {
      break;
    }
    rootPath = rootPath.replace(/\/[^/]+$/, "");
  }
  return newBody;
};

const getMethod = (
  method: string,
  module: Endpoint
): EndpointFunction | undefined => {
  switch (method) {
    case "POST":
      return module.onRequestPost;
    case "PUT":
      return module.onRequestPut;
    case "PATCH":
      return module.onRequestPut;
    case "DELETE":
      return module.onRequestDelete;
    default:
      return module.onRequestGet;
  }
};

export const getEndpoint = async (
  fileName: string,
  request: Request
): Promise<Response> => {
  let module;
  try {
    module = await import(fileName);
  } catch {
    fileName = fileName.replace(".ts", "/index.ts");
    module = await import(fileName);
  }
  console.log({ fileName });
  const moduleMethod = getMethod(request.method, module);
  if (!moduleMethod) {
    return htmlResponse(html` <h1>404 - Not Found</h1>`);
  }
  const newRequest = await moduleMethod({
    request,
    params: {},
    redirect: redirectFunction,
  });
  if (request.method === "GET") {
    const text = await newRequest.text();
    try {
      const body = await processLayouts(text, fileName, request);
      return htmlResponse(body);
    } catch (e) {
      if (e instanceof RedirectError) {
        return Response.redirect(e.url, e.status);
      }
    }
  }
  return newRequest;
};

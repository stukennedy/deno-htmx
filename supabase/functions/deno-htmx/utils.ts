import { html, htmlResponse } from "lib/html.ts";
import {
  EndpointFunction,
  Endpoint,
  LayoutFunction,
  Route,
} from "lib/interfaces.ts";
import routes from "lib/routes.json" assert { type: "json" };

class RedirectError extends Error {
  url: string;
  status: number;
  constructor({ url, status }: { url: string; status: number }) {
    super(`Redirect to ${url} with status ${status}`);
    this.url = url;
    this.status = status;
  }
}

const testPath = (route: string, actualPath: string) => {
  const variablePattern = /\/\[([^\]]+)\]/g;
  const pathWithRegex = route.replace(variablePattern, "/([^/]+)");
  const regex = new RegExp("^" + pathWithRegex + "$");
  return actualPath.replace(/\/$/, "").match(regex);
};

const getParams = (route: string, actualPath: string) => {
  const params: { [key: string]: string } = {};
  const variablePattern = /\/\[([^\]]+)\]/g;
  const variableNames = route.match(variablePattern)?.map((v) => v.slice(2, -1));
  const match = testPath(route, actualPath);
  if (match && variableNames) {
    variableNames.forEach((name, i) => {
      params[name] = match[i + 1];
    });
  }
  return { params };
}

const redirectFunction = (url: string, status: number) => {
  throw new RedirectError({ url, status });
};

export const processLayouts = async (
  body: string,
  route: Route,
  request: Request
) => {
  let newBody = body;
  let rootPath = route.filePath;
  const layouts = routes.filter(route => route.route.endsWith('_layout'))
  const path = route.route.replace(/\/[^/]+$/, "/_layout");
  console.log({path, layouts})
  while (true) {
    const filePath = rootPath.replace(/\/[^/]+$/, "/_layout.ts");
    console.log({ rootPath, filePath });
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
  path: string,
  request: Request
): Promise<Response> => {
  const route = routes.find((route: Route) => testPath(route.route, path));
  // console.log({ route, path });
  let newRequest;
  try {
    const fileName = route?.filePath!;
    const module = await import(fileName);
    const moduleMethod = getMethod(request.method, module);
    const params = getParams(route!.route, path).params;
    newRequest = await moduleMethod!({
      request,
      params,
      redirect: redirectFunction,
    });
    if (request.method === "GET") {
      const text = await newRequest.text();
      const startTime = Date.now();
      const body = await processLayouts(text, route!, request);
      const timeElapsed = Date.now() - startTime;
      console.log("getModules", { timeElapsed });
      return htmlResponse(body);
    }
  } catch (e) {
    if (e instanceof RedirectError) {
      return Response.redirect(e.url, e.status);
    }
    console.error(e);
    return htmlResponse(html` <h1>404 - Not Found</h1>`);
  }
  return newRequest;
};

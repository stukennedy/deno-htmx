import { html, htmlResponse, RedirectError } from "lib/html.ts";
import { Endpoint, LayoutFunction, Route } from "lib/interfaces.ts";
import routes from "lib/routes.json" assert { type: "json" };
import { join } from "path";

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

const processLayouts = async (
  body: string,
  route: Route,
  request: Request
) => {
  let newBody = body;
  let rootPath = route.filePath;
  while (true) {
    const filePath = rootPath.replace(/\/[^/]+$/, "/_layout.ts");
    try {
      const module = await import(join(Deno.cwd(), filePath));
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
    if (filePath === "/routes/_layout.ts") {
      break;
    }
    rootPath = rootPath.replace(/\/[^/]+$/, "");
  }
  return newBody;
};

export const getEndpoint = async (
  path: string,
  request: Request
): Promise<Response> => {
  try {
    const route = routes.find((route: Route) => testPath(route.route, path));
    const fileName = route?.filePath!;
    const module = await import(join(Deno.cwd(), fileName));
    const endpoint: Endpoint = {
      GET: module.onRequestGet || null,
      POST: module.onRequestPost || null,
      PUT: module.onRequestPut || null,
      DELETE: module.onRequestDelete || null,
      PATCH: module.onRequestPatch || null,
    };    
    const params = getParams(route!.route, path).params;
    const newRequest = await endpoint[request.method]!({
      params,
      request,
      redirect: redirectFunction,
    });    
    if (request.method === "GET") {
      const text = await newRequest.text();
      const body = await processLayouts(text, route!, request);
      return htmlResponse(body);
    }
    return newRequest;
  } catch (e) {
    if (e instanceof RedirectError) {
      return Response.redirect(e.url, e.status);
    }
    console.error(e);
    return htmlResponse(html` <h1>404 - Not Found</h1>`);
  }
};

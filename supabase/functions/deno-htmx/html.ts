const HEADERS = {
  headers: { "Content-Type": "text/html;charset=utf-8" },
};

export const html = String.raw;

export const htmlResponse = (body: string): Response =>
  new Response(body, HEADERS);

export interface LayoutFunction {
  (props: {
    children: string;
    request: Request;
    params: Record<string, string>;
    redirect: (url: string, status: number) => void;
  }): Promise<string> | string;
}

export interface EndpointFunction {
  (props: {
    request: Request;
    params: Record<string, string>;
    redirect: (url: string, status: number) => void;
  }): Response | Promise<Response>;
}

export interface Endpoint {
  onRequestGet?: EndpointFunction;
  onRequestPost?: EndpointFunction;
  onRequestPut?: EndpointFunction;
  onRequestDelete?: EndpointFunction;
  onRequestPatch?: EndpointFunction;
}

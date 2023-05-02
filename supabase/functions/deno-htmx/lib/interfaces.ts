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

export type Endpoint  = Record<string, EndpointFunction | null>
export type Route = {
  route: string;
  filePath: string;
};

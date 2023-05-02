import Toast from "components/Toast.ts";
import { htmlResponse } from "lib/html.ts";
import { EndpointFunction } from "lib/interfaces.ts";

export const onRequestPost: EndpointFunction = () => {
  const response = htmlResponse(Toast("Successfully logged out"));
  const accessCookie = `access-token=''; path=/; max-age=-1; SameSite=Lax;`;
  const refreshCookie = `refresh-token=''; path=/; max-age=-1; SameSite=Lax;`;

  response.headers.append("Set-Cookie", accessCookie);
  response.headers.append("Set-Cookie", refreshCookie);
  response.headers.append("HX-Redirect", "/");
  return response;
};

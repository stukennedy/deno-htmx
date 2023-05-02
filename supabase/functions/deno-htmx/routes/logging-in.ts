import Spinner from "components/Spinner.ts";
import { html, htmlResponse } from "lib/html.ts";
import { EndpointFunction } from "lib/interfaces.ts";

export const onRequestGet: EndpointFunction = () =>
  htmlResponse(html`
    <div class="h-screen">${Spinner("Logging in ...")}</div>
  `);

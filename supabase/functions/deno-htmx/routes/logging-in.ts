import Spinner from "/components/Spinner.ts";
import { html, htmlResponse, EndpointFunction } from "/html.ts";

export const onRequestGet: EndpointFunction = () =>
  htmlResponse(html`
    <div class="h-screen">${Spinner("Logging in ...")}</div>
  `);

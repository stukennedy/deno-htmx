import { getSupabase } from "model/supabase.ts";
import { html } from "lib/html.ts";
import { LayoutFunction } from "lib/interfaces.ts";

import NavBar from "components/NavBar.ts";

const _layout: LayoutFunction = async ({ children, request, redirect }) => {
  const url = new URL(request.url);
  const supabase = await getSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("authentication: redirect to login");
    redirect(url.origin, 303);
    return "";
  }
  return html` ${NavBar()} ${children} `;
};
export default _layout;

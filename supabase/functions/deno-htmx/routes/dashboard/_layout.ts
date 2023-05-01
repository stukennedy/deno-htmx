import { getSupabase } from "/model/supabase.ts";
import { LayoutFunction, html } from "/html.ts";

import NavBar from "/components/NavBar.ts";

const _layout: LayoutFunction = async ({ children, request, redirect }) => {
  console.log("authentication: _layout");
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

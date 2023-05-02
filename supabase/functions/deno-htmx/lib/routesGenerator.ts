import { Route } from "lib/interfaces.ts";
import * as path from "path";

const routes: Route[] = [];

async function loadRoutes(dir: string): Promise<void> {
  const files = Deno.readDirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory) {
      await loadRoutes(filePath);
    } else if (file.name.toLowerCase().endsWith(".ts")) {
      const route = filePath
        .replace(path.join(Deno.cwd(), "routes"), "")
        .replace(/\\/g, "/")
        .replace(/\.ts$/i, "")
        .replace(/index$/, "")
        .replace(/\/$/, "");

      const flpath = filePath.replace(path.join(Deno.cwd()), "");
      routes.push({ route, filePath: flpath });
    }
  }
}

(async () => {
  await loadRoutes(path.join(Deno.cwd(), "routes"));
  const sorted = routes
    .sort((a, b) => b.filePath.split("/").length - a.route.split("/").length)
    .reverse();
  const strRoutes = JSON.stringify(sorted);
  const encoder = new TextEncoder();
  const data = encoder.encode(strRoutes);
  Deno.writeFileSync(path.join(Deno.cwd(), "lib/routes.json"), data);
})();

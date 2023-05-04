import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { getEndpoint } from "./utils.ts";

Deno.test("getEndpoint returns a response for a valid route", async () => {
  const request = new Request("http://localhost:8080/");
  const response = await getEndpoint("/", request);
  const body = await response.text();
  const expectedBody = "<h1>Hello, world!</h1>";
  assertEquals(response.status, 200);
  assertEquals(body, expectedBody);
});

Deno.test("getEndpoint returns a 404 response for an invalid route", async () => {
  const request = new Request("http://localhost:8080/invalid");
  const response = await getEndpoint("/invalid", request);
  const body = await response.text();
  const expectedBody = "<h1>404 - Not Found</h1>";
  assertEquals(response.status, 404);
  assertEquals(body, expectedBody);
});
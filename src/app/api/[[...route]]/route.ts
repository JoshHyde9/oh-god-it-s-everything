import { db } from "@/lib/db";
import { Elysia, t } from "elysia";

const app = new Elysia({ prefix: "/api" })
  .get("/hello", () => "Hello from Elysia")
  .group("/user", (app) =>
    app.post(
      "/create",
      async ({ body }) => {
        const user = await db.user.create({
          data: { name: body.name, email: body.email },
        });

        return { user: user.name };
      },
      {
        body: t.Object({
          name: t.String({ minLength: 1, error: "Name must not be empty." }),
          email: t.String({
            format: "email",
            error: "Please enter a valid email."
          }),
        }),
      }
    ).get("/allUsers", async () => {
      return await db.user.findMany();
    })
  );

export type App = typeof app;

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;

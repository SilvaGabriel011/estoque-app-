import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "./domain/errors";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Wraps a route handler, translating known errors into JSON responses:
 * - Zod validation errors -> 422
 * - DomainError (business rules / not found) -> its own status
 * - anything else -> 500
 */
export function route<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", issues: err.issues },
          { status: 422 }
        );
      }
      if (err instanceof DomainError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("Unhandled API error:", err);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

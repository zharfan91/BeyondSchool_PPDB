import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { ROLES } from "./constants";

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export const ADMIN_ROLES: string[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

/**
 * Session + role gate for API routes. Returns either `{ session }` (authorized)
 * or `{ error }` (a ready-to-return 401/403 NextResponse). Usage:
 *   const guard = await requireRole(request, ADMIN_ROLES);
 *   if ("error" in guard) return guard.error;
 *   const { session } = guard;
 */
export async function requireRole(
  request: NextRequest,
  roles: string[]
): Promise<{ session: Session } | { error: NextResponse }> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const role = (session.user as { role?: string }).role;
  if (!role || !roles.includes(role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

import type { NextRequest } from "next/server";
import { verifyOwnerAdminSession } from "./owner-admin-auth";

export type AccessAdminActor = {
  actorId: string;
  actorType: "owner_admin";
  email: string | null;
  role: string | null;
};

export async function authenticateAccessAdmin(req: NextRequest): Promise<AccessAdminActor | null> {
  const parsed = verifyOwnerAdminSession(req.cookies.get("qq_owner_admin")?.value);
  if (!parsed) return null;

  return {
    actorId: parsed.actor,
    actorType: "owner_admin",
    email: null,
    role: "owner_admin",
  };
}

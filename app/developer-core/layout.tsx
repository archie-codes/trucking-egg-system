// // app/developer-core/layout.tsx
// import { redirect } from "next/navigation";
// import { cookies } from "next/headers";
// import { decodeJwt } from "jose";
// import { db } from "@/db";
// import { users } from "@/db/schema";
// import { eq } from "drizzle-orm";

// // 🚨 EXACT DEVELOPER EMAIL
// const DEVELOPER_EMAIL = "bauzonarchie@gmail.com";

// export default async function DeveloperCoreLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("auth_token")?.value;

//   let isAuthorized = false;

//   if (token) {
//     try {
//       const payload = decodeJwt(token);
//       const userId = payload.id as number;
//       const [user] = await db.select().from(users).where(eq(users.id, userId));

//       if (user && user.email === DEVELOPER_EMAIL) {
//         isAuthorized = true;
//       }
//     } catch {
//       // Ignore errors (e.g. invalid token) and leave isAuthorized as false
//     }
//   }

//   // The Bouncer: If no session, or email doesn't match, kick them out
//   if (!isAuthorized) {
//     redirect("/");
//   }

//   // If they are the developer, let them see the page
//   return <>{children}</>;
// }

// app/developer-core/layout.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEVELOPER_EMAIL = "bauzonarchie@gmail.com";
const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "your-fallback-secret",
);

export default async function DeveloperCoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let isAuthorized = false;

  console.log("=== DEV CORE AUTH CHECK ===");
  console.log("1. Token exists?", !!token);

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      console.log("2. JWT Payload decoded:", payload);

      // CAUTION: Ensure your JWT payload actually uses 'id'.
      // If it uses 'userId' or 'sub', this next line will fail!
      const userId = payload.id as number;

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      console.log("3. User found in DB?", !!user);
      if (user) {
        console.log("   User email:", user.email);
      }

      if (user && user.email === DEVELOPER_EMAIL) {
        console.log("4. AUTHORIZED! Email matches.");
        isAuthorized = true;
      } else {
        console.log("4. DENIED! Email mismatch or user missing.");
      }
    } catch (error) {
      console.error("!!! JWT VERIFY FAILED:", error);
    }
  }

  console.log("===========================");

  if (!isAuthorized) {
    redirect("/");
  }

  return <>{children}</>;
}

import { NextResponse, type NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { logVisit } from "@/lib/visitLog";

export async function middleware(request: NextRequest) {
  const { env, cf, ctx } = await getCloudflareContext({ async: true });

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  ctx.waitUntil(
    logVisit({
      db: env.VISITS_DB,
      kv: env.RATE_LIMIT_KV,
      ip,
      salt: env.VISITOR_HASH_SALT,
      path: request.nextUrl.pathname,
      geo: {
        country: cf?.country as string | undefined,
        city: cf?.city as string | undefined,
        region: cf?.region as string | undefined,
      },
      referrer: request.headers.get("referer") ?? undefined,
    })
  );

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Redirection optimiste : sans cookie de session, toute page (sauf /login) renvoie vers /login?next=…
 * Aucune lecture en base ici : la vérification réelle reste requireUser() (src/lib/session.ts).
 * Ne jamais renvoyer /login vers / : un cookie expiré créerait une boucle de redirections.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/login" || getSessionCookie(request)) {
    return NextResponse.next();
  }
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Exclut les routes API (dont /api/auth), les assets Next et tout fichier avec extension.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};

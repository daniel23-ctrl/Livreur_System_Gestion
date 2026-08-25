// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // 1. Récupérer le token d'authentification ou le rôle stocké (ex: dans les cookies)
//   // Note: Idéalement, stockez le token ou le rôle dans un cookie HTTP-only sécurisé lors du login.
//   const token = request.cookies.get("token")?.value;
//   const userRole = request.cookies.get("role")?.value; // "ADMINISTRATEUR", "LIVREUR", "CLIENT"

//   // 2. Définir les routes protégées
//   const isAdminRoute = pathname.startsWith("/admin");
//   const isLivreurRoute = pathname.startsWith("/livreur");
//   const isClientRoute = pathname.startsWith("/client");

//   // Si l'utilisateur essaie d'accéder à une route protégée sans être authentifié
//   if ((isAdminRoute || isLivreurRoute || isClientRoute) && !token) {
//     const loginUrl = new URL("/auth/login", request.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   // 3. Contrôle strict des rôles (Empêcher un Client d'aller sur /admin ou /livreur via l'URL)
//   if (isAdminRoute && userRole !== "ADMINISTRATEUR") {
//     return NextResponse.redirect(new URL("/auth/login", request.url));
//   }

//   if (isLivreurRoute && userRole !== "LIVREUR") {
//     return NextResponse.redirect(new URL("/auth/login", request.url));
//   }

//   if (isClientRoute && userRole !== "CLIENT") {
//     return NextResponse.redirect(new URL("/auth/login", request.url));
//   }

//   return NextResponse.next();
// }

// // Configurer les chemins sur lesquels le middleware doit s'appliquer
// export const config = {
//   matcher: ["/admin/:path*", "/livreur/:path*", "/client/:path*"],
// };
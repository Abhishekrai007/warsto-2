// import { NextResponse } from "next/server";

// export function middleware(request) {
//     const token = request.cookies.get("token");

//     if (!token && request.nextUrl.pathname.startsWith("/checkout")) {
//         return NextResponse.redirect(new URL("/signin", request.url));
//     }

//     return NextResponse.next();
// }
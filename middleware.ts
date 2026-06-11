import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
"/dashboard(.*)",
]);

const isPublicRoute = createRouteMatcher([
"/sign-in(.*)",
"/sign-up(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
if (isProtectedRoute(req)) {
await auth.protect();
}
});

export const config = {
matcher: [
"/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ttf|woff2?|ico)).*)",
"/(api|trpc)(.*)",
],
};

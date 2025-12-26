import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    try {
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        })

        // Create a supabase client with cookies logic to handle session refresh
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                    },
                },
            }
        )

        // Validate session (refreshes if needed)
        const { data: { user }, error } = await supabase.auth.getUser()

        // Protected Routes Logic
        const protectedPaths = ['/diagnostic', '/progress', '/results', '/admin', '/plan'];
        const { pathname } = request.nextUrl;

        if (protectedPaths.some(path => pathname.startsWith(path))) {
            if (!user || error) {
                const redirectUrl = new URL('/login', request.url);
                // Optional: Add ?next= current path
                return NextResponse.redirect(redirectUrl);
            }

            // RBAC: Admin check
            if (pathname.startsWith('/admin')) {
                const userRole = user.user_metadata?.role;
                if (userRole !== 'admin') {
                    console.warn(`[Security] Unauthorized access attempt to /admin by ${user.email} (Role: ${userRole})`);
                    // Redirect to user dashboard or 403 page
                    return NextResponse.redirect(new URL('/plan', request.url));
                }
            }
        }

        return response
    } catch (e) {
        // Recover from Edge Function crash -> Redirect to Login or Error
        console.error('[Middleware Error]:', e);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

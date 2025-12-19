export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export type ApiError = {
    error_code: string;
    message: string;
    details?: any;
};

export function successResponse(data: any, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
    );
}

export function errorResponse(error: ApiError, status = 400) {
    return new Response(
        JSON.stringify(error),
        {
            status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
    );
}

export function handleOptions(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }
    return null;
}

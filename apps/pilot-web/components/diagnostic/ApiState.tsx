import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ApiStateProps {
    loading: boolean;
    error: string | null;
    onRetry?: () => void;
    loadingMessage?: string;
    errorMessage?: string;
    children: React.ReactNode;
}

export function ApiState({
    loading,
    error,
    onRetry,
    loadingMessage = "Caricamento in corso...",
    errorMessage = "Si è verificato un errore.",
    children
}: ApiStateProps) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">{loadingMessage}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 p-4 text-center">
                <div className="rounded-full bg-destructive/10 p-3">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg">{errorMessage}</h3>
                <p className="text-muted-foreground max-w-sm">{error}</p>

                {onRetry && (
                    <Button onClick={onRetry} variant="outline" className="mt-4">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Riprova
                    </Button>
                )}
            </div>
        );
    }

    return <>{children}</>;
}

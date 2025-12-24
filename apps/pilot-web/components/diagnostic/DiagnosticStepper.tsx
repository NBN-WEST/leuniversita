import React from 'react';
import { Progress } from "@/components/ui/progress";

interface DiagnosticStepperProps {
    currentIndex: number;
    totalQuestions: number;
}

export function DiagnosticStepper({ currentIndex, totalQuestions }: DiagnosticStepperProps) {
    const progress = ((currentIndex + 1) / totalQuestions) * 100;

    return (
        <div className="w-full space-y-2 mb-8">
            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Domanda {currentIndex + 1} di {totalQuestions}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>
    );
}

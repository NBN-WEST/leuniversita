import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Option {
    id: string;
    label: string;
}

interface Question {
    id: string;
    prompt: string;
    question_options: Option[];
}

interface QuestionCardProps {
    question: Question;
    selectedOptionId: string | undefined;
    onSelectOption: (optionId: string) => void;
}

export function QuestionCard({ question, selectedOptionId, onSelectOption }: QuestionCardProps) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-medium leading-relaxed">
                    {question.prompt}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={selectedOptionId}
                    onValueChange={onSelectOption}
                    className="space-y-4"
                >
                    {question.question_options.map((option) => (
                        <div
                            key={option.id}
                            className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-muted/50 ${selectedOptionId === option.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-input'}`}
                            onClick={() => onSelectOption(option.id)}
                        >
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label
                                htmlFor={option.id}
                                className="flex-grow cursor-pointer font-normal text-base leading-snug"
                            >
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
    );
}

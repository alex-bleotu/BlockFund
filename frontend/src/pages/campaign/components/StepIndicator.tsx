import { t } from "@lingui/core/macro";
import { Target, Trophy, Upload } from "lucide-react";

interface StepIndicatorProps {
    currentStep: number;
    onStepClick: (step: number) => void;
}

export function StepIndicator({
    currentStep,
    onStepClick,
}: StepIndicatorProps) {
    const steps = [
        { step: 1, icon: Target, label: t`Basics` },
        { step: 2, icon: Trophy, label: t`Story` },
        { step: 3, icon: Upload, label: t`Media` },
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-center gap-14 relative">
                {steps.map(({ step, icon: Icon, label }) => (
                    <button
                        key={step}
                        onClick={() => onStepClick(step)}
                        className="flex flex-col items-center">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 cursor-pointer hover:scale-105
                ${
                    currentStep >= step
                        ? "bg-primary text-light scale-110"
                        : "bg-background-alt text-text-secondary"
                }`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <span className="mt-2 text-sm font-medium text-text-secondary">
                            {label}
                        </span>
                    </button>
                ))}
                <div className="absolute top-6 left-0 w-full h-0.5 bg-border -z-10">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

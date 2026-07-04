"use client";

import { Stepper } from "./stepper";

interface FormWizardProps {
  steps: { title: string; description?: string }[];
  currentStep: number;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isSubmitting?: boolean;
}

export function FormWizard({
  steps,
  currentStep,
  children,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  isSubmitting,
}: FormWizardProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="rounded-lg border border-border bg-white p-8 shadow-soft-drop">
        <div className="mb-6">
          <h2 className="text-headline-md text-foreground">
            {steps[currentStep]?.title}
          </h2>
          {steps[currentStep]?.description && (
            <p className="mt-1 text-body-md text-muted-foreground">
              {steps[currentStep].description}
            </p>
          )}
        </div>

        {children}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirstStep}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-container disabled:opacity-50 disabled:pointer-events-none"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-soft-drop transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isLastStep ? "Kirim" : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CopyableCode } from "@/components/data/copyable-code";
import { Callout } from "@/components/shared/callout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SuccessCardProps {
  title: string;
  description: string;
  referenceLabel: string;
  referenceValue: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  notice?: { title?: string; description: string };
  className?: string;
}

function SuccessCard({
  title,
  description,
  referenceLabel,
  referenceValue,
  primaryAction,
  secondaryAction,
  notice,
  className,
}: SuccessCardProps) {
  return (
    <div
      className={cn(
        "max-w-2xl w-full mx-auto bg-white border border-border rounded-xl shadow-sm p-8 md:p-10 text-center",
        className
      )}
    >
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>
      <h1 className="text-headline-lg text-foreground mb-2">{title}</h1>
      <p className="text-body-md text-muted-foreground mb-8 max-w-md mx-auto">{description}</p>
      <CopyableCode label={referenceLabel} value={referenceValue} size="lg" className="mb-8 text-left" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Button asChild size="lg">
          <Link href={primaryAction.href}>{primaryAction.label}</Link>
        </Button>
        {secondaryAction && (
          <Button asChild size="lg" variant="outline">
            <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
          </Button>
        )}
      </div>
      {notice && (
        <Callout variant="info" title={notice.title} description={notice.description} className="text-left" />
      )}
    </div>
  );
}

export { SuccessCard };
export type { SuccessCardProps };

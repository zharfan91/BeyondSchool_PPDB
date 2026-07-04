"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeeBreakdown } from "@/components/data/fee-breakdown";
import { PaymentMethodCard } from "@/components/data/payment-method-card";
import { CopyableCode } from "@/components/data/copyable-code";
import { Download } from "lucide-react";

const feeItems = [
  { label: "Biaya Pendaftaran", description: "Pendaftaran Awal Akun PPDB", amount: 500000 },
  { label: "Biaya Seragam", amount: 1500000 },
  { label: "Biaya Kegiatan", amount: 750000 },
];

const paymentMethods = [
  { id: "mandiri", name: "Bank Mandiri", description: "Virtual Account", va: "8801 0123 4567 8901" },
  { id: "bni", name: "Bank BNI", description: "Virtual Account", va: "8810 9876 5432 1098" },
  { id: "bri", name: "Bank BRI", description: "Virtual Account", va: "8820 1122 3344 5566" },
];

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].id);
  const activeMethod = paymentMethods.find((m) => m.id === selectedMethod)!;

  return (
    <div>
      <PageHeader
        title="Pembayaran"
        description="Informasi biaya dan status pembayaran"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-headline-md">Rincian Tagihan</CardTitle>
          </CardHeader>
          <CardContent>
            <FeeBreakdown items={feeItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Pilih Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                name={method.name}
                description={method.description}
                selected={selectedMethod === method.id}
                onSelect={() => setSelectedMethod(method.id)}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-headline-md">Instruksi Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CopyableCode label={`Virtual Account ${activeMethod.name}`} value={activeMethod.va} size="lg" />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

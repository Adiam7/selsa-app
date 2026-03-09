"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function BeautySelection() {
  const router = useRouter();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Beauty Product</h1>
        <p className="text-sm text-muted-foreground">Create a local beauty product.</p>
      </div>

      <Card className="shadow-none">
        <CardContent className="space-y-6">
          <div className="pt-2 flex gap-3">
            <Button variant="outline" onClick={() => router.push('/admin/products/new/beauty/hair')}>Hair</Button>
            <Button variant="outline" onClick={() => router.push('/admin/products/new/beauty/perfume')}>Perfume</Button>
            <Button variant="outline" onClick={() => router.push('/admin/products/new/beauty/body-scrub')}>Body Scrub</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

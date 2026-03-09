// src/app/api/printful/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

function getPrintfulToken(): string {
  const token = process.env.PRINTFUL_API_TOKEN;
  if (!token) {
    throw new Error("Missing PRINTFUL_API_TOKEN env var");
  }
  return token;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    // Fetch Printful store product template
    const response = await fetch(`https://api.printful.com/store/products/${id}`, {
      headers: {
        Authorization: `Bearer ${getPrintfulToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      return NextResponse.json({ error: "Unauthorized: invalid API key" }, { status: 401 });
    }

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `Printful API error: ${text}` }, { status: response.status });
    }

    const data = await response.json();

    // Map variants safely
    const variants = (data.result.sync_variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      size: v.size,
      color: v.color,
      price: v.retail_price,
      sku: v.sku,
      mainImage: v.product?.image || null,
      previews: (v.files || []).map((f: any) => f.preview_url).filter(Boolean),
      options: v.options || []
    }));

    const product = {
      id: data.result.sync_product.id,
      name: data.result.sync_product.name,
      thumbnail: data.result.sync_product.thumbnail_url,
      variants,
    };

    return NextResponse.json({ product });
  } catch (error: any) {
    const message = error?.message || "Unknown error";
    // Avoid leaking secrets; only return a generic message for env misconfig.
    const safeMessage = message.includes("PRINTFUL_API_TOKEN")
      ? "Server configuration error"
      : message;
    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}

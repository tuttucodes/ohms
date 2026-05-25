import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { productInputSchema } from "@/lib/validation";
import { upsertCustom, newProductId } from "@/lib/data/customProducts";
import { buildProduct } from "@/lib/data/productBuilder";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid product" },
      { status: 400 },
    );
  }
  const product = buildProduct(parsed.data, newProductId());
  await upsertCustom(product);
  return NextResponse.json({ success: true, data: product });
}

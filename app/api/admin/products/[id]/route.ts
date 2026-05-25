import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { productInputSchema } from "@/lib/validation";
import { upsertCustom, deleteCustom, readCustomSync } from "@/lib/data/customProducts";
import { buildProduct } from "@/lib/data/productBuilder";
import { getProductById } from "@/lib/data/products";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
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
  // Editing a seed product writes an override with the same id.
  const product = buildProduct(parsed.data, id);
  await upsertCustom(product);
  return NextResponse.json({ success: true, data: product });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const isCustom = readCustomSync().some((p) => p.id === id);

  if (isCustom) {
    await deleteCustom(id);
    return NextResponse.json({ success: true });
  }

  // Seed products can't be removed from the bundle — take them out of stock
  // by writing an override with stock 0.
  const existing = getProductById(id);
  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  await upsertCustom({ ...existing, stock: 0 });
  return NextResponse.json({ success: true, data: { hidden: true } });
}

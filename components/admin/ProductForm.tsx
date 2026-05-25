"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { productInputSchema } from "@/lib/validation";
import { productImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

interface ProductFormProps {
  product?: Product;
  categories: string[];
  subcategories: string[];
}

interface FormState {
  name: string;
  description: string;
  price: string;
  mrp: string;
  stock: string;
  category: string;
  subcategory: string;
  size: string;
  colorHex: string;
  ageFromYears: string;
  ageToYears: string;
  premium: boolean;
  images: string[];
}

export function ProductForm({ product, categories, subcategories }: ProductFormProps) {
  const router = useRouter();
  const editing = Boolean(product);
  const [form, setForm] = useState<FormState>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    mrp: product ? String(product.mrp) : "",
    stock: product ? String(product.stock) : "10",
    category: product?.category ?? "Clothes & Shoes",
    subcategory: product?.subcategory ?? "",
    size: product?.size ?? "",
    colorHex: product?.colorHex ?? "",
    ageFromYears: product ? String(product.ageFromYears) : "0",
    ageToYears: product ? String(product.ageToYears) : "2",
    premium: product?.premium ?? false,
    images: product?.images.length ? product.images : [""],
  });
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setImage = (i: number, value: string) =>
    setForm((f) => ({
      ...f,
      images: f.images.map((img, idx) => (idx === i ? value : img)),
    }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      mrp: Number(form.mrp) || Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      subcategory: form.subcategory,
      size: form.size,
      colorHex: form.colorHex,
      ageFromYears: Number(form.ageFromYears),
      ageToYears: Number(form.ageToYears),
      premium: form.premium,
      images: form.images.map((s) => s.trim()).filter(Boolean),
    };

    const parsed = productInputSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Save failed");
      toast.success(editing ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card title="Basics">
          <Field label="Product name">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>
          <Field label="Description">
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Input
                list="cat-list"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
              <datalist id="cat-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Subcategory">
              <Input
                list="subcat-list"
                value={form.subcategory}
                onChange={(e) => set("subcategory", e.target.value)}
              />
              <datalist id="subcat-list">
                {subcategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
          </div>
        </Card>

        <Card title="Images">
          <p className="-mt-1 mb-2 text-xs text-muted">
            Paste image URLs, or CDN filenames (e.g. <code>20536575a.jpg</code>).
          </p>
          <div className="space-y-2">
            {form.images.map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                  {img.trim() && (
                    <Image src={productImage(img.trim(), "thumb")} alt="" fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <Input value={img} onChange={(e) => setImage(i, e.target.value)} placeholder="Image URL or filename" />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => set("images", form.images.filter((_, idx) => idx !== i))}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-coral-100 hover:text-coral-600"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="soft"
            size="sm"
            className="mt-3"
            onClick={() => set("images", [...form.images, ""])}
          >
            <Plus className="h-4 w-4" /> Add image
          </Button>
        </Card>
      </div>

      <div className="space-y-5">
        <Card title="Pricing & stock">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₹)">
              <Input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} required />
            </Field>
            <Field label="MRP (₹)">
              <Input type="number" min="0" value={form.mrp} onChange={(e) => set("mrp", e.target.value)} />
            </Field>
          </div>
          <Field label="Stock">
            <Input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </Field>
        </Card>

        <Card title="Attributes">
          <Field label="Size">
            <Input value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="e.g. 2-3y / Pack of 3" />
          </Field>
          <Field label="Colour (hex, no #)">
            <Input value={form.colorHex} onChange={(e) => set("colorHex", e.target.value)} placeholder="5aa630" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Age from (yrs)">
              <Input type="number" step="0.01" min="0" value={form.ageFromYears} onChange={(e) => set("ageFromYears", e.target.value)} />
            </Field>
            <Field label="Age to (yrs)">
              <Input type="number" step="0.01" min="0" value={form.ageToYears} onChange={(e) => set("ageToYears", e.target.value)} />
            </Field>
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.premium}
              onChange={(e) => set("premium", e.target.checked)}
              className="h-4 w-4 rounded border-border accent-leaf-600"
            />
            Mark as premium
          </label>
        </Card>

        <Button type="submit" size="lg" disabled={busy} className="w-full">
          <Save className="h-4 w-4" />
          {busy ? "Saving…" : editing ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
      <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

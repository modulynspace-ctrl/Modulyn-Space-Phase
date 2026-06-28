import React, { useEffect, useState } from "react";
import { Product, ProductPayload } from "@/lib/productsTypes";
import {
  fetchAdminProducts, createProduct,
  updateProduct, deleteProduct,
} from "@/lib/productsApi";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";

type Mode = "list" | "new" | "edit";

export default function AdminProducts() {
  const [mode,        setMode]        = useState<Mode>("list");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [products,    setProducts]    = useState<Product[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error: err } = await fetchAdminProducts();
    setLoading(false);
    setError(err);
    if (!err) setProducts(data);
  }

  // ── Callbacks passed down ──────────────────────────────────────────────────

  async function handleSave(
    payload: ProductPayload
  ): Promise<{ error: string | null }> {
    if (editProduct) {
      const result = await updateProduct(editProduct.id, payload);
      if (!result.error) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editProduct.id
              ? { ...editProduct, ...payload, updated_at: new Date().toISOString() }
              : p
          )
        );
        setMode("list");
        setEditProduct(null);
      }
      return result;
    } else {
      const { data, error: err } = await createProduct(payload);
      if (!err && data) {
        setProducts((prev) => [data, ...prev]);
        setMode("list");
      }
      return { error: err };
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const { error: err } = await deleteProduct(id);
    if (!err) setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleToggle(
    id: string,
    field: "active" | "featured",
    value: boolean
  ): Promise<void> {
    const { error: err } = await updateProduct(id, { [field]: value });
    if (!err)
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
  }

  function handleEdit(product: Product) {
    setEditProduct(product);
    setMode("edit");
  }

  function handleCancel() {
    setMode("list");
    setEditProduct(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (mode === "new" || mode === "edit") {
    return (
      <ProductForm
        product={mode === "edit" ? (editProduct ?? undefined) : undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <ProductList
      products={products}
      loading={loading}
      error={error}
      onAdd={() => setMode("new")}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onToggle={handleToggle}
      onRefresh={load}
    />
  );
}

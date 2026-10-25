"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ApiError, categoryApi } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const retryLoadCategories = async () => {
    setLoadError(false);
    try {
      setCategories(await categoryApi.list());
    } catch {
      setLoadError(true);
    }
  };

  useEffect(() => {
    categoryApi
      .list()
      .then(setCategories)
      .catch(() => setLoadError(true));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const createdCategory = await categoryApi.create({
        name: name.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
      });
      toast.success("Category created successfully.");
      setCategories((current) => [...(current ?? []), createdCategory]);
      setName("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create the category. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <p className="tag-label text-rust mb-2">Admin dashboard</p>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-forest">Categories</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {categories ? `${categories.length} categories` : "Manage gear categories"}
          </p>
        </div>
        <Button type="button" onClick={() => setShowForm((visible) => !visible)}>
          {showForm ? "Cancel" : "Add Category"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-5 border border-line bg-paper p-6">
          <div>
            <Label htmlFor="category-name">Category name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Camping"
              required
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tents, sleeping bags, and all camping essentials"
              rows={4}
            />
          </div>

          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Creating…" : "Create Category"}
          </Button>
        </form>
      )}

      {loadError && (
        <div className="border border-line bg-paper p-6">
          <p className="mb-4 text-sm text-rust-deep">Couldn&apos;t load categories.</p>
          <Button type="button" variant="outline" onClick={() => void retryLoadCategories()}>
            Try again
          </Button>
        </div>
      )}
      {!loadError && !categories && <p className="text-sm text-ink-soft">Loading categories…</p>}
      {!loadError && categories?.length === 0 && (
        <p className="border border-line bg-paper p-6 text-sm text-ink-soft">
          No categories yet. Add a category to get started.
        </p>
      )}
      {!loadError && categories && categories.length > 0 && (
        <ul className="divide-y divide-line border border-line bg-paper">
          {categories.map((category) => (
            <li key={category.id} className="p-5">
              <h2 className="font-semibold text-forest">{category.name}</h2>
              {category.description && (
                <p className="mt-1 text-sm text-ink-soft">{category.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

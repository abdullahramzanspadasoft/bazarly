"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { profileSchema, type ProfileInput } from "@/lib/validations";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.name) {
          reset({
            name: data.name,
            phone: data.phone || "",
            address: data.address || {},
          });
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: ProfileInput) => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error);
        return;
      }
      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-16" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
        <Input label="Full Name" error={errors.name?.message} {...register("name")} />
        <Input label="Phone" error={errors.phone?.message} {...register("phone")} />

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Address</h3>
          <div className="space-y-4">
            <Input label="Street" {...register("address.street")} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" {...register("address.city")} />
              <Input label="State" {...register("address.state")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Zip Code" {...register("address.zipCode")} />
              <Input label="Country" {...register("address.country")} />
            </div>
          </div>
        </div>

        <Button type="submit" loading={saving}>Save Changes</Button>
      </form>
    </div>
  );
}

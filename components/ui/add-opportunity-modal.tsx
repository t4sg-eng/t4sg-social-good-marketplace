"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { createBrowserSupabaseClient } from "@/lib/client-utils";

const opportunitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  nonprofit: z.string().min(1, "Nonprofit name is required"),
  description: z.string().min(1, "Description is required"),
  skills: z.string().min(1, "Skills are required"),
  contact_email: z.string().email("Please enter a valid email address"),
  t4sg_verified: z.boolean(),
});

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

export function AddOpportunityModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      nonprofit: "",
      description: "",
      skills: "",
      contact_email: "",
      t4sg_verified: false,
    },
  });

  function handleClose() {
    setOpen(false);
    form.reset();
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>): void {
    void form.handleSubmit(onSubmit)(e);
  }

  async function onSubmit(values: OpportunityFormValues) {
    setIsSubmitting(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("opportunities").insert(values);
    setIsSubmitting(false);

    if (error) {
      form.setError("root", {
        message: "Failed to add opportunity. Please try again.",
      });
      return;
    }

    handleClose();
    router.refresh();
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        + Add Opportunity
      </Button>

      <Modal open={open} onClose={handleClose}>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Add Opportunity
            </h2>
            <p className="text-sm text-muted-foreground">
              Fill in the details for the new opportunity.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Opportunity title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nonprofit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nonprofit</FormLabel>
                    <FormControl>
                      <Input placeholder="Nonprofit organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the opportunity..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. React, Python, Design"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nonprofit Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@nonprofit.org"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? "Adding..." : "Add Opportunity"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Modal>
    </>
  );
}

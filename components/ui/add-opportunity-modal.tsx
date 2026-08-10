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
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";

const opportunitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  nonprofit: z.string().min(1, "Nonprofit name is required"),
  description: z.string().min(1, "Description is required"),
  skills: z.string().min(1, "List at least one skill"),
  contact_email: z.string().email("Enter a valid email address"),
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
    // created_by (auth.uid()) and status ('pending') are set by DB defaults.
    const { error } = await supabase.from("opportunities").insert(values);
    setIsSubmitting(false);

    if (error) {
      form.setError("root", {
        message:
          "Couldn't post the project. You may need approved organizer access.",
      });
      return;
    }

    handleClose();
    toast({
      title: "Project submitted",
      description: "It'll appear in the gallery once an admin approves it.",
    });
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Post a project</Button>

      <Modal open={open} onClose={handleClose}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <p className="caps">New submission</p>
            <h2 className="font-serif text-2xl font-medium text-foreground">
              Post a project
            </h2>
            <p className="annot">
              An admin reviews each submission before it joins the collection.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="caps">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rebuild the donor dashboard"
                        {...field}
                      />
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
                    <FormLabel className="caps">Nonprofit</FormLabel>
                    <FormControl>
                      <Input placeholder="Food Bank Boston" {...field} />
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
                    <FormLabel className="caps">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What needs building, and why it matters…"
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
                    <FormLabel className="caps">Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="React, TypeScript, SQL" {...field} />
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
                    <FormLabel className="caps">Contact email</FormLabel>
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
                <p className="text-sm font-medium text-danger">
                  {form.formState.errors.root.message}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit project"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Modal>
    </>
  );
}

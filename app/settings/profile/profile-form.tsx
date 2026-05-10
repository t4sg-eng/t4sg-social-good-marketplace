"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { type Database } from "@/lib/schema";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent, type MouseEvent } from "react";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    })
    .transform((val) => val.trim()),
  avatar_url: z
    .string()
    .max(2048, {
      message: "Avatar URL cannot be longer than 2048 characters.",
    })
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [isEditing, setIsEditing] = useState(false);

  // Default values for the form fields.
  /* Because the react-hook-form (RHF) used here is a controlled form (not an uncontrolled form),
  all form fields should be set to non-undefined default values since `undefined` conflicts with controlled components.
  Read more here: https://legacy.react-hook-form.com/api/useform/
  */
  const defaultValues = {
    username: profile.username ?? "",
    avatar_url: profile.avatar_url ?? "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const router = useRouter();

  const onSubmit = async (data: ProfileFormValues) => {
    const supabase = createBrowserSupabaseClient();

    const updates: ProfileUpdate = {
      username: data.username,
      avatar_url: data.avatar_url,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates as never)
      .eq("id", profile.id);

    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsEditing(false);

    // Reset form values to the data values that have been processed by zod.
    // This way the user sees any changes that have occurred during transformation
    form.reset(data);

    // Router.refresh does not affect ProfileForm because it is a client component, but it will refresh the initials in the user-nav in the event of a username change
    router.refresh();

    return toast({
      title: "Profile updated successfully!",
    });
  };

  const startEditing = (e: MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleCancel = (e: MouseEvent) => {
    e.preventDefault();
    form.reset(defaultValues);
    setIsEditing(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e: BaseSyntheticEvent) =>
          void form.handleSubmit(onSubmit)(e)
        }
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  readOnly={!isEditing}
                  placeholder="Username"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is your public username. It can be your real name or a
                pseudonym.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <FormControl>
                  <Input
                    readOnly={!isEditing}
                    placeholder="https://..."
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  A URL to your profile picture.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {isEditing ? (
          <>
            <Button type="submit" className="mr-2">
              Update profile
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={startEditing}>Edit Profile</Button>
        )}
      </form>
    </Form>
  );
}

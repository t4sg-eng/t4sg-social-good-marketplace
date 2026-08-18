"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import Modal from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { ChevronDown, Search, X } from "lucide-react";

const SKILL_OPTIONS = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "Java",
  "Design",
  "Data Analysis",
  "Mobile",
  "DevOps",
] as const;

const PRESET_SKILLS = new Set<string>(SKILL_OPTIONS);

function parseSkills(value: string): string[] {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function toggleSkill(current: string, skill: string): string {
  const selected = parseSkills(current);
  const next = selected.includes(skill)
    ? selected.filter((item) => item !== skill)
    : [...selected, skill];
  return next.join(", ");
}

const opportunitySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    nonprofit: z.string().min(1, "Nonprofit name is required"),
    nonprofit_link: z.string().url("Please enter a valid URL"),
    description: z.string().min(1, "Description is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    skills: z.string().min(1, "Skills are required"),
    contact_email: z.string().email("Please enter a valid email address"),
    t4sg_verified: z.boolean(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date must be on or after the start date",
    path: ["end_date"],
  });

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

const VISIBLE_CHIP_COUNT = 3;

function SkillsDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [otherEnabled, setOtherEnabled] = useState(false);
  const [customDraft, setCustomDraft] = useState("");

  const selected = parseSkills(value);
  const customSelected = selected.filter((skill) => !PRESET_SKILLS.has(skill));
  const otherChecked = otherEnabled || customSelected.length > 0;
  const visible = selected.slice(0, VISIBLE_CHIP_COUNT);
  const overflow = selected.length - visible.length;
  const filtered = SKILL_OPTIONS.filter((skill) =>
    skill.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const showOtherOption =
    query.trim() === "" ||
    "other(s)".startsWith(query.trim().toLowerCase());

  useEffect(() => {
    if (!value) {
      setOtherEnabled(false);
      setCustomDraft("");
    }
  }, [value]);

  function removeSkill(skill: string) {
    onChange(selected.filter((item) => item !== skill).join(", "));
  }

  function toggleOther() {
    if (otherChecked) {
      setOtherEnabled(false);
      setCustomDraft("");
      onChange(selected.filter((skill) => PRESET_SKILLS.has(skill)).join(", "));
      return;
    }
    setOtherEnabled(true);
  }

  function addCustomSkills() {
    const extras = parseSkills(customDraft);
    if (extras.length === 0) {
      return;
    }

    const next = [...selected];
    for (const extra of extras) {
      const presetMatch = SKILL_OPTIONS.find(
        (skill) => skill.toLowerCase() === extra.toLowerCase(),
      );
      const toAdd = presetMatch ?? extra;
      const alreadySelected = next.some(
        (skill) => skill.toLowerCase() === toAdd.toLowerCase(),
      );
      if (!alreadySelected) {
        next.push(toAdd);
      }
    }

    onChange(next.join(", "));
    setCustomDraft("");
    setOtherEnabled(true);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-background">
      <div className="flex w-full items-center gap-2 px-3 py-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selected.length === 0 ? (
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="text-sm text-muted-foreground"
            >
              Select skills
            </button>
          ) : (
            <>
              {visible.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground"
                >
                  {skill}
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    className="rounded-full hover:bg-muted-foreground/20"
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {overflow > 0 && (
                <span className="inline-flex items-center rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
                  +{overflow}
                </span>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close skills list" : "Open skills list"}
          onClick={() => setOpen((prev) => !prev)}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </div>

      {open && (
        <div className="border-t border-input p-2">
          <div className="relative mb-2">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="h-9 w-full rounded-full border border-input bg-transparent px-3 pr-8 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <Search className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filtered.length === 0 && !showOtherOption ? (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No skills found.
              </p>
            ) : (
              <>
                {filtered.map((skill) => {
                  const isSelected = selected.includes(skill);
                  return (
                    <label
                      key={skill}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                        isSelected
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onChange(toggleSkill(value, skill))}
                        className="h-4 w-4 rounded-sm accent-emerald-600"
                      />
                      {skill}
                    </label>
                  );
                })}
                {showOtherOption && (
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                      otherChecked
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={otherChecked}
                      onChange={toggleOther}
                      className="h-4 w-4 rounded-sm accent-emerald-600"
                    />
                    Other(s)
                  </label>
                )}
              </>
            )}
          </div>
          {otherChecked && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={customDraft}
                onChange={(event) => setCustomDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomSkills();
                  }
                }}
                placeholder="Type a skill(s) separated by commas, then press Enter"
                className="h-9 min-w-0 flex-1 rounded-full border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={addCustomSkills}
                className="rounded-full bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AddOpportunityModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      nonprofit: "",
      nonprofit_link: "",
      description: "",
      start_date: "",
      end_date: "",
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsSubmitting(false);
      form.setError("root", {
        message: "You must be signed in to add an opportunity.",
      });
      return;
    }

    const { error } = await supabase.from("opportunities").insert({
      ...values,
      created_by: user.id,
    } as never);
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
                name="nonprofit_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nonprofit Link</FormLabel>
                    <FormDescription>
                      Provide a link to your non-profit&apos;s website or social
                      media profile.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="https://nonprofit.org" {...field} />
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

              <div>
                <FormLabel>Project Duration</FormLabel>
                <FormDescription>
                  When volunteers should begin and when the project wraps up.
                </FormDescription>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormDescription>Project start date</FormDescription>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormDescription>Project end date</FormDescription>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormDescription>
                      Select all skills that apply, or choose Other(s) to type your
                      own set
                    </FormDescription>
                    <FormControl>
                      <SkillsDropdown
                        value={field.value}
                        onChange={field.onChange}
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

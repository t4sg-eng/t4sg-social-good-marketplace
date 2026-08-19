"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";

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

/** Skills persist as a comma-separated string, so parse/join on every edit. */
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
    nonprofit_link: z
      .string()
      .trim()
      .refine((value) => value === "" || z.string().url().safeParse(value).success, {
        message: "Enter a valid URL, including https://",
      }),
    description: z.string().min(1, "Description is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    skills: z.string().min(1, "List at least one skill"),
    contact_email: z.string().email("Enter a valid email address"),
  })
  // ISO yyyy-mm-dd sorts lexicographically, so a string compare is a date compare.
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
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = parseSkills(value);
  const customSelected = selected.filter((skill) => !PRESET_SKILLS.has(skill));
  const otherChecked = otherEnabled || customSelected.length > 0;
  const visible = selected.slice(0, VISIBLE_CHIP_COUNT);
  const overflow = selected.length - visible.length;
  const filtered = SKILL_OPTIONS.filter((skill) =>
    skill.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const showOtherOption =
    query.trim() === "" || "other(s)".startsWith(query.trim().toLowerCase());

  // A form reset clears the field; drop the custom-skill state along with it.
  useEffect(() => {
    if (!value) {
      setOtherEnabled(false);
      setCustomDraft("");
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

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
    if (extras.length === 0) return;

    const next = [...selected];
    for (const extra of extras) {
      // Fold a typed "react" back onto the canonical "React" option.
      const presetMatch = SKILL_OPTIONS.find(
        (skill) => skill.toLowerCase() === extra.toLowerCase(),
      );
      const toAdd = presetMatch ?? extra;
      const alreadySelected = next.some(
        (skill) => skill.toLowerCase() === toAdd.toLowerCase(),
      );
      if (!alreadySelected) next.push(toAdd);
    }

    onChange(next.join(", "));
    setCustomDraft("");
    setOtherEnabled(true);
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-md border border-input bg-transparent"
    >
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
                  className="inline-flex items-center gap-1 rounded-sm border border-border bg-muted px-2 py-0.5 text-xs text-foreground"
                >
                  {skill}
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {overflow > 0 && (
                <span className="inline-flex items-center rounded-sm bg-foreground px-2 py-0.5 text-xs text-background">
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
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="border-t border-border p-2">
          <div className="relative mb-2">
            <Input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="h-9 pr-8"
            />
            <Search className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filtered.length === 0 && !showOtherOption ? (
              <p className="annot px-2 py-1.5">No skills found.</p>
            ) : (
              <>
                {filtered.map((skill) => {
                  const isSelected = selected.includes(skill);
                  return (
                    <label
                      key={skill}
                      className={`flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors ${
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onChange(toggleSkill(value, skill))}
                        className="h-4 w-4 rounded-sm accent-primary"
                      />
                      {skill}
                    </label>
                  );
                })}
                {showOtherOption && (
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors ${
                      otherChecked
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={otherChecked}
                      onChange={toggleOther}
                      className="h-4 w-4 rounded-sm accent-primary"
                    />
                    Other(s)
                  </label>
                )}
              </>
            )}
          </div>
          {otherChecked && (
            <div className="mt-2 flex gap-2">
              <Input
                type="text"
                value={customDraft}
                onChange={(event) => setCustomDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomSkills();
                  }
                }}
                placeholder="Type skills separated by commas, then press Enter"
                className="h-9 min-w-0 flex-1"
              />
              <Button type="button" size="sm" onClick={addCustomSkills}>
                Add
              </Button>
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
    const { error } = await supabase.from("opportunities").insert({
      ...values,
      // The column is nullable; an untouched optional field should store NULL.
      nonprofit_link: values.nonprofit_link === "" ? null : values.nonprofit_link,
    });
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
                name="nonprofit_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="caps">
                      Nonprofit link (optional)
                    </FormLabel>
                    <FormDescription className="annot">
                      Your website or a social profile, so engineers can read up
                      on the organization.
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

              <div className="flex flex-col gap-2">
                <FormLabel className="caps">Project duration</FormLabel>
                <FormDescription className="annot">
                  When volunteers should begin, and when the project wraps up.
                </FormDescription>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormDescription className="annot">
                          Start date
                        </FormDescription>
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
                        <FormDescription className="annot">
                          End date
                        </FormDescription>
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
                    <FormLabel className="caps">Skills</FormLabel>
                    <FormDescription className="annot">
                      Select every skill that applies, or choose Other(s) to add
                      your own.
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

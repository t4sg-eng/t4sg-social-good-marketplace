"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { Github } from "lucide-react";

export default function LoginButton() {
  const supabase = createBrowserSupabaseClient();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        // Must pass through callback route so auth code is exchanged for a session.
        redirectTo: `${location.origin}/auth/callback?next=/dashboard`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    return;
  };
  return (
    <Button
      size="lg"
      onClick={() => {
        void handleSignIn();
      }}
    >
      <Github className="mr-2 h-4 w-4" />
      Log in with GitHub
    </Button>
  );
}

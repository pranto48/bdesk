import { useEffect, useMemo, useState } from "react";
import { WindowFrame } from "@/components/desktop/WindowFrame";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthWindowProps {
  onClose: () => void;
}

export const AuthWindow = ({ onClose }: AuthWindowProps) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `${mode === "signin" ? "Sign in" : "Register"} | bdesk.site`;
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = window.location.href;
      document.head.appendChild(link);
    }
  }, [mode]);

  const title = useMemo(() => (mode === "signin" ? "Sign in to bdesk.site" : "Create your bdesk.site account"), [mode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Signed in" });
        onClose();
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { name },
          },
        });
        if (error) throw error;
        toast({ title: "Registration successful", description: "Check your email to confirm (if required)." });
        setMode("signin");
      }
    } catch (err: any) {
      toast({ title: "Auth error", description: err?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WindowFrame title={title} onClose={onClose}>
      <main className="h-full overflow-auto p-4">
        <h1 className="sr-only">{title}</h1>
        <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={loading}>{mode === "signin" ? "Sign in" : "Sign up"}</Button>
            <Button type="button" variant="ghost" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Create account" : "Have an account? Sign in"}
            </Button>
          </div>
        </form>
      </main>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "bdesk.site",
          url: "https://www.bdesk.site",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.bdesk.site/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        })}
      </script>
    </WindowFrame>
  );
};

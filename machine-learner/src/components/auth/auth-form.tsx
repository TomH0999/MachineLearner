"use client";

import { useId, useLayoutEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/routes";
import { applyTheme, getStoredTheme } from "@/lib/theme";

interface AuthError {
  code?: string;
  status: number;
}

// `$ERROR_CODES` n'existe qu'au niveau des types (le client est un proxy) : on s'en sert pour vérifier les clés.
type AuthErrorCode = keyof typeof authClient.$ERROR_CODES;

const ERROR_MESSAGES: Partial<Record<AuthErrorCode, string>> = {
  INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect.",
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cet email.",
  // Code réellement renvoyé par signUp.email en 1.7.x.
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cet email.",
  PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 8 caractères.",
  INVALID_EMAIL: "Adresse email invalide.",
};

const GENERIC_ERROR = "Une erreur est survenue. Réessaie.";

function isMappedErrorCode(code: string): code is AuthErrorCode {
  return Object.hasOwn(ERROR_MESSAGES, code);
}

function getErrorMessage(error: AuthError): string {
  if (error.status === 429) return "Trop de tentatives, réessaie dans quelques instants.";
  if (error.code && isMappedErrorCode(error.code)) return ERROR_MESSAGES[error.code] ?? GENERIC_ERROR;
  return GENERIC_ERROR;
}

/**
 * Cible de redirection après authentification, lue dans `?next=` au moment du submit.
 * Seul un chemin relatif de la même origine est accepté (protection contre les redirections ouvertes).
 */
function getSafeNextPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return ROUTES.dashboard;
  }
  // Le parseur d'URL ignore tabulations et retours à la ligne ("/\t/evil.com" devient "//evil.com") :
  // on vérifie aussi l'origine après normalisation.
  const url = new URL(next, window.location.origin);
  if (url.origin !== window.location.origin || url.pathname === ROUTES.login) {
    return ROUTES.dashboard;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function AuthForm() {
  const router = useRouter();
  const id = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // La page /login n'a pas le ThemeToggle du shell, or en dev le Strict Mode retire la classe `dark`
  // posée par le script inline : on la réapplique avant l'affichage.
  useLayoutEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  function onSuccess(message: string) {
    toast.success(message);
    router.replace(getSafeNextPath());
    router.refresh();
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = readField(formData, "email").trim();
    const password = readField(formData, "password");

    setError(null);
    setPending(true);
    try {
      const { error: authError } = await authClient.signIn.email({ email, password });
      if (authError) {
        setError(getErrorMessage(authError));
        setPending(false);
        return;
      }
    } catch {
      setError(GENERIC_ERROR);
      setPending(false);
      return;
    }
    // `pending` reste vrai jusqu'au démontage : le bouton ne se réactive pas pendant la navigation.
    onSuccess("Connexion réussie");
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = readField(formData, "name").trim();
    const email = readField(formData, "email").trim();
    const password = readField(formData, "password");

    if (password !== readField(formData, "confirmPassword")) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setError(null);
    setPending(true);
    try {
      const { error: authError } = await authClient.signUp.email({ name, email, password });
      if (authError) {
        setError(getErrorMessage(authError));
        setPending(false);
        return;
      }
    } catch {
      setError(GENERIC_ERROR);
      setPending(false);
      return;
    }
    onSuccess(`Bienvenue, ${name} !`);
  }

  const errorMessage = error ? (
    <p role="alert" className="text-sm text-destructive">
      {error}
    </p>
  ) : null;

  return (
    <Tabs defaultValue="signin" onValueChange={() => setError(null)}>
      <TabsList className="w-full">
        <TabsTrigger value="signin">Connexion</TabsTrigger>
        <TabsTrigger value="signup">Inscription</TabsTrigger>
      </TabsList>

      <TabsContent value="signin" className="pt-2">
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-signin-email`}>Email</Label>
            <Input id={`${id}-signin-email`} name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-signin-password`}>Mot de passe</Label>
            <Input
              id={`${id}-signin-password`}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {errorMessage}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
            Se connecter
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup" className="pt-2">
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-signup-name`}>Nom</Label>
            <Input id={`${id}-signup-name`} name="name" autoComplete="name" maxLength={60} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-signup-email`}>Email</Label>
            <Input id={`${id}-signup-email`} name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-signup-password`}>Mot de passe</Label>
            <Input
              id={`${id}-signup-password`}
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-signup-confirm`}>Confirmer le mot de passe</Label>
            <Input
              id={`${id}-signup-confirm`}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          {errorMessage}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
            Créer mon compte
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}

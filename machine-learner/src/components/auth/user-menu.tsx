"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/routes";

export interface UserMenuProps {
  user: { name: string; email: string };
  showName?: boolean;
}

/** Premières lettres des deux premiers mots du nom ; à défaut, première lettre de l'email. */
function getInitials(name: string, email: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
  return initials || (Array.from(email)[0] ?? "").toUpperCase();
}

async function signOut(): Promise<boolean> {
  try {
    const { error } = await authClient.signOut();
    return !error;
  } catch {
    return false;
  }
}

export function UserMenu({ user, showName = false }: UserMenuProps) {
  const router = useRouter();

  async function handleSignOut() {
    if (!(await signOut())) {
      toast.error("Déconnexion impossible. Réessaie.");
      return;
    }
    router.replace(ROUTES.login);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={showName ? "default" : "icon"}
          aria-label="Menu du compte"
          className={cn(showName ? "h-auto max-w-full justify-start gap-2 px-1.5 py-1" : "rounded-full")}
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          >
            {getInitials(user.name, user.email)}
          </span>
          {showName && <span className="truncate">{user.name}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm text-foreground">{user.name}</span>
          <span className="truncate font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handleSignOut()}>
          <LogOut aria-hidden="true" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

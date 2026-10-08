// Build Vercel (script npm "vercel-build").
// Production : migrations puis seed idempotent du contenu, AVANT le build. Preview : base partagée avec la production → rien.
import { execSync } from "node:child_process";

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
}

if (process.env.VERCEL_ENV === "production") {
  run("prisma migrate deploy");
  run("prisma db seed");
} else {
  console.log(`VERCEL_ENV=${process.env.VERCEL_ENV ?? "(local)"} : migrations et seed ignorés.`);
}
run("next build");

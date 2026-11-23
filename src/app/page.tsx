import { Button } from "@/components/ui/button";

// Placeholder home page for T-FND-2. It proves Tailwind and shadcn/ui work.
// The real landing page and the Arabic/English switch come in later tickets.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Shop OS</h1>
      <p lang="ar" dir="rtl" className="text-lg text-muted-foreground">
        نظام محلك في مكان واحد
      </p>
      <Button size="lg">Get started</Button>
    </main>
  );
}

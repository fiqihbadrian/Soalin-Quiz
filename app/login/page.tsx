import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoginForm } from "@/components/LoginForm";
import { Spinner } from "@/components/ui/Spinner";

export const metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <Suspense
        fallback={
          <main className="flex flex-1 items-center justify-center">
            <Spinner label="Memuat halaman" />
          </main>
        }
      >
        <LoginForm />
      </Suspense>

      <Footer />
    </div>
  );
}

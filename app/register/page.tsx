import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RegisterForm } from "@/components/RegisterForm";

export const metadata = {
  title: "Buat akun",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <RegisterForm />
      <Footer />
    </div>
  );
}

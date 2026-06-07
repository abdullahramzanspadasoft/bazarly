import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 min-h-full w-full items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

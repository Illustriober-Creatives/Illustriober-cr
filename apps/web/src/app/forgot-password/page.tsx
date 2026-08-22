import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Reset Password",
  description: "Request a secure password reset for the Illustriober client portal.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

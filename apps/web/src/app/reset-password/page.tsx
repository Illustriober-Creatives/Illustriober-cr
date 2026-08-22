import { ResetPasswordForm } from "./ResetPasswordForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Choose a New Password",
  description: "Choose a new password for the Illustriober client portal.",
  path: "/reset-password",
  noIndex: true,
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return <ResetPasswordForm token={token} />;
}

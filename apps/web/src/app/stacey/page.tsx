import type { Metadata } from "next";
import { StaceyExperience } from "./StaceyExperience";

export const metadata: Metadata = {
  title: "A little something for Stacey",
  description: "A private invitation.",
  robots: { index: false, follow: false, nocache: true },
};

export default function StaceyPage() {
  return <StaceyExperience />;
}

import { redirect } from "next/navigation";

/**
 * Root page — redirects straight to the studio wizard for testing.
 * In production, swap this for a marketing/landing page.
 */
export default function HomePage() {
  redirect("/studio/demo");
}

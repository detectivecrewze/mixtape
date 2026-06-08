import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMixtape } from "@/lib/kv";
import GiftViewClient from "./GiftViewClient";
import type { MixtapeGiftConfig } from "./GiftViewClient";

interface Props {
  params: Promise<{ mixtapeId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mixtapeId } = await params;
  if (mixtapeId === "demo") {
    return {
      title: "A Mixtape for You",
      description: "Someone made you a personalized digital mixtape. Open it!",
    };
  }

  const data = (await getMixtape(mixtapeId)) as MixtapeGiftConfig | null;
  if (!data) {
    return {
      title: "Mixtape Not Found",
      description: "This mixtape link may have expired or is incorrect.",
    };
  }

  return {
    title: "A Mixtape for You",
    description: "Someone made you a personalized digital mixtape. Open it!",
  };
}

export default async function GiftViewPage({ params }: Props) {
  const { mixtapeId } = await params;

  // Demo mode — shows mockup
  if (mixtapeId === "demo") {
    return <GiftViewClient useMockup={true} />;
  }

  // Fetch real data from KV
  const data = (await getMixtape(mixtapeId)) as MixtapeGiftConfig | null;

  if (!data) {
    notFound();
  }

  // Only serve published mixtapes publicly
  // (drafts are still accessible directly but show real data)
  return <GiftViewClient config={data} useMockup={false} />;
}

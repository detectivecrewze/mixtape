import GiftViewClient from "../[mixtapeId]/GiftViewClient";

export const dynamic = "force-dynamic";

export default function PreviewGiftPage() {
  return <GiftViewClient useMockup={true} />;
}

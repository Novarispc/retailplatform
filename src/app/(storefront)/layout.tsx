import { Navbar } from "@/components/magic/navbar";
import { Footer } from "@/components/magic/footer";
import { CartDrawer } from "@/components/magic/cart-drawer";
import { AiAssistant } from "@/components/magic/ai-assistant";
import { CursorFx } from "@/components/magic/cursor-fx";
import { AnnouncementBar } from "@/components/magic/announcement-bar";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CursorFx />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <Footer />
      <CartDrawer />
      <AiAssistant />
    </>
  );
}

"use client";

import ImmersiveFullscreenNav from "@/components/ui/immersive-full-screen-nav";

export default function ImmersiveFullscreenNavDemo() {
  return (
    <div className="w-full min-w-0">
      <ImmersiveFullscreenNav
        navConfig={{
          brand: "BhuRakshak",
          brandHref: "#",
          overlayBg: "#101014",
          clipOrigin: "left",
        }}
        navContent={{
          agencyName: "BhuRakshak System",
          tagline: "AI-enabled mine subsidence monitoring & early warning.",
          location: "Noida, India",
          links: [
            { label: "Home", href: "/" },
            { label: "Operator", href: "/operator" },
            { label: "Planner", href: "/planner" },
            { label: "Regulator", href: "/regulator" },
          ],
          images: [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
            "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
          ],
          socials: [
            { type: "instagram", href: "#" },
            { type: "twitter", href: "#" },
            { type: "linkedin", href: "#" },
          ],
        }}
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["safer", "smarter", "resilient", "monitored", "protected"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-6 py-12 lg:py-40 items-center justify-center flex-col px-4">
          <div>
            <Button variant="secondary" size="sm" className="gap-4 text-center text-xs sm:text-sm">
              Smart India Hackathon 2026 · SIH26025{" "}
              <MoveRight className="w-4 h-4 shrink-0" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-4xl sm:text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-foreground">Making coal mines</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-primary"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-base md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              AI-enabled, low-cost surface sensor network for continuous mine
              deformation monitoring, risk assessment and early warning in
              underground coal mines. Real-time ground intelligence for
              operators, planners and regulators.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-2 sm:px-0">
            <Button size="lg" className="gap-4 w-full sm:w-auto justify-center" variant="outline">
              Learn how it works <PhoneCall className="w-4 h-4 shrink-0" />
            </Button>
            <Button size="lg" className="gap-4 w-full sm:w-auto justify-center">
              Explore dashboards <MoveRight className="w-4 h-4 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };

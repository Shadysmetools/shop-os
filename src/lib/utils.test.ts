import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names and skips false values", () => {
    expect(cn("p-2", false && "hidden", "text-sm")).toBe("p-2 text-sm");
  });

  it("lets the later Tailwind class win when two conflict", () => {
    expect(cn("ps-2", "ps-4")).toBe("ps-4");
  });
});

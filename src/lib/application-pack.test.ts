import { describe, expect, it } from "vitest";
import { buildApplicationPack } from "./application-pack";

describe("buildApplicationPack", () => {
  it("combines the summary, gaps, and interview prompts into one pack", () => {
    const pack = buildApplicationPack(
      {
        score: 80,
        matchedSkills: ["TypeScript", "React"],
        missingSkills: ["AWS"],
        evidence: ["TypeScript: built it."],
        suggestions: ["Add AWS."],
      },
      [
        { category: "Experience", question: "Tell me about a project where you used TypeScript.", prompt: "Explain your work." },
        { category: "Gap", question: "What is your current experience with AWS?", prompt: "Be honest." },
      ],
    );

    expect(pack).toContain("Overall fit: 80/100");
    expect(pack).toContain("Strongest signals: TypeScript, React");
    expect(pack).toContain("What to make more visible: AWS");
    expect(pack).toContain("Experience");
    expect(pack).toContain("What is your current experience with AWS?");
  });
});

import { describe, expect, it } from "vitest";
import { buildBulletSuggestions } from "./bullets";
import { analyzeMatch } from "./match";

describe("buildBulletSuggestions", () => {
  it("grounds suggestions in matching resume lines and caps the list", () => {
    const resume = [
      "- Built a TypeScript dashboard for a campus project.",
      "- Added React components for the student portal.",
      "- Improved testing coverage for a full-stack application.",
      "- Wrote documentation for the team.",
    ].join("\n");
    const result = analyzeMatch(resume, "Role requiring TypeScript, React, and testing.");
    const suggestions = buildBulletSuggestions(resume, result);

    expect(suggestions).toHaveLength(3);
    expect(suggestions[0].original).toContain("TypeScript");
    expect(suggestions[0].suggested).toContain("using TypeScript");
    expect(suggestions.every((suggestion) => suggestion.suggested.toLowerCase().includes(suggestion.original.toLowerCase()))).toBe(true);
  });
});
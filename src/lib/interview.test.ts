import { describe, expect, it } from "vitest";
import { buildInterviewPrep } from "./interview";
import { analyzeMatch } from "./match";

describe("buildInterviewPrep", () => {
  it("includes evidence, technical practice, and a prompt for the first gap", () => {
    const resume = "Built a React dashboard with TypeScript for a class project.";
    const result = analyzeMatch(resume, "Frontend role requiring React, TypeScript, AWS, and testing.");
    const questions = buildInterviewPrep(result, resume);

    expect(questions.map((question) => question.category)).toEqual(["Experience", "Technical", "Gap"]);
    expect(questions[0].question).toContain("TypeScript");
    expect(questions[0].prompt).toContain("React dashboard");
    expect(questions[2].question).toContain("AWS");
  });
});
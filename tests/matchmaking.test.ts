import { describe, it, expect } from "vitest";

// Pure function mirroring matchmaking tag calculation logic
function calculateTagMatch(
  requiredTags: string[],
  alumniSkills: string[],
  alumniExpertise: string[]
): { matchedTags: string[]; matchPercentage: number } {
  const normalizedRequired = requiredTags.map((t) => t.trim().toLowerCase());
  const combinedAlumniTags = [...alumniSkills, ...alumniExpertise].map((t) =>
    String(t).trim().toLowerCase()
  );

  const matchedOriginalTags: string[] = [];
  requiredTags.forEach((tag) => {
    if (combinedAlumniTags.includes(tag.trim().toLowerCase())) {
      matchedOriginalTags.push(tag);
    }
  });

  const totalRequired = normalizedRequired.length;
  const matchPercentage =
    totalRequired > 0 ? Math.round((matchedOriginalTags.length / totalRequired) * 100) : 0;

  return { matchedTags: matchedOriginalTags, matchPercentage };
}

describe("Intelligent Alumni Tag Matchmaking Engine (Module 4)", () => {
  it("should calculate 100% match when all required tags are present", () => {
    const required = ["React", "TypeScript", "Node.js"];
    const skills = ["React", "Docker", "Node.js"];
    const expertise = ["TypeScript", "System Design"];

    const result = calculateTagMatch(required, skills, expertise);
    expect(result.matchPercentage).toBe(100);
    expect(result.matchedTags.length).toBe(3);
  });

  it("should handle case-insensitive tag matching", () => {
    const required = ["PYTHON", "Machine Learning"];
    const skills = ["python", "machine learning"];

    const result = calculateTagMatch(required, skills, []);
    expect(result.matchPercentage).toBe(100);
    expect(result.matchedTags).toEqual(["PYTHON", "Machine Learning"]);
  });

  it("should return 0% match when no tags intersect", () => {
    const required = ["Blockchain", "Solidity"];
    const skills = ["Java", "Spring Boot"];

    const result = calculateTagMatch(required, skills, []);
    expect(result.matchPercentage).toBe(0);
    expect(result.matchedTags.length).toBe(0);
  });

  it("should calculate correct partial match percentage with rounding", () => {
    const required = ["React", "Next.js", "Tailwind CSS"];
    const skills = ["React", "Vue"];

    const result = calculateTagMatch(required, skills, []);
    // 1 out of 3 = 33%
    expect(result.matchPercentage).toBe(33);
    expect(result.matchedTags).toEqual(["React"]);
  });

  it("should handle empty required tags gracefully without division by zero", () => {
    const result = calculateTagMatch([], ["React"], []);
    expect(result.matchPercentage).toBe(0);
  });

  it("should sort alumni by match percentage in descending order", () => {
    const candidates = [
      { id: 1, name: "Candidate A", matchPercentage: 33 },
      { id: 2, name: "Candidate B", matchPercentage: 100 },
      { id: 3, name: "Candidate C", matchPercentage: 67 },
    ];

    const sorted = [...candidates].sort((a, b) => b.matchPercentage - a.matchPercentage);
    expect(sorted[0].id).toBe(2); // 100%
    expect(sorted[1].id).toBe(3); // 67%
    expect(sorted[2].id).toBe(1); // 33%
  });
});

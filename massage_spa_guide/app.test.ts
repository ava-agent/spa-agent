import { describe, it, expect, beforeEach } from "vitest";
import knowledgeData from "./data/knowledge.json";

describe("Knowledge Data Structure", () => {
  it("should have valid categories", () => {
    expect(knowledgeData.categories).toBeDefined();
    expect(knowledgeData.categories.length).toBeGreaterThan(0);
    
    knowledgeData.categories.forEach((category) => {
      expect(category.id).toBeDefined();
      expect(category.name).toBeDefined();
      expect(category.description).toBeDefined();
      expect(category.icon).toBeDefined();
      expect(category.color).toBeDefined();
    });
  });

  it("should have valid knowledge items", () => {
    expect(knowledgeData.knowledge).toBeDefined();
    expect(knowledgeData.knowledge.length).toBeGreaterThan(0);
    
    knowledgeData.knowledge.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.category).toBeDefined();
      expect(item.description).toBeDefined();
      expect(item.content).toBeDefined();
      expect(item.readingTime).toBeGreaterThan(0);
      expect(item.publishedAt).toBeDefined();
      expect(item.tags).toBeDefined();
      expect(Array.isArray(item.tags)).toBe(true);
    });
  });

  it("should have knowledge items for each category", () => {
    const categoryIds = knowledgeData.categories.map((c) => c.id);
    
    knowledgeData.knowledge.forEach((item) => {
      expect(categoryIds).toContain(item.category);
    });
  });

  it("should have at least one item per category", () => {
    const categoryIds = knowledgeData.categories.map((c) => c.id);
    
    categoryIds.forEach((categoryId) => {
      const itemsInCategory = knowledgeData.knowledge.filter(
        (item) => item.category === categoryId
      );
      expect(itemsInCategory.length).toBeGreaterThan(0);
    });
  });

  it("should have 22 total knowledge items", () => {
    expect(knowledgeData.knowledge.length).toBe(22);
  });

  it("should have expected number of items per category", () => {
    const expectedCounts: Record<string, number> = {
      basics: 4,
      techniques: 6,
      oils: 4,
      acupoints: 4,
      "spa-etiquette": 4,
    };

    Object.entries(expectedCounts).forEach(([categoryId, expectedCount]) => {
      const items = knowledgeData.knowledge.filter(
        (item) => item.category === categoryId
      );
      expect(items.length).toBe(expectedCount);
    });
  });

  it("should include all required article IDs", () => {
    const requiredIds = [
      "techniques-005", "techniques-006",
      "oils-003", "oils-004",
      "acupoints-003", "acupoints-004",
    ];
    const existingIds = knowledgeData.knowledge.map((item) => item.id);
    requiredIds.forEach((id) => {
      expect(existingIds).toContain(id);
    });
  });

  it("should have unique knowledge item IDs", () => {
    const ids = knowledgeData.knowledge.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique category IDs", () => {
    const ids = knowledgeData.categories.map((cat) => cat.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid color format for categories", () => {
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    
    knowledgeData.categories.forEach((category) => {
      expect(category.color).toMatch(colorRegex);
    });
  });

  it("should have reading times between 1 and 20 minutes", () => {
    knowledgeData.knowledge.forEach((item) => {
      expect(item.readingTime).toBeGreaterThanOrEqual(1);
      expect(item.readingTime).toBeLessThanOrEqual(20);
    });
  });

  it("should have valid date format for published dates", () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    knowledgeData.knowledge.forEach((item) => {
      expect(item.publishedAt).toMatch(dateRegex);
      const date = new Date(item.publishedAt);
      expect(date.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  it("should have non-empty content for all items", () => {
    knowledgeData.knowledge.forEach((item) => {
      expect(item.content.trim().length).toBeGreaterThan(0);
    });
  });

  it("should have non-empty tags for all items", () => {
    knowledgeData.knowledge.forEach((item) => {
      expect(item.tags.length).toBeGreaterThan(0);
      item.tags.forEach((tag) => {
        expect(tag.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

describe("Search Functionality", () => {
  it("should find items by title", () => {
    const query = "按摩";
    const results = knowledgeData.knowledge.filter((item) =>
      item.title.includes(query)
    );
    expect(results.length).toBeGreaterThan(0);
  });

  it("should find items by description", () => {
    const query = "知识";
    const results = knowledgeData.knowledge.filter((item) =>
      item.description.includes(query)
    );
    expect(results.length).toBeGreaterThan(0);
  });

  it("should find items by tags", () => {
    const query = "基础";
    const results = knowledgeData.knowledge.filter((item) =>
      item.tags.some((tag) => tag.includes(query))
    );
    expect(results.length).toBeGreaterThan(0);
  });

  it("should be case-insensitive", () => {
    const query = "\u6309".toLowerCase();
    const results = knowledgeData.knowledge.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
    expect(results.length).toBeGreaterThan(0);
  });
});

describe("Category Navigation", () => {
  it("should have correct category references", () => {
    const categoryIds = new Set(knowledgeData.categories.map((c) => c.id));
    
    knowledgeData.knowledge.forEach((item) => {
      expect(categoryIds.has(item.category)).toBe(true);
    });
  });

  it("should have all expected category IDs", () => {
    const expectedCategories = [
      "basics",
      "techniques",
      "oils",
      "acupoints",
      "spa-etiquette",
    ];
    const actualCategories = knowledgeData.categories.map((c) => c.id);
    
    expectedCategories.forEach((expected) => {
      expect(actualCategories).toContain(expected);
    });
  });
});

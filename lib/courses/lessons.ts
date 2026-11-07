export type CourseLesson = {
  title: string;
  content?: string;
  url?: string;
};

/** Normalize JSONB / form lesson arrays into a clean ordered list for insert/display. */
export function normalizeLessons(raw: unknown): CourseLesson[] {
  if (!Array.isArray(raw)) return [];

  const lessons: CourseLesson[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) continue;

    const lesson: CourseLesson = { title };
    if (typeof row.content === "string" && row.content.trim()) {
      lesson.content = row.content.trim();
    }
    const urlCandidate =
      typeof row.url === "string" && row.url.trim()
        ? row.url.trim()
        : typeof row.video_url === "string" && row.video_url.trim()
          ? row.video_url.trim()
          : "";
    if (urlCandidate) lesson.url = urlCandidate;
    lessons.push(lesson);
  }
  return lessons;
}

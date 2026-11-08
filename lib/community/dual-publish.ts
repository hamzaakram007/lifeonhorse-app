/** Marker embedded in community_posts.content for Journal dual-publish stubs (001 schema). */
export const COMMUNITY_SHARE_MARKER = "⟦loh-share⟧";

export type CommunityShareMeta = {
  body: string;
  blogPostId: string | null;
  clubId: string | null;
  clubName: string | null;
};

/** Build a community story body + machine-readable footer for blog/club cross-links. */
export function buildCommunityShareContent(opts: {
  body: string;
  excerpt?: string | null;
  blogPostId: string;
  clubId: string;
  clubName: string;
}): string {
  const source = (opts.excerpt?.trim() || opts.body.trim() || "").slice(0, 1200);
  const body = source || opts.clubName;
  return [
    body,
    "",
    COMMUNITY_SHARE_MARKER,
    `blog:${opts.blogPostId}`,
    `club:${opts.clubId}`,
    `club_name:${opts.clubName}`,
  ].join("\n");
}

/** Split human-readable body from dual-publish footer metadata. */
export function parseCommunityShareMeta(content: string | null | undefined): CommunityShareMeta {
  const raw = content ?? "";
  const idx = raw.indexOf(COMMUNITY_SHARE_MARKER);
  if (idx < 0) {
    return { body: raw, blogPostId: null, clubId: null, clubName: null };
  }

  const body = raw.slice(0, idx).trimEnd();
  const footer = raw.slice(idx + COMMUNITY_SHARE_MARKER.length);
  const blogPostId = footer.match(/^\s*blog:([0-9a-f-]{36})\s*$/im)?.[1] ?? null;
  const clubId = footer.match(/^\s*club:([0-9a-f-]{36})\s*$/im)?.[1] ?? null;
  const clubNameMatch = footer.match(/^\s*club_name:(.+)\s*$/im);
  const clubName = clubNameMatch?.[1]?.trim() || null;

  return { body, blogPostId, clubId, clubName };
}

export type CommunityDualPublishInsert = {
  author_id: string;
  title: string;
  content: string;
  photos: string[];
  status: "published";
};

const PLACEHOLDER_HOST = "via.placeholder.com";

function getPlaceholderText(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== PLACEHOLDER_HOST) return "";
    return (parsed.searchParams.get("text") || "").toLowerCase();
  } catch {
    return "";
  }
}

function isPlaceholderUrl(url: string): boolean {
  try {
    return new URL(url).hostname === PLACEHOLDER_HOST;
  } catch {
    return false;
  }
}

function initials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLowerCase();
}

export function resolveTestimonialImage(image: string, author: string): string {
  if (!isPlaceholderUrl(image)) return image;

  const key = getPlaceholderText(image) || initials(author);
  const map: Record<string, string> = {
    sc: "/testimonial-sc.svg",
    jo: "/testimonial-jo.svg",
    ps: "/testimonial-ps.svg",
  };

  return map[key] || "/testimonial-sc.svg";
}

export function resolveProjectImage(image: string, slug: string): string {
  if (!isPlaceholderUrl(image)) return image;

  const text = getPlaceholderText(image);
  const matched = text.match(/project\+?(\d+)/i);
  const numberFromText = matched?.[1];
  const numberFromSlug = slug.match(/(\d+)$/)?.[1];
  const projectNumber = numberFromText || numberFromSlug || "1";

  return `/project-${projectNumber}.svg`;
}

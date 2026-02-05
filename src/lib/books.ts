export type BookEntry = {
  id: string;
  filename: string;
  title: string;
};

export async function fetchBookList(): Promise<BookEntry[]> {
  const res = await fetch("/books/manifest.json");
  if (!res.ok) throw new Error("Failed to load book list");
  const filenames: string[] = await res.json();
  return filenames.map((filename) => {
    const id = filename.replace(/\.md$/i, "");
    const title = id.replace(/^\d+-/, "").replace(/-/g, " ") || id;
    return { id, filename, title };
  });
}

export async function fetchBookContent(slug: string): Promise<string> {
  const res = await fetch(`/books/${slug}.md`);
  if (!res.ok) throw new Error("Failed to load book");
  return res.text();
}

import { getFilename } from "./utils";

export function download(url: string, name?: string) {
  name = name || getFilename(url);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadFromExternalUrl(url: string, name?: string) {
  name = name || getFilename(url);

  await fetch(url)
    .then((r) => r.blob())
    .then((b) => {
      const url = URL.createObjectURL(b);

      download(url, name);
    });
}

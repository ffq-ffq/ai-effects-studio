import type { SupabaseClient } from "@supabase/supabase-js";

type MirrorAssetArgs = {
  supabase: SupabaseClient;
  bucket: string;
  sourceUrl?: string;
  path: string;
  contentType?: string;
  transform?: (input: Buffer) => Promise<{
    buffer: Buffer;
    contentType?: string;
  }>;
};

export async function mirrorRemoteAssetToStorage({
  supabase,
  bucket,
  sourceUrl,
  path,
  contentType = "application/octet-stream",
  transform,
}: MirrorAssetArgs) {
  if (!sourceUrl) {
    return { ok: true, publicUrl: undefined } as const;
  }

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    return {
      ok: false,
      error: `Generated asset download failed: ${response.status}`,
    } as const;
  }

  const downloaded = Buffer.from(await response.arrayBuffer());
  const transformed = transform ? await transform(downloaded) : null;
  const body = transformed?.buffer ?? downloaded;
  const uploadContentType = transformed?.contentType ?? contentType;
  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType: uploadContentType,
    upsert: true,
  });

  if (error) {
    return { ok: false, error: error.message } as const;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return { ok: true, publicUrl: data.publicUrl } as const;
}

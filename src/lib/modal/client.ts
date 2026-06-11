type ModalRequestOptions = {
  path: string;
  body?: unknown;
};

function getModalEndpoint(path: string) {
  const workspace = process.env.MODAL_WORKSPACE;

  if (!workspace) {
    return null;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = workspace.startsWith("http")
    ? workspace.replace(/\/$/, "")
    : `https://${workspace}.modal.run`;

  return `${baseUrl}${normalizedPath}`;
}

export async function callModalApi<T>({ path, body }: ModalRequestOptions) {
  const endpoint = getModalEndpoint(path);
  const apiKey = process.env.MODAL_API_KEY;

  if (!endpoint || !apiKey) {
    return {
      ok: false,
      error: "MODAL_API_KEY and MODAL_WORKSPACE are not configured",
    } as const;
  }

  const response = await fetch(endpoint, {
    method: body ? "POST" : "GET",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      error: `Modal API failed with ${response.status}`,
    } as const;
  }

  return {
    ok: true,
    data: (await response.json()) as T,
  } as const;
}

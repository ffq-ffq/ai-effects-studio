import sharp from "sharp";

type PlanType = "free" | "lite" | "standard" | "pro" | "admin";

type WatermarkOptions = {
  planType: PlanType;
  brandLogoUrl?: string | null;
};

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function createTextWatermark(input: Buffer, text = "AI Effects Studio") {
  const metadata = await sharp(input).metadata();
  const width = Math.max(320, metadata.width ?? 1024);
  const height = Math.max(240, metadata.height ?? 1024);
  const fontSize = Math.max(22, Math.round(width * 0.036));
  const padding = Math.max(24, Math.round(width * 0.035));
  const watermarkWidth = Math.min(width, Math.round(width * 0.46));
  const watermarkHeight = Math.max(72, Math.round(fontSize * 2.2));
  const safeText = escapeSvgText(text);
  const svg = Buffer.from(`
    <svg width="${watermarkWidth}" height="${watermarkHeight}" viewBox="0 0 ${watermarkWidth} ${watermarkHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${watermarkWidth}" height="${watermarkHeight}" rx="${Math.round(watermarkHeight / 2)}" fill="rgba(0,0,0,0.24)" />
      <text x="${Math.round(watermarkWidth / 2)}" y="${Math.round(watermarkHeight / 2 + fontSize * 0.36)}" text-anchor="middle" font-size="${fontSize}" fill="rgba(255,255,255,0.68)" font-family="Arial, sans-serif" font-weight="700">${safeText}</text>
    </svg>
  `);

  return sharp(input)
    .composite([
      {
        input: svg,
        left: width - watermarkWidth - padding,
        top: height - watermarkHeight - padding,
      },
    ])
    .png()
    .toBuffer();
}

async function fetchLogoBuffer(brandLogoUrl: string) {
  const response = await fetch(brandLogoUrl);

  if (!response.ok) {
    throw new Error(`Logo download failed: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function createLogoWatermark(input: Buffer, brandLogoUrl: string) {
  const metadata = await sharp(input).metadata();
  const width = Math.max(320, metadata.width ?? 1024);
  const height = Math.max(240, metadata.height ?? 1024);
  const logoMaxWidth = Math.min(220, Math.round(width * 0.18));
  const padding = Math.max(24, Math.round(width * 0.035));
  const logoBuffer = await fetchLogoBuffer(brandLogoUrl);
  const normalizedLogo = await sharp(logoBuffer)
    .resize({
      width: logoMaxWidth,
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();
  const logoMetadata = await sharp(normalizedLogo).metadata();
  const logoWidth = logoMetadata.width ?? logoMaxWidth;
  const logoHeight = logoMetadata.height ?? logoMaxWidth;

  return sharp(input)
    .composite([
      {
        input: normalizedLogo,
        left: Math.max(padding, width - logoWidth - padding),
        top: Math.max(padding, height - logoHeight - padding),
      },
    ])
    .png()
    .toBuffer();
}

export async function addWatermark(input: Buffer, text = "AI Effects Studio") {
  return createTextWatermark(input, text);
}

export async function applyServerWatermark(input: Buffer, options: WatermarkOptions) {
  if (options.planType === "free") {
    return createTextWatermark(input);
  }

  if ((options.planType === "pro" || options.planType === "admin") && options.brandLogoUrl) {
    return createLogoWatermark(input, options.brandLogoUrl);
  }

  return sharp(input).png().toBuffer();
}

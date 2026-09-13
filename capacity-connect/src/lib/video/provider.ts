export type VideoAsset = {
  src: string;
  poster?: string;
  provider: string;
  durationSeconds?: number;
};

export interface VideoProvider {
  name: string;
  resolve(reference: string): VideoAsset;
}

class UrlVideoProvider implements VideoProvider {
  name = "url";

  resolve(reference: string): VideoAsset {
    return { src: reference, provider: this.name };
  }
}

class CloudinaryVideoProvider implements VideoProvider {
  name = "cloudinary";

  resolve(reference: string): VideoAsset {
    if (reference.startsWith("http")) {
      return { src: reference, provider: this.name };
    }
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloud) {
      return { src: reference, provider: this.name };
    }
    return {
      src: `https://res.cloudinary.com/${cloud}/video/upload/${reference}`,
      provider: this.name,
    };
  }
}

class MuxVideoProvider implements VideoProvider {
  name = "mux";

  resolve(reference: string): VideoAsset {
    if (reference.startsWith("http")) {
      return { src: reference, provider: this.name };
    }
    return {
      src: `https://stream.mux.com/${reference}.m3u8`,
      provider: this.name,
    };
  }
}

export function getVideoProvider(): VideoProvider {
  const provider = process.env.VIDEO_PROVIDER || "url";
  if (provider === "cloudinary") return new CloudinaryVideoProvider();
  if (provider === "mux") return new MuxVideoProvider();
  return new UrlVideoProvider();
}

export function resolveLessonVideo(videoUrl: string): VideoAsset | null {
  if (!videoUrl) return null;
  return getVideoProvider().resolve(videoUrl);
}

export const SAMPLE_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

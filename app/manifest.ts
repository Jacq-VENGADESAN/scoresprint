import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aptileo",
    short_name: "Aptileo",
    description: "Préparation adaptative à l’anglais professionnel.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f3",
    theme_color: "#3157d5",
    lang: "fr"
  };
}

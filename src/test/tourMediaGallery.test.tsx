import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TourMediaGallery } from "@/components/TourMediaGallery";

describe("TourMediaGallery", () => {
  it("allows visitors to navigate through four photos and two videos", () => {
    const images = ["/foto-1.jpg", "/foto-2.jpg", "/foto-3.jpg", "/foto-4.jpg"];
    const videos = ["/video-1.mp4", "/video-2.mp4"];

    render(<TourMediaGallery images={images} videos={videos} alt="Passeio de escuna" />);

    expect(screen.getByRole("button", { name: "Ir para foto 4" })).toBeInTheDocument();
    const videoOne = screen.getByRole("button", { name: "Ir para vídeo 1" });
    const videoTwo = screen.getByRole("button", { name: "Ir para vídeo 2" });
    expect(screen.getByLabelText("Passeio de escuna — vídeo 1")).toHaveAttribute("src", "/video-1.mp4");
    expect(screen.getByLabelText("Passeio de escuna — vídeo 2")).toHaveAttribute("src", "/video-2.mp4");

    fireEvent.click(videoTwo);
    expect(videoTwo).toHaveAttribute("aria-current", "true");
    expect(videoOne).not.toHaveAttribute("aria-current", "true");
  });

  it("translates navigation labels for the selected language", () => {
    render(<TourMediaGallery images={["/foto-1.jpg", "/foto-2.jpg"]} alt="Schooner tour" lang="en" />);

    expect(screen.getByRole("button", { name: "Next media" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to photo 2" })).toBeInTheDocument();
  });
});

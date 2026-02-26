import React from "react";
import { render, screen } from "@testing-library/react";
import CTABanner from "./CTABanner";

describe("CTABanner", () => {
    it("renders headline, subheadline, and button", () => {
        render(<CTABanner />);
        expect(
            screen.getByText(/Ready to Transform Your Logistics\?/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Start Tracking Today/i)
        ).toBeInTheDocument();
    });
});

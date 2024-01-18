"use client";
import * as React from "react";

export function Navbar() {
  return (
    <div className="flex">
      <a href="/" title="Go to homepage">
        <img
          style={{ width: "100px" }}
          src="https://www.eea.europa.eu/en/newsroom/branding-materials/eea_logo_compact_en-1.svg/@@images/image-1-ec9ee8fd8059f5a2418196bfdee570e2.svg"
        />
      </a>
      <small>EEA chat lab - Beta</small>
    </div>
  );
}

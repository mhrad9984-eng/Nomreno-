"use client";

import dynamic from "next/dynamic";

const Namrino = dynamic(() => import("../components/Namrino"), { ssr: false });

export default function Page() {
  return <Namrino />;
    }

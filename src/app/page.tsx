'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function app() {
  const router = useRouter();

  useEffect(() => {
    router.push("/Customer");
  }, [router]);

  return (
    <></>
  );
}

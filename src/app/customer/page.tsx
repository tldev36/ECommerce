'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Customer() {
  const router = useRouter();

  useEffect(() => {
    router.push('/customer/home');
  }, [router]);

  return null; // hoặc <></> không cần div thừa
}

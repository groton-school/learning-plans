'use client';

import { useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';

export function Bootstrap() {
  useEffect(() => {
    import('bootstrap');
  }, []);
  return null;
}

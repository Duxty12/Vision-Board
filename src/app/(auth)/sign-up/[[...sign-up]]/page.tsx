import { Pin } from 'lucide-react';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 gap-6"
      style={{
        background: 'linear-gradient(135deg, #fdf8f0 0%, #faefd8 50%, #fdf4ff 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #bae6fd, #e0c3fc)' }}
        />
        <div
          className="absolute bottom-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #b7f0d4, #fef9c3)' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sticky group-hover:scale-110 transition-transform duration-200"
            style={{ background: 'linear-gradient(135deg, #c07423, #e4a94a)' }}
          >
            <Pin size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-stone-800">StillBoard</span>
        </Link>

        {/* Clerk Sign-up component */}
        <SignUp />
      </div>
    </div>
  );
}

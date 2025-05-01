'use client'

import LoginCard from "@/app/login/LoginCard";
export const dynamic = 'force-dynamic'

export default function Login() {
  return (
      <div className="flex w-full items-center justify-center p-6 md:p-10 pt-0 bg-repeat min-h-[90vh]">
          <LoginCard/>
      </div>
  )
}


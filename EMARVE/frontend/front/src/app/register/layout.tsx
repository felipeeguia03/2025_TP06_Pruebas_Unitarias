import React from "react";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-hidden">
        {children}
        </div>
    </div>
  );
}
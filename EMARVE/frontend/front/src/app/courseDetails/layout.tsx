import React from "react";

export default function CourseDetailsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <div className="flex-grow overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

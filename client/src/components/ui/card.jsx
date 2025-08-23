import React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={
        "rounded-lg border border-gray-200 bg-white shadow-sm " + className
      }
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={"p-6 " + className} {...props}>
      {children}
    </div>
  );
}

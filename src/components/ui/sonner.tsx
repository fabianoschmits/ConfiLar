"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-black",
          description: "text-black font-bold",
          actionButton: "bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black uppercase",
          cancelButton: "bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black uppercase",
          closeButton: "bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all",
          success: "bg-green-500 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white font-black uppercase",
          error: "bg-red-500 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white font-black uppercase",
          warning: "bg-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black font-black uppercase",
          info: "bg-blue-500 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white font-black uppercase",
        }
      }}
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "black",
          "--normal-border": "black",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

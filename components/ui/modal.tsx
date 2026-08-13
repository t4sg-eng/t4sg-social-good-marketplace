"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  // Allows to close on escape keyboard event
  useEffect(() => {
    // create an escape function that listens for e=keyboard events to check if the keyboardevent's key is escape then run the onClose function to close
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(); // if key is escape, close
    };
    if (open) {
      document.addEventListener("keydown", handleEsc); // run this function when open; every time a keydown event occurs, run handleEsc
      document.body.style.overflow = "hidden"; // when open disable scrolling on a webpage by hiding the scrollbars on the document's body
    }
    // clean up
    return () => {
      document.removeEventListener("keydown", handleEsc); // remove the eventlistener
      document.body.style.overflow = ""; //remove the disable scrolling by resetting to empty string
    };
  }, [open, onClose]); // note to self whenever open and onClose changes useEffect runs since open,onClose are part of dependency array

  return (
    <div
      onClick={onClose} // Allow the div, which is the background to close on click (closes the modal)
      className={`fixed inset-0 z-50 flex items-center justify-center transition-colors ${
        open ? "visible bg-black/50" : "invisible" //if open, make it visible with dim background, if open is false, make it disappear, "invisible"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()} // Make the children and thing inside background unclickable
        className={`relative mx-4 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-xl transition-all dark:bg-secondary dark:text-secondary-foreground ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0" // Use opacity and scale to make the modal have transition animation
        }`}
      >
        <button
          onClick={onClose} // on close X button
          className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 pt-10">
          {children}
        </div>
      </div>
    </div>
  );
}

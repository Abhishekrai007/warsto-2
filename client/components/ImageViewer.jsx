import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

const ImageViewer = ({ image, onClose }) => {
  return (
    <Dialog open={!!image} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-4 flex items-center justify-center bg-black bg-opacity-80">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        >
          <X className="h-6 w-6 text-black" />
          <span className="sr-only">Close</span>
        </button>
        <img
          src={`http://localhost:5000/${image.url}`}
          alt={image.caption || "Full size image"}
          className="max-w-full max-h-[80vh] object-contain"
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;

"use client";
import React, { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Camera, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { FileWithPath, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isImageSearchActive, setIsImageSearchActive] =
    useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null
  );
  const [searchImage, setSearchImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const router = useRouter();
  const handleTextSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    router.push(`/cars?search=${encodeURIComponent(searchTerm)}`);
  };
  const handleImageSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchImage) {
      toast.error("Please upload an image first");
      return;
    }
  };
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Invalid image type");
        return;
      }
      setIsUploading(true);
      setSearchImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setIsUploading(false);
        toast.success("Image uploaded successfully");
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Failed to read the image");
      };
      reader.readAsDataURL(file);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg"],
      },
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024,
    });
  return (
    <div>
      <form onSubmit={handleTextSearch}>
        <div className="relative flex items-center">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a car, Enter make, model or use our AI image search"
            className="pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm"
          />
          <div className="absolute right-[100px]">
            <Camera
              size={35}
              onClick={() => setIsImageSearchActive(!isImageSearchActive)}
              className="cursor-pointer rounded-xl p-1.5"
              style={{
                background: isImageSearchActive ? "black" : "",
                color: isImageSearchActive ? "white" : "",
              }}
            />
          </div>
          <Button type="submit" className="absolute right-2 rounded-full">
            Search
          </Button>
        </div>
      </form>
      {isImageSearchActive && (
        <div className="mt-4">
          <form onSubmit={handleImageSearch}>
            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <Image
                    src={imagePreview as string}
                    alt="Car Preview"
                    width={300}
                    height={300}
                    objectFit="contain"
                  />
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchImage(null);
                      setImagePreview("");
                      toast.info("Image removed");
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-2">
                      {isDragActive && !isDragReject
                        ? "Leave the file here to upload"
                        : "Drag & drop a car image or click to select"}
                    </p>
                    {isDragReject && (
                      <p className="text-red-500 mb-2">Invalid image type</p>
                    )}
                    <p className="text-gray-400 text-sm">
                      Supports: JPG, PNG (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            {imagePreview && (
              <Button
                type="submit"
                variant="outline"
                className="w-full mt-2"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Search with this Image"}
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeSearch;

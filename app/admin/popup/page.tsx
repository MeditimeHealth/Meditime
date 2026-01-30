"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";

interface PopupFormData {
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
}

export default function PopupManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PopupFormData>();
  
  const imageUrl = watch("imageUrl");
  const isActive = watch("isActive");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setValue("imageUrl", data.data.url);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const response = await fetch("/api/popup");
        const data = await response.json();
        
        if (data.success && data.popup) {
          reset(data.popup);
        }
      } catch (error) {
        console.error("Error fetching popup settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchPopup();
  }, [reset]);

  const onSubmit = async (data: PopupFormData) => {
    setSaving(true);
    try {
      const response = await fetch("/api/popup", {
        method: "POST", // Using POST as UPSERT (update if exists, create if not)
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Popup settings updated successfully!");
        reset(result.popup);
      } else {
        throw new Error(result.error || "Failed to update");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Popup Manager</h1>
      
      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <Label htmlFor="isActive" className="text-base font-semibold">Enable Popup</Label>
              <p className="text-sm text-gray-500">Toggle to show or hide the popup on the website</p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Popup Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="e.g. Special Offer!"
                  className="mt-1.5"
                />
                {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description", { required: "Description is required" })}
                  placeholder="Enter content text..."
                  className="mt-1.5 h-32"
                />
                {errors.description && <span className="text-sm text-red-500">{errors.description.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    {...register("buttonText")}
                    placeholder="e.g. Learn More"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input
                    id="buttonLink"
                    {...register("buttonLink")}
                    placeholder="e.g. /services"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>



            <div className="space-y-4">
              <Label>Popup Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative min-h-[300px]">
                {imageUrl ? (
                  <div className="relative w-full h-full min-h-[300px]">
                    <Image
                      src={imageUrl}
                      alt="Popup Preview"
                      fill
                      className="object-contain rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setValue("imageUrl", "")}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    <div className="mx-auto p-4 bg-blue-50 text-blue-500 rounded-full inline-block">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Upload Image</h3>
                      <p className="text-sm text-gray-500 mb-4">Click below to upload via ImgBB</p>
                      
                      <div className="max-w-xs mx-auto">
                         <Label htmlFor="image-upload" className="cursor-pointer">
                           <div className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md shadow-sm transition-all">
                             {uploading ? (
                               <>
                                 <Loader2 className="h-4 w-4 animate-spin" />
                                 Uploading...
                               </>
                             ) : (
                               <>
                                 <Upload className="h-4 w-4" />
                                 Choose File
                               </>
                             )}
                           </div>
                           <input 
                             id="image-upload" 
                             type="file" 
                             accept="image/*" 
                             className="hidden" 
                             onChange={handleImageUpload}
                             disabled={uploading}
                           />
                         </Label>
                      </div>
                      <input type="hidden" {...register("imageUrl", { required: "Image is required" })} />

                      {errors.imageUrl && <span className="text-sm text-red-500 mt-2 block">{errors.imageUrl.message}</span>}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 text-center">
                Supported formats: JPG, PNG, GIF. Max size: 32MB.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <Button type="submit" size="lg" disabled={saving} className="bg-primary hover:bg-primary-dark min-w-[150px]">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

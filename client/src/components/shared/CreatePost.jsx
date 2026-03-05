import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCreatePost } from "@/hooks/usePosts";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";
import toast from "react-hot-toast";

const MAX_CHARS = 280;

const CreatePost = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const createPost = useCreatePost();

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const isEmpty = content.trim().length === 0 && !imageUrl;

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);
    try {
      const { data } = await api.post("/upload/post-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(data.data.url);
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (isEmpty || isOverLimit) return;

    createPost.mutate(
      { content: content.trim(), imageUrl },
      {
        onSuccess: () => {
          setContent("");
          setImageUrl(null);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <div className="border-b border-border px-4 py-3">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback>
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <textarea
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-lg min-h-[80px]"
            placeholder="What is happening?!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CHARS + 10}
          />

          {/* Image preview */}
          {imageUrl && (
            <div className="relative mt-2 rounded-2xl overflow-hidden border border-border">
              <img
                src={imageUrl}
                alt="Upload preview"
                className="w-full max-h-72 object-cover"
              />
              <button
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80 transition-colors"
                onClick={() => setImageUrl(null)}
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              {/* Image upload button */}
              <button
                className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Character counter */}
              {content.length > 0 && (
                <span
                  className={`text-sm ${
                    isOverLimit
                      ? "text-destructive font-semibold"
                      : charsLeft <= 20
                      ? "text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {charsLeft}
                </span>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isEmpty || isOverLimit || createPost.isPending || isUploading}
                size="sm"
                className="rounded-full px-5 font-bold"
              >
                {createPost.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
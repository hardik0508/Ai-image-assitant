
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageDisplay } from './components/ImageDisplay';
import { CaptionDisplay } from './components/CaptionDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SocialPostDisplay } from './components/SocialPostDisplay'; // New component
import { generateCaptionFromImage, generateSocialMediaPostFromImage } from './services/geminiService'; // New service function

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const App: React.FC = () => {
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  
  const [caption, setCaption] = useState<string | null>(null);
  const [isLoadingCaption, setIsLoadingCaption] = useState<boolean>(false);
  const [errorCaption, setErrorCaption] = useState<string | null>(null);

  const [socialPost, setSocialPost] = useState<string | null>(null);
  const [isLoadingSocialPost, setIsLoadingSocialPost] = useState<boolean>(false);
  const [errorSocialPost, setErrorSocialPost] = useState<string | null>(null);

  const isGenerating = isLoadingCaption || isLoadingSocialPost;

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImageFile(file);
    setSelectedImageUrl(URL.createObjectURL(file));
    setCaption(null);
    setErrorCaption(null);
    setSocialPost(null);
    setErrorSocialPost(null);
  }, []);

  const handleGenerateCaption = useCallback(async () => {
    if (!selectedImageFile) {
      setErrorCaption("Please select an image first.");
      return;
    }

    setIsLoadingCaption(true);
    setErrorCaption(null);
    setCaption(null);

    try {
      const base64ImageData = await fileToBase64(selectedImageFile);
      const mimeType = selectedImageFile.type;
      const generatedCaption = await generateCaptionFromImage(base64ImageData, mimeType);
      setCaption(generatedCaption);
    } catch (err) {
      console.error("Caption generation failed:", err);
      if (err instanceof Error) {
        setErrorCaption(err.message);
      } else {
        setErrorCaption("An unknown error occurred while generating the caption.");
      }
    } finally {
      setIsLoadingCaption(false);
    }
  }, [selectedImageFile]);

  const handleGenerateSocialPost = useCallback(async () => {
    if (!selectedImageFile) {
      setErrorSocialPost("Please select an image first.");
      return;
    }

    setIsLoadingSocialPost(true);
    setErrorSocialPost(null);
    setSocialPost(null);

    try {
      const base64ImageData = await fileToBase64(selectedImageFile);
      const mimeType = selectedImageFile.type;
      const generatedPost = await generateSocialMediaPostFromImage(base64ImageData, mimeType);
      setSocialPost(generatedPost);
    } catch (err) {
      console.error("Social post generation failed:", err);
      if (err instanceof Error) {
        setErrorSocialPost(err.message);
      } else {
        setErrorSocialPost("An unknown error occurred while generating the social post.");
      }
    } finally {
      setIsLoadingSocialPost(false);
    }
  }, [selectedImageFile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white flex flex-col items-center p-4 sm:p-8 selection:bg-primary-500 selection:text-white">
      <header className="w-full max-w-3xl text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-pink-500 py-2">
          AI Image Assistant
        </h1>
        <p className="mt-2 text-lg text-slate-300">
          Upload an image to generate insightful overviews and engaging social media posts.
        </p>
      </header>

      <main className="w-full max-w-3xl bg-slate-800 shadow-2xl rounded-xl p-6 sm:p-8 space-y-6">
        <ImageUploader onImageSelect={handleImageSelect} disabled={isGenerating} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <ImageDisplay imageUrl={selectedImageUrl} />
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold text-primary-300 border-b border-slate-700 pb-2 mb-2">Image Overview</h2>
            {errorCaption && (
              <div className="bg-red-500/20 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm" role="alert">
                <strong className="font-bold">Error: </strong>
                <span>{errorCaption}</span>
              </div>
            )}
            <button
              onClick={handleGenerateCaption}
              disabled={!selectedImageFile || isGenerating}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 flex items-center justify-center disabled:cursor-not-allowed"
              aria-label="Generate descriptive caption for the image"
            >
              {isLoadingCaption ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Generating Overview...</span>
                </>
              ) : (
                "Generate Overview Caption"
              )}
            </button>
            <CaptionDisplay caption={caption} isLoading={isLoadingCaption} />
          </div>
        </div>

        {/* New Social Media Post Section */}
        <div className="pt-6 border-t border-slate-700 space-y-4">
            <h2 className="text-xl font-semibold text-primary-300 border-b border-slate-700 pb-2 mb-2">Social Media Post</h2>
            {errorSocialPost && (
              <div className="bg-red-500/20 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm" role="alert">
                <strong className="font-bold">Error: </strong>
                <span>{errorSocialPost}</span>
              </div>
            )}
            <button
              onClick={handleGenerateSocialPost}
              disabled={!selectedImageFile || isGenerating}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75 flex items-center justify-center disabled:cursor-not-allowed"
              aria-label="Generate social media post for the image"
            >
              {isLoadingSocialPost ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Generating Post...</span>
                </>
              ) : (
                "Generate Social Post"
              )}
            </button>
            <SocialPostDisplay post={socialPost} isLoading={isLoadingSocialPost} />
        </div>
      </main>

      <footer className="w-full max-w-3xl text-center mt-12 text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Image Assistant. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;

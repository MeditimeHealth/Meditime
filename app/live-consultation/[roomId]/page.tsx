"use client";

import { useState, useEffect, use } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams } from "next/navigation";
import { Video, Clock, Users, ArrowLeft, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default function VideoRoomPage({ params }: PageProps) {
  const { roomId } = use(params);
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("name") || "Patient";
  const queuePosition = parseInt(searchParams.get("position") || "1");
  const estimatedWait = parseInt(searchParams.get("wait") || "15");

  const [isInCall, setIsInCall] = useState(false);
  const [waitTimer, setWaitTimer] = useState(0);

  // Wait timer
  useEffect(() => {
    if (!isInCall) {
      const interval = setInterval(() => {
        setWaitTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isInCall]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const joinJitsiCall = () => {
    setIsInCall(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/live-consultation"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">
              {language === "bn" ? "ফিরে যান" : "Back"}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-sm text-green-400 font-medium">
              {language === "bn" ? "লাইভ কনসালটেশন" : "Live Consultation"}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Room: {roomId}
          </div>
        </div>
      </header>

      {!isInCall ? (
        /* Waiting Room */
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] p-4">
          <div className="max-w-lg w-full text-center space-y-8">
            {/* Animated Waiting Icon */}
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-pulse" />
              <div className="absolute inset-3 rounded-full border-4 border-teal-500/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
              <div className="absolute inset-6 rounded-full bg-teal-500/10 flex items-center justify-center">
                <Clock className="h-12 w-12 text-teal-400 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {language === "bn" ? "অনুগ্রহ করে অপেক্ষা করুন..." : "Please wait..."}
              </h2>
              <p className="text-gray-400">
                {language === "bn"
                  ? "আপনার পালা এলে ডাক্তার আপনাকে গ্রহণ করবেন"
                  : "The doctor will accept you when it's your turn"}
              </p>
            </div>

            {/* Queue Info Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-800 rounded-xl p-4">
                <Users className="h-5 w-5 text-orange-400 mx-auto mb-2" />
                <p className="text-xl font-bold">{queuePosition}</p>
                <p className="text-xs text-gray-500">{language === "bn" ? "অবস্থান" : "Position"}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <Clock className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                <p className="text-xl font-bold">~{estimatedWait}m</p>
                <p className="text-xs text-gray-500">{language === "bn" ? "আনুমানিক" : "Est. Wait"}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <Video className="h-5 w-5 text-teal-400 mx-auto mb-2" />
                <p className="text-xl font-bold font-mono">{formatTime(waitTimer)}</p>
                <p className="text-xs text-gray-500">{language === "bn" ? "সময়" : "Elapsed"}</p>
              </div>
            </div>

            {/* Join Call Button */}
            <button
              onClick={joinJitsiCall}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-lg hover:from-teal-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Video className="h-6 w-6" />
              {language === "bn" ? "ভিডিও কলে যোগ দিন" : "Join Video Call Now"}
            </button>

            <p className="text-xs text-gray-500">
              {language === "bn"
                ? "ভিডিও কলে যোগ দিলে Jitsi Meet ব্যবহৃত হবে। ক্যামেরা এবং মাইক্রোফোন প্রয়োজন হবে।"
                : "Video calls use Jitsi Meet. Camera and microphone access will be required."}
            </p>
          </div>
        </div>
      ) : (
        /* Jitsi Video Call */
        <div className="h-[calc(100vh-60px)] relative">
          <iframe
            src={`https://meet.jit.si/${roomId}#userInfo.displayName="${encodeURIComponent(patientName)}"&config.prejoinConfig.enabled=false&config.startWithVideoMuted=false&config.startWithAudioMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`}
            allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
            className="w-full h-full border-0"
            title="Meditime Live Consultation"
          />

          {/* Floating Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
            <Link
              href="/live-consultation"
              className="px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 shadow-lg transition flex items-center gap-2"
            >
              <Phone className="h-4 w-4 rotate-[135deg]" />
              {language === "bn" ? "কল শেষ করুন" : "End Call"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

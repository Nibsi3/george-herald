"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import type { Article } from "@/lib/types";

interface MostReadAdRotatorProps {
  articles: Article[];
}

const PROFILES = [
  {
    name: "SunshineGR",
    age: 45,
    gender: "woman",
    seeking: "men",
    range: "38 and 55",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face",
  },
  {
    name: "GardenRoute_Guy",
    age: 52,
    gender: "man",
    seeking: "women",
    range: "40 and 58",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face",
  },
  {
    name: "CoastalHeart",
    age: 39,
    gender: "woman",
    seeking: "men",
    range: "35 and 50",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face",
  },
  {
    name: "KarooStar",
    age: 47,
    gender: "woman",
    seeking: "men",
    range: "42 and 56",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=face",
  },
  {
    name: "OceanBreeze_M",
    age: 44,
    gender: "man",
    seeking: "women",
    range: "35 and 50",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face",
  },
  {
    name: "WildflowerGal",
    age: 36,
    gender: "woman",
    seeking: "men",
    range: "32 and 48",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face",
  },
  {
    name: "MountainMan_SA",
    age: 50,
    gender: "man",
    seeking: "women",
    range: "40 and 55",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face",
  },
  {
    name: "SeaBreezeHeart",
    age: 41,
    gender: "woman",
    seeking: "men",
    range: "36 and 52",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&h=96&fit=crop&crop=face",
  },
  {
    name: "EdenExplorer",
    age: 48,
    gender: "man",
    seeking: "women",
    range: "38 and 54",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=face",
  },
  {
    name: "CapeDreamer",
    age: 37,
    gender: "woman",
    seeking: "men",
    range: "33 and 47",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop&crop=face",
  },
];

export default function MostReadAdRotator({ articles }: MostReadAdRotatorProps) {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowAd((prev) => !prev);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-white">
      {/* Slide container — both panels use flex-col to fill equal height */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: showAd ? "translateX(-100%)" : "translateX(0)" }}
      >
        {/* Panel 1: Most Read */}
        <div className="w-full shrink-0 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-black text-lg">Most Read</h3>
          </div>
          <div className="space-y-0 flex-1">
            {articles.slice(0, 10).map((article, index) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group flex items-start gap-3 py-3 border-b border-border/50 last:border-0"
              >
                <span className="text-2xl font-black text-primary/20 group-hover:text-primary transition-colors leading-none mt-0.5 min-w-[28px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h4>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {article.viewCount.toLocaleString()} views
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Panel 2: Eden Matchmaker Ad — stretches to fill full height */}
        <div className="w-full shrink-0 flex flex-col">
          <div className="bg-muted/50 text-center py-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Sponsored</span>
          </div>

          <div className="flex-1 flex flex-col justify-between p-5">
            <div>
              {/* Logo / Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <div className="ml-1">
                    <span className="text-lg font-black text-[#8B0000] leading-none">EDEN</span>
                    <span className="text-lg font-light text-foreground/70 leading-none ml-0.5">Matchmaker</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">in association with DatingBuzz</p>

              {/* Tabs */}
              <div className="flex border-b border-border mb-3">
                <a
                  href="https://www.edenmatchmaker.com/s/a/18918"
                  target="_blank"
                  rel="nofollow sponsored"
                  className="flex-1 text-center py-2 text-sm font-bold text-primary border-b-2 border-primary"
                >
                  SEARCH
                </a>
                <span className="flex items-center px-2 text-xs text-muted-foreground font-medium">OR</span>
                <a
                  href="https://www.edenmatchmaker.com/s/a/18918"
                  target="_blank"
                  rel="nofollow sponsored"
                  className="flex-1 text-center py-2 text-sm font-bold text-foreground/60 hover:text-primary transition-colors"
                >
                  PROFILE
                </a>
              </div>

              <p className="text-sm text-center text-foreground/70 mb-3">Find your perfect match now!</p>

              {/* Sample Profiles with real photos */}
              <div className="space-y-3">
                {PROFILES.map((profile) => (
                  <a
                    key={profile.name}
                    href="https://www.edenmatchmaker.com/s/a/18918"
                    target="_blank"
                    rel="nofollow sponsored"
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-muted">
                      <Image
                        src={profile.photo}
                        alt={profile.name}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-snug">{profile.name}</p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        I&apos;m a {profile.age} year old {profile.gender} looking to meet {profile.seeking} between the ages of {profile.range}.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-primary border border-primary rounded px-1.5 py-0.5 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors mt-1">
                      View
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* CTA pinned to bottom */}
            <a
              href="https://www.edenmatchmaker.com/s/a/18918"
              target="_blank"
              rel="nofollow sponsored"
              className="block mt-4 w-full text-center bg-primary hover:bg-primary/90 text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
            >
              View more profiles
            </a>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="flex justify-center gap-2 pb-3">
        <button
          onClick={() => setShowAd(false)}
          className={`h-1.5 rounded-full transition-all ${!showAd ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-primary/40"}`}
          aria-label="Show Most Read"
        />
        <button
          onClick={() => setShowAd(true)}
          className={`h-1.5 rounded-full transition-all ${showAd ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-primary/40"}`}
          aria-label="Show Advertisement"
        />
      </div>
    </div>
  );
}

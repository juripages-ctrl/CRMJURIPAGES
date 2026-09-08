"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"

function Typewriter({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    setDisplayedText("")
    let i = 0
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(intervalId)
      }
    }, 50)
    
    return () => clearInterval(intervalId)
  }, [text])

  return (
    <>
      {displayedText}
      <span className="inline-block w-[2px] h-[1em] bg-[#8b5cf6] ml-[2px] animate-pulse align-middle opacity-80"></span>
    </>
  )
}

export interface FeatureCarouselSectionProps {
  watermarkText: string;
  titlePlain: string;
  titleHighlighted: string;
  description: string;
  slides: { image: string; text: string }[];
  reverse?: boolean;
}

export function FeatureCarouselSection({ 
  watermarkText, 
  titlePlain, 
  titleHighlighted, 
  description, 
  slides, 
  reverse = false 
}: FeatureCarouselSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className={`max-w-[1200px] mx-auto px-4 flex flex-wrap items-center justify-between gap-10 ${reverse ? 'flex-row-reverse' : ''}`}>
        <div className="flex-1 min-w-[320px] relative z-10">
          <div className="services-watermark text-[80px] md:text-[130px] font-['Playfair_Display'] italic font-normal lowercase opacity-5 -left-10 top-1/2 -translate-y-1/2">
            {watermarkText}
          </div>
          <h2 className="font-['Bricolage_Grotesque'] text-4xl md:text-[42px] font-normal text-slate-900 mb-5 leading-[1.2]">
            {titlePlain} <br />
            <strong className="font-['Playfair_Display'] italic text-[#8b5cf6] font-normal">{titleHighlighted}</strong>
          </h2>
          <p className="text-slate-500 text-base leading-[1.6] max-w-[500px]">
            {description}
          </p>
        </div>
        <div className="flex-1 min-w-[320px] relative">
          <div className="relative w-full aspect-video rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] overflow-hidden z-10 bg-slate-50">
            {slides.map((slide, index) => (
              <Image
                key={index}
                src={slide.image}
                alt={slide.text}
                fill
                className={`object-cover transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
          
          {/* Fake Search Input */}
          <div className={`absolute -bottom-6 ${reverse ? 'left-4 md:-left-6' : 'right-4 md:-right-6'} bg-white/95 backdrop-blur-md border border-white shadow-xl rounded-full py-3 px-5 flex items-center gap-3 z-20 hover:scale-105 transition-transform duration-300`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span className="font-['Inter'] text-sm text-slate-700 font-medium whitespace-nowrap min-w-[240px] transition-all duration-300">
              <Typewriter text={slides[currentSlide].text} />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

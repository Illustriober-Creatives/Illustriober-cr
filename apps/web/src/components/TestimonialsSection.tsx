'use client';

import { useState, useEffect } from 'react';
import { Container } from './Container';
import { SectionWrapper } from './SectionWrapper';
import { SectionHeader } from './SectionHeader';
import { TestimonialCard } from './Cards/TestimonialCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * TestimonialsSection - Client testimonials carousel
 * Auto-rotates with manual navigation
 */
const testimonials = [
  {
    quote: 'They delivered our MVP in 6 weeks. The quality was exceptional and the team was incredibly responsive to feedback.',
    author: 'Sarah Chen',
    company: 'TechStartup Inc',
    image: 'https://via.placeholder.com/48?text=SC',
  },
  {
    quote: 'Best decision we made hiring Illustriober. They took our legacy codebase and modernized it beautifully. Highly recommend!',
    author: 'James Omondi',
    company: 'Enterprise Corp',
    image: 'https://via.placeholder.com/48?text=JO',
  },
  {
    quote: 'Professional, reliable, and deeply knowledgeable. They understood our business needs and built a solution that actually works.',
    author: 'Priya Sharma',
    company: 'FinTech Solutions',
    image: 'https://via.placeholder.com/48?text=PS',
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [autoPlay]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setAutoPlay(false); // Stop auto-play when user navigates
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setAutoPlay(false);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    setAutoPlay(false);
  };

  return (
    <SectionWrapper variant="gradient">
      <Container>
        {/* Header */}
        <SectionHeader
          subtitle="Success Stories"
          title="What Our Clients Say"
          align="center"
        />

        {/* Testimonial Carousel */}
        <div className="max-w-2xl mx-auto">
          {/* Current Testimonial */}
          <div className="mb-8">
            <TestimonialCard {...testimonials[currentIndex]} />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-surface-700 rounded-lg transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-brand-500 w-8'
                      : 'bg-surface-600'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={goToNext}
              className="p-2 hover:bg-surface-700 rounded-lg transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Pagination Text */}
          <p className="text-center text-xs text-surface-400 mt-4">
            {currentIndex + 1} / {testimonials.length}
          </p>
        </div>
      </Container>
    </SectionWrapper>
  );
}

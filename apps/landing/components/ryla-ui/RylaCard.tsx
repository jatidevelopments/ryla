"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * RylaCard Component
 * 
 * Base card component with dark background and subtle border.
 * Includes hover effects with purple glow.
 */
interface RylaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  gradient?: boolean;
}

const RylaCard = React.forwardRef<HTMLDivElement, RylaCardProps>(
  ({ className, hover = true, gradient = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl",
          "bg-[var(--bg-elevated)]",
          "border border-[var(--border-default)]",
          "p-8",
          hover && [
            "transition-all duration-200 ease-in-out",
            "hover:border-[var(--border-purple)]",
            "hover:-translate-y-0.5",
            "hover:shadow-lg hover:shadow-[var(--purple-600)]/10",
          ],
          gradient && "gradient-border",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

RylaCard.displayName = "RylaCard";

/**
 * FeatureCard Component
 * 
 * Card for displaying features with icon, title, and description.
 */
interface FeatureCardProps {
  icon?: React.ReactNode;
  image?: string;
  title: string;
  description: string;
  className?: string;
}

function FeatureCard({
  icon,
  image,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <RylaCard className={cn("flex flex-col", className)}>
      {/* Icon or Image */}
      {image ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6 bg-[var(--bg-hover)]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : icon ? (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--purple-600)]/20 to-[var(--pink-500)]/20 flex items-center justify-center mb-6">
          <div className="text-[var(--purple-400)]">{icon}</div>
        </div>
      ) : null}

      {/* Title */}
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </RylaCard>
  );
}

/**
 * TestimonialCard Component
 * 
 * Card for displaying user testimonials with avatar, name, role, and quote.
 */
interface TestimonialCardProps {
  avatar?: string;
  name: string;
  role: string;
  quote: string;
  className?: string;
}

function TestimonialCard({
  avatar,
  name,
  role,
  quote,
  className,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col min-w-[350px] max-w-[400px]",
        "p-6 rounded-xl",
        "bg-transparent",
        "border border-[var(--border-default)]",
        "transition-all duration-200",
        "hover:border-[var(--border-hover)]",
        className
      )}
    >
      {/* Header with avatar and info */}
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--bg-hover)] flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-[var(--purple-400)]">
              {name.charAt(0)}
            </div>
          )}
        </div>

        {/* Name and Role */}
        <div>
          <p className="font-semibold text-[var(--text-primary)]">{name}</p>
          <p className="text-sm text-[var(--text-muted)]">{role}</p>
        </div>
      </div>

      {/* Quote */}
      <blockquote className="text-[var(--text-secondary)] italic leading-relaxed">
        "{quote}"
      </blockquote>
    </div>
  );
}

/**
 * StepCard Component
 * 
 * Card for displaying process steps with number badge.
 */
interface StepCardProps {
  number: number;
  title: string;
  description: string;
  className?: string;
}

function StepCard({ number, title, description, className }: StepCardProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      {/* Number Badge */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--purple-600)] to-[var(--pink-500)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--purple-600)]/25">
        <span className="text-white font-bold text-lg">{number}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] max-w-[200px]">
        {description}
      </p>
    </div>
  );
}

/**
 * StatCard Component
 * 
 * Card for displaying statistics with large numbers.
 */
interface StatCardProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

function StatCard({ children, label, className }: StatCardProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      {/* Large number - rendered by CountUp component */}
      <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
        {children}
      </div>

      {/* Label */}
      <p className="text-[var(--text-muted)] text-sm uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

/**
 * PricingCard Component
 * 
 * Card for displaying pricing tiers with features list.
 */
interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

function PricingCard({
  name,
  price,
  period = "/month",
  description,
  features,
  highlighted = false,
  ctaText = "Start Free Trial",
  onCtaClick,
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col p-8 rounded-2xl",
        "border",
        highlighted
          ? [
              "border-[var(--purple-500)]",
              "bg-gradient-to-b from-[var(--purple-600)]/10 to-transparent",
              "shadow-lg shadow-[var(--purple-600)]/20",
            ]
          : ["border-[var(--border-default)]", "bg-[var(--bg-elevated)]"],
        className
      )}
    >
      {/* Popular Badge */}
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-500)] text-white text-xs font-semibold rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
        {name}
      </h3>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-bold text-[var(--text-primary)]">
          {price}
        </span>
        <span className="text-[var(--text-muted)]">{period}</span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          {description}
        </p>
      )}

      {/* Features List */}
      <ul className="flex-1 space-y-3 mb-8">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-[var(--text-secondary)]"
          >
            <svg
              className="w-5 h-5 text-[var(--purple-400)] flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onCtaClick}
        className={cn(
          "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-150",
          highlighted
            ? [
                "bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-500)]",
                "text-white",
                "hover:shadow-[var(--glow-purple)]",
                "hover:scale-[1.02]",
              ]
            : [
                "bg-transparent",
                "text-white",
                "border border-[var(--border-hover)]",
                "hover:border-[var(--purple-500)]",
                "hover:bg-[var(--purple-500)]/10",
              ]
        )}
      >
        {ctaText}
      </button>
    </div>
  );
}

export {
  RylaCard,
  FeatureCard,
  TestimonialCard,
  StepCard,
  StatCard,
  PricingCard,
};


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Loading from "@/components/Loading";
import type { ComponentProps } from "react";

type CustomLinkProps = ComponentProps<typeof Link>;

export default function TransitionLink({
  href,
  children,
  onClick,
  ...props
}: CustomLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const Global = useTranslations("Global");

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <>
      <Link
        href={href}
        aria-disabled={isLoading}
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          if (isLoading) {
            e.preventDefault();
            return;
          }
          if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
            setIsLoading(true);
          }
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </Link>

      {isLoading && <Loading variant="fullscreen" message={Global("buttons.loading")} />}
    </>
  );
}
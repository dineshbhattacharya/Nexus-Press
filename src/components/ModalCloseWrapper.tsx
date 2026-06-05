"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SubscribeWidget from "./SubscribeWidget";

interface ModalCloseWrapperProps {
  pubId: string;
  pubTitle: string;
  pubLogo: string;
  pubSlug: string;
  isSubscribedInitially: boolean;
  userEmail: string;
}

export default function ModalCloseWrapper({
  pubId,
  pubTitle,
  pubLogo,
  pubSlug,
  isSubscribedInitially,
  userEmail,
}: ModalCloseWrapperProps) {
  const router = useRouter();

  const handleClose = () => {
    router.push(`/p/${pubSlug}`);
  };

  return (
    <SubscribeWidget
      pubId={pubId}
      pubTitle={pubTitle}
      pubLogo={pubLogo}
      pubSlug={pubSlug}
      isSubscribedInitially={isSubscribedInitially}
      userEmail={userEmail}
      openAsModal={true}
      onCloseModal={handleClose}
    />
  );
}

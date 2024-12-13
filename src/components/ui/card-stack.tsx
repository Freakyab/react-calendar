"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Card = {
  id: number;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
  change,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
  change: boolean; // New parameter to trigger card flip
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    if (change) {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards]; // create a copy of the array
        newArray.unshift(newArray.pop()!); // move the last element to the front
        return newArray;
      });
    }
  }, [change]); // Dependency array ensures this runs only when `change` is true

  return (
    <div className="relative h-60 w-60 md:h-60 md:w-96">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="flex flex-col text-lg gap-6 px-8 py-6"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR, // decrease scale for cards that are behind
              zIndex: cards.length - index, // decrease z-index for the cards that are behind
            }}>
            <React.Fragment>{card.content}</React.Fragment>
          </motion.div>
        );
      })}
    </div>
  );
};

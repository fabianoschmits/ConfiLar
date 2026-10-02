"use client";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
export function VirtualFeedList<T extends { id: string }>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const virtual = items.length > 60;
  const list = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => 650,
    overscan: 3,
    scrollMargin: offset,
    enabled: virtual,
    getItemKey: (index) => items[index].id,
  });
  useLayoutEffect(() => {
    const measure = () =>
      setOffset(
        (root.current?.getBoundingClientRect().top || 0) + window.scrollY,
      );
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [virtual]);
  return (
    <div
      ref={root}
      data-testid="feed-list"
      data-virtualized={virtual}
      style={
        virtual
          ? { height: list.getTotalSize(), position: "relative" }
          : undefined
      }
    >
      {virtual
        ? list.getVirtualItems().map((row) => (
            <div
              key={row.key}
              data-index={row.index}
              ref={list.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                paddingBottom: 16,
                transform: `translateY(${row.start - offset}px)`,
              }}
            >
              {renderItem(items[row.index])}
            </div>
          ))
        : items.map((item) => (
            <div
              key={item.id}
              style={{
                marginBottom: 16,
                contentVisibility: "auto",
                containIntrinsicSize: "auto 650px",
              }}
            >
              {renderItem(item)}
            </div>
          ))}
    </div>
  );
}

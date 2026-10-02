"use client";
import { Trash2 } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  DesktopNotificationItem,
  type NotificationItemProps,
} from "./DesktopNotificationItem";
export function MobileNotificationItem(props: NotificationItemProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, -80, 0], [1, 0.5, 0]);
  const scale = useTransform(x, [-100, -80, 0], [1.2, 1, 0.8]);
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 flex items-center justify-end bg-red-700 px-6"
      >
        <motion.div style={{ scale }}>
          <Trash2 className="h-6 w-6 text-white" aria-hidden="true" />
        </motion.div>
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.2}
        style={{ x, touchAction: "pan-y" }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80)
            props.onDelete(props.notification.id, props.notification.title);
        }}
        className="relative z-10"
      >
        <DesktopNotificationItem {...props} />
      </motion.div>
    </div>
  );
}

import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  EyeIcon,
  EyeOffIcon,
  FloppyDiskIcon,
  Loading03Icon,
  PlugSocketIcon,
  Settings01Icon,
  AiChat02Icon,
  ConnectIcon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

import type { HugeiconsProps } from "@hugeicons/react";

const iconMap = {
  "alert-circle": AlertCircleIcon,
  "checkmark-circle": CheckmarkCircle02Icon,
  "eye": EyeIcon,
  "eye-off": EyeOffIcon,
  "loading": Loading03Icon,
  "plug-socket": PlugSocketIcon,
  "floppy-disk": FloppyDiskIcon,
  "settings": Settings01Icon,
  "ai-chat": AiChat02Icon,
  "connect": ConnectIcon,
} as const;

type IconName = keyof typeof iconMap;

interface IconProps extends Omit<HugeiconsProps, "icon"> {
  name: IconName;
}

export default function Icon({ name, ...props }: IconProps) {
  const selectedIcon = iconMap[name];

  return <HugeiconsIcon icon={selectedIcon} {...props} />;
}
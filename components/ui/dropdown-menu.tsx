import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuContentProps,
  DropdownMenuItem,
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
  DropdownMenuSubContentProps,
  DropdownMenuItemProps,
  DropdownMenuTriggerProps,
  DropdownMenuArrowProps,
} from "@radix-ui/react-dropdown-menu";

export const Dropdown = DropdownMenu;

export const DropdownTrigger = (props: DropdownMenuTriggerProps) => (
  <DropdownMenuTrigger
    {...props}
    className={cn(props.className, "focus:outline-none")}
  />
);

export const DropdownItem = (props: DropdownMenuItemProps) => (
  <DropdownMenuItem
    {...props}
    className={cn(
      props.className,
      "text-xs rounded-sm px-1 h-6 flex items-center relative pl-6 data-[highlighted]:outline-none data-[highlighted]:bg-slate-500"
    )}
  />
);

export const DropdownArrow = (props: DropdownMenuArrowProps) => (
  <DropdownMenuArrow
    {...props}
    className={cn(props.className, "fill-background")}
  />
);

export const DropdownCheckboxItem = DropdownMenuCheckboxItem;

export const DropdownItemIndicator = DropdownMenuItemIndicator;

export const DropdownLabel = DropdownMenuLabel;

export const DropdownRadioGroup = DropdownMenuRadioGroup;

export const DropdownRadioItem = DropdownMenuRadioItem;

export const DropdownSeparator = DropdownMenuSeparator;

export const DropdownSub = DropdownMenuSub;

export const DropdownSubTrigger = DropdownMenuSubTrigger;

export const DropdownSubContent = (props: DropdownMenuSubContentProps) => {
  return (
    <DropdownMenuPortal>
      <DropdownMenuSubContent {...props} />
    </DropdownMenuPortal>
  );
};

export const DropdownGroup = DropdownMenuGroup;

export const DropdownContent = (props: DropdownMenuContentProps) => {
  return (
    <DropdownMenuPortal>
      <DropdownMenuContent
        {...props}
        className={cn(
          props.className,
          "min-w-56 p-1 bg-background rounded-md shadow border border-gray-700"
        )}
      />
    </DropdownMenuPortal>
  );
};

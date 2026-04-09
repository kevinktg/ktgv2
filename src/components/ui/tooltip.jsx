import * as React from "react"

import { cn } from "@/lib/utils"

const TooltipProvider = ({ children }) => <>{children}</>

const Tooltip = ({ children }) => <>{children}</>

const TooltipTrigger = React.forwardRef(({ asChild = false, children, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    const title = children.props?.title ?? children.props?.["aria-label"]

    return React.cloneElement(children, {
      ...props,
      ...children.props,
      ref,
      title,
    })
  }

  return <span ref={ref} {...props}>{children}</span>
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <span ref={ref} className={cn("sr-only", className)} {...props}>
    {children}
  </span>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

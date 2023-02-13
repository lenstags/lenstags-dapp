import * as React from "react"
import { SVGProps } from "react"

export const HeartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={19}
    height={17}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M17.5 9.572 10 17 2.5 9.572m0 0A5 5 0 1 1 10 3.006a5 5 0 1 1 7.5 6.572"
      fill="#000"
    />
  </svg>
)


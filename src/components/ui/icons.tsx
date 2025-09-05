import { Heart } from 'lucide-react'

export { Heart }

export function HeartFilled({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <Heart 
      className={className} 
      fill="currentColor"
      {...props} 
    />
  )
}



import { Montserrat, Poppins, Roboto } from "next/font/google"

export const poppins = Poppins({
  variable: "--font-poppins-loaded",
  weight: "400",
  subsets: ['latin'],
})

export const roboto = Roboto({
  variable: "--font-roboto-loaded",
  weight: "400",
  subsets: ['latin'],
})

export const montserrat = Montserrat({
  variable: "--font-montser",
  weight: "400",
  subsets: ['latin'],
})
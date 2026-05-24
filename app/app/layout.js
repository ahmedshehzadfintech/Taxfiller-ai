export const metadata = {
  title: 'TaxFiller AI',
  description: 'FBR Tax Filing Assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

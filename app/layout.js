import './globals.css'

export const metadata = {
  title: 'TaxFiller AI',
  description: 'FBR Tax Filing Assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Inter font for a clean modern UI */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

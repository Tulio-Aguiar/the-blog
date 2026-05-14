type AboutLayoutProps = {
  children: React.ReactNode
}

export default function AboutLayout({ children }: Readonly<AboutLayoutProps>) {
  return (
    <>
      <h1 className="bg-red-500 text-2xl font-bold text-white">Layout About</h1>
      {children}
    </>
  )
}

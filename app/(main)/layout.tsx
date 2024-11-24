export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen h-full w-full px-72 py-14">{children}</div>
  );
}

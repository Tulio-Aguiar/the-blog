type ContainerProps = {
  children: React.ReactNode;
};

export function Container({ children }: ContainerProps) {
  return (
    <div className="bg-background text-text-primary min-h-screen">
      <div className="mx-auto max-w-screen-lg px-8">{children}</div>
    </div>
  );
}

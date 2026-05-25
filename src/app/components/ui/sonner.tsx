import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-border bg-white text-foreground shadow-[0_12px_30px_rgba(47,107,59,0.12)]",
          title: "font-medium text-foreground",
          description: "text-muted-foreground",
          success: "!border-primary/30 !bg-primary-light !text-primary [&_[data-icon]]:!text-primary",
          error: "!border-destructive/25 !bg-[#FFF6F5] [&_[data-icon]]:!text-destructive",
          warning: "!border-accent/30 !bg-[#FFF9F0] [&_[data-icon]]:!text-accent",
          info: "!border-primary/30 !bg-primary-light !text-primary [&_[data-icon]]:!text-primary",
          closeButton: "!border-border !bg-white !text-muted-foreground hover:!text-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#000000",
          "--normal-border": "#E0E0E0",
          "--success-bg": "var(--primary-light)",
          "--success-text": "var(--primary)",
          "--success-border": "color-mix(in srgb, var(--primary) 30%, transparent)",
          "--error-bg": "#FFF6F5",
          "--error-text": "#B43D36",
          "--error-border": "#F3C9C6",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

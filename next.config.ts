import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig = {
  reactCompiler: true,
  turbopack: {
    root: "./"
  }
};

export default withPWA(nextConfig);

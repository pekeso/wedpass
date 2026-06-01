import nextConfig from 'eslint-config-next/core-web-vitals'

export default [
  ...nextConfig,
  {
    ignores: ["src/generated/**"],
  },
]

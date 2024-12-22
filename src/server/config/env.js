export const env = {
  development: {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:8080'
      ]
    }
  },
  production: {
    cors: {
      origin: [
        'https://pjamqgygqxul.sealoshzh.site'
      ]
    }
  }
}

export const getConfig = () => {
  const environment = process.env.NODE_ENV || 'development'
  return env[environment]
} 
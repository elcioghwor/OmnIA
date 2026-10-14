export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),

  ollama: {
    url: process.env.OLLAMA_URL,
    model: process.env.OLLAMA_MODEL,
  },
});
interface EnvConfig {
  [key: string]: string | undefined;
}

export const envConfig: EnvConfig = {
  INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
  INFURA_SECRET: process.env.INFURA_SECRET,
  AUTH_OPENAI_ORGANIZATION: process.env.AUTH_OPENAI_ORGANIZATION,
  AUTH_OPENAI_APIKEY: process.env.AUTH_OPENAI_APIKEY,
  AUTH_LINKPREVIEW_KEY: process.env.AUTH_LINKPREVIEW_KEY
};

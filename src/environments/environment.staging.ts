export const environment = {
  name: 'Staging',
  production: true,
  hmr: false,
  analytics: {
    enabled: false,
    config: {}
  },
  zendesk: {
    widget: 'https://static.zdassets.com/ekr/snippet.js?key=79b9468a-b37c-4e05-8d5a-9d8d12349f90',
    redirect: 'https://cardihab.zendesk.com/access/jwt?jwt=',
  },
  sentry: {
    dsn: 'https://95accab82aff4321afe02b44d1ae0b20@sentry.io/1390927'
  }
};

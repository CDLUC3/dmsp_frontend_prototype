interface CustomRouter {
  push: (url: string) => void;
}
export const switchLanguage = (
  newLocale: string,
  currentLocale: string,
  pathname: string,
  router: CustomRouter
) => {
  if (newLocale !== currentLocale) {
    const newPath = `/${newLocale}${pathname}`;
    router.push(newPath);
  }
};
export const scrollToTop = (ref: React.MutableRefObject<HTMLDivElement | null>) => {
  if (ref.current) {
    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}

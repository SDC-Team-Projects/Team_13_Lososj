import { useEffect } from "react";
import NProgress from "nprogress";

export function usePageLoader(isLoading) {
  useEffect(() => {
    if (isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }

    return () => {
      NProgress.done();
    };
  }, [isLoading]);
}
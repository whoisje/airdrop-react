import {useEffect} from 'react'
import DOMPurify from 'dompurify'

export const useSafeSetHTML = (
  ref,
  htmlStr = '',
) => {
  useEffect(() => {
    if (ref.current instanceof Element && typeof htmlStr === 'string') {
      // eslint-disable-next-line no-param-reassign
      ref.current.innerHTML = DOMPurify.sanitize(htmlStr)
    }
  }, [htmlStr, ref])
}
